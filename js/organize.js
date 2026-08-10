(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const pageGrid = document.getElementById('pageGrid');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');
  const changeFileBtn = document.getElementById('changeFileBtn');

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';
  // pages: ordered array reflecting current visual order.
  // Each entry: { id, originalIndex (0-based in source pdf), thumbDataUrl }
  let pages = [];
  let dragSrcId = null;

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  function baseName(name) {
    return name.replace(/\.pdf$/i, '');
  }

  function updateActionState() {
    downloadBtn.disabled = pages.length === 0;
    setStatus(pages.length ? `${pages.length} pages` : 'all pages removed');
  }

  function renderList() {
    pageGrid.innerHTML = '';
    pages.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'page-card';
      card.draggable = true;
      card.dataset.id = p.id;

      card.innerHTML = `
        <div class="order-badge">${i + 1}</div>
        <button class="remove-btn" title="Remove" aria-label="Remove page ${p.originalIndex + 1}">&times;</button>
        <div class="canvas-wrap"><canvas></canvas></div>
        <div class="page-num">Page ${p.originalIndex + 1}</div>
      `;

      const canvasEl = card.querySelector('canvas');
      if (p.thumbDataUrl) {
        const img = new Image();
        img.onload = () => {
          canvasEl.width = img.width;
          canvasEl.height = img.height;
          canvasEl.getContext('2d').drawImage(img, 0, 0);
        };
        img.src = p.thumbDataUrl;
      }

      card.querySelector('.remove-btn').addEventListener('click', (e) => {
        e.preventDefault();
        pages = pages.filter((x) => x.id !== p.id);
        renderList();
        updateActionState();
      });

      card.addEventListener('dragstart', () => {
        dragSrcId = p.id;
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.page-card').forEach((c) => c.classList.remove('drag-target'));
      });
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (p.id !== dragSrcId) card.classList.add('drag-target');
      });
      card.addEventListener('dragleave', () => card.classList.remove('drag-target'));
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-target');
        if (dragSrcId === null || dragSrcId === p.id) return;
        const srcIndex = pages.findIndex((x) => x.id === dragSrcId);
        const targetIndex = pages.findIndex((x) => x.id === p.id);
        const [moved] = pages.splice(srcIndex, 1);
        pages.splice(targetIndex, 0, moved);
        dragSrcId = null;
        renderList();
      });

      pageGrid.appendChild(card);
    });
  }

  async function loadFile(file) {
    setStatus('reading file…');
    pageGrid.innerHTML = '';
    pages = [];

    const arrayBuffer = await file.arrayBuffer();
    sourceArrayBuffer = arrayBuffer;
    sourceFileName = file.name;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    const pageCount = pdf.numPages;

    docNameEl.textContent = `${file.name} · ${pageCount} pages`;
    toolbar.classList.add('active');
    actionsBar.classList.add('active');

    for (let i = 0; i < pageCount; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: 0.32 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

      pages.push({
        id: `p${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        originalIndex: i,
        thumbDataUrl: canvas.toDataURL(),
      });
    }

    renderList();
    updateActionState();
  }

  // ---- drop zone wiring ----

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
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
    const file = Array.from(e.dataTransfer.files || []).find(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (file) loadFile(file);
  });

  changeFileBtn.addEventListener('click', () => {
    sourceArrayBuffer = null;
    pages = [];
    pageGrid.innerHTML = '';
    toolbar.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  // ---- download ----

  downloadBtn.addEventListener('click', async () => {
    if (!pages.length) return;
    downloadBtn.disabled = true;
    setStatus('building PDF…');
    try {
      const { PDFDocument } = PDFLib;
      const srcPdf = await PDFDocument.load(sourceArrayBuffer.slice(0));
      const outPdf = await PDFDocument.create();

      const indices = pages.map((p) => p.originalIndex);
      const copiedPages = await outPdf.copyPages(srcPdf, indices);
      copiedPages.forEach((p) => outPdf.addPage(p));

      const bytes = await outPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}-organized.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('done — file downloaded');
    } catch (err) {
      console.error(err);
      setStatus('failed — check the console');
    } finally {
      downloadBtn.disabled = pages.length === 0;
    }
  });

  updateActionState();

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => loadFile(file));
  }
})();
