(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');
  const mergeBtn = document.getElementById('mergeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusText = document.getElementById('statusText');

  // Each entry: { id, name, sizeLabel, arrayBuffer, pageCount, thumbDataUrl }
  let docs = [];
  let dragSrcId = null;

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  function updateActionState() {
    mergeBtn.disabled = docs.length < 2;
    clearBtn.style.display = docs.length ? 'inline-block' : 'none';
    if (docs.length === 0) setStatus('');
    else if (docs.length === 1) setStatus('add one more PDF to merge');
    else setStatus(`${docs.length} files · ${docs.reduce((s, d) => s + d.pageCount, 0)} pages total`);
  }

  async function renderThumbnail(arrayBuffer) {
    // pdfjs takes ownership of the buffer it's given; hand it a copy.
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.4 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    return { dataUrl: canvas.toDataURL(), pageCount: pdf.numPages };
  }

  function renderList() {
    fileList.innerHTML = '';
    docs.forEach((doc, i) => {
      const card = document.createElement('div');
      card.className = 'file-card';
      card.draggable = true;
      card.dataset.id = doc.id;

      card.innerHTML = `
        <div class="order-badge">${i + 1}</div>
        <button class="remove-btn" title="Remove" aria-label="Remove ${doc.name}">&times;</button>
        <canvas></canvas>
        <div class="fname" title="${doc.name}">${doc.name}</div>
        <div class="fmeta">${doc.pageCount} pg · ${doc.sizeLabel}</div>
      `;

      const canvasEl = card.querySelector('canvas');
      if (doc.thumbDataUrl) {
        const img = new Image();
        img.onload = () => {
          canvasEl.width = img.width;
          canvasEl.height = img.height;
          canvasEl.getContext('2d').drawImage(img, 0, 0);
        };
        img.src = doc.thumbDataUrl;
      }

      card.querySelector('.remove-btn').addEventListener('click', (e) => {
        e.preventDefault();
        docs = docs.filter((d) => d.id !== doc.id);
        renderList();
        updateActionState();
      });

      card.addEventListener('dragstart', () => {
        dragSrcId = doc.id;
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.file-card').forEach((c) => c.classList.remove('drag-target'));
      });
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (doc.id !== dragSrcId) card.classList.add('drag-target');
      });
      card.addEventListener('dragleave', () => card.classList.remove('drag-target'));
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-target');
        if (dragSrcId === null || dragSrcId === doc.id) return;
        const srcIndex = docs.findIndex((d) => d.id === dragSrcId);
        const targetIndex = docs.findIndex((d) => d.id === doc.id);
        const [moved] = docs.splice(srcIndex, 1);
        docs.splice(targetIndex, 0, moved);
        dragSrcId = null;
        renderList();
      });

      fileList.appendChild(card);
    });
  }

  async function addFiles(fileArray) {
    const pdfFiles = fileArray.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (!pdfFiles.length) return;

    setStatus(`reading ${pdfFiles.length} file${pdfFiles.length > 1 ? 's' : ''}…`);

    for (const file of pdfFiles) {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { dataUrl, pageCount } = await renderThumbnail(arrayBuffer);
        docs.push({
          id,
          name: file.name,
          sizeLabel: fmtSize(file.size),
          arrayBuffer,
          pageCount,
          thumbDataUrl: dataUrl,
        });
        renderList();
        updateActionState();
      } catch (err) {
        console.error('Failed to read', file.name, err);
        setStatus(`couldn't read "${file.name}" — is it a valid PDF?`);
      }
    }
    updateActionState();
  }

  // ---- drop zone wiring ----

  dropzone.addEventListener('click', (e) => {
    if (e.target === fileInput) return;
  });

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

  // ---- clear ----

  clearBtn.addEventListener('click', () => {
    docs = [];
    renderList();
    updateActionState();
  });

  // ---- merge ----

  mergeBtn.addEventListener('click', async () => {
    if (docs.length < 2) return;
    mergeBtn.disabled = true;
    setStatus('merging…');

    try {
      const { PDFDocument } = PDFLib;
      const mergedPdf = await PDFDocument.create();

      for (const doc of docs) {
        const srcPdf = await PDFDocument.load(doc.arrayBuffer.slice(0));
        const pageIndices = srcPdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);
        copiedPages.forEach((p) => mergedPdf.addPage(p));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('done — merged.pdf downloaded');
    } catch (err) {
      console.error(err);
      setStatus('merge failed — check the console for details');
    } finally {
      mergeBtn.disabled = docs.length < 2;
    }
  });

  updateActionState();

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => addFiles([file]));
  }
})();
