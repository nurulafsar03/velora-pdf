(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');
  const convertBtn = document.getElementById('convertBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusText = document.getElementById('statusText');

  // Each entry: { id, name, sizeLabel, arrayBuffer, type: 'jpg'|'png', thumbDataUrl, naturalW, naturalH }
  let images = [];
  let dragSrcId = null;

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function setStatus(msg) { statusText.textContent = msg; }

  function updateActionState() {
    convertBtn.disabled = images.length < 1;
    clearBtn.style.display = images.length ? 'inline-block' : 'none';
    setStatus(images.length ? `${images.length} image${images.length > 1 ? 's' : ''}` : '');
  }

  function renderList() {
    fileList.innerHTML = '';
    images.forEach((img, i) => {
      const card = document.createElement('div');
      card.className = 'file-card';
      card.draggable = true;
      card.dataset.id = img.id;

      card.innerHTML = `
        <div class="order-badge">${i + 1}</div>
        <button class="remove-btn" title="Remove" aria-label="Remove ${img.name}">&times;</button>
        <img class="thumb" src="${img.thumbDataUrl}" alt="">
        <div class="fname" title="${img.name}">${img.name}</div>
        <div class="fmeta">${img.naturalW}&times;${img.naturalH} &middot; ${img.sizeLabel}</div>
      `;

      card.querySelector('.remove-btn').addEventListener('click', (e) => {
        e.preventDefault();
        images = images.filter((x) => x.id !== img.id);
        renderList();
        updateActionState();
      });

      card.addEventListener('dragstart', () => {
        dragSrcId = img.id;
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.file-card').forEach((c) => c.classList.remove('drag-target'));
      });
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (img.id !== dragSrcId) card.classList.add('drag-target');
      });
      card.addEventListener('dragleave', () => card.classList.remove('drag-target'));
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-target');
        if (dragSrcId === null || dragSrcId === img.id) return;
        const srcIndex = images.findIndex((x) => x.id === dragSrcId);
        const targetIndex = images.findIndex((x) => x.id === img.id);
        const [moved] = images.splice(srcIndex, 1);
        images.splice(targetIndex, 0, moved);
        dragSrcId = null;
        renderList();
      });

      fileList.appendChild(card);
    });
  }

  async function addFiles(fileArray) {
    const imgFiles = fileArray.filter((f) => f.type === 'image/jpeg' || f.type === 'image/png');
    if (!imgFiles.length) return;

    setStatus(`reading ${imgFiles.length} image${imgFiles.length > 1 ? 's' : ''}…`);

    for (const file of imgFiles) {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        const dims = await new Promise((resolve) => {
          const im = new Image();
          im.onload = () => resolve({ w: im.width, h: im.height });
          im.src = dataUrl;
        });

        images.push({
          id,
          name: file.name,
          sizeLabel: fmtSize(file.size),
          arrayBuffer,
          type: file.type === 'image/png' ? 'png' : 'jpg',
          thumbDataUrl: dataUrl,
          naturalW: dims.w,
          naturalH: dims.h,
        });
        renderList();
        updateActionState();
      } catch (err) {
        console.error('Failed to read', file.name, err);
        setStatus(`couldn't read "${file.name}"`);
      }
    }
    updateActionState();
  }

  fileInput.addEventListener('change', () => {
    addFiles(Array.from(fileInput.files));
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
    })
  );
  dropzone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files || []);
    addFiles(files);
  });

  clearBtn.addEventListener('click', () => {
    images = [];
    renderList();
    updateActionState();
  });

  convertBtn.addEventListener('click', async () => {
    if (!images.length) return;
    convertBtn.disabled = true;
    setStatus('building PDF…');

    try {
      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        const embedded = img.type === 'png'
          ? await pdfDoc.embedPng(img.arrayBuffer)
          : await pdfDoc.embedJpg(img.arrayBuffer);

        // Treat image pixels as 96dpi and convert to PDF points (72dpi).
        const pageWidth = img.naturalW * 0.75;
        const pageHeight = img.naturalH * 0.75;
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(embedded, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('done — images.pdf downloaded');
    } catch (err) {
      console.error(err);
      setStatus('conversion failed — check the console');
    } finally {
      convertBtn.disabled = images.length === 0;
    }
  });

  updateActionState();
})();
