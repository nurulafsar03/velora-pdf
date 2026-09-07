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
  const rotateAllLeftBtn = document.getElementById('rotateAllLeftBtn');
  const rotateAllRightBtn = document.getElementById('rotateAllRightBtn');
  const resetBtn = document.getElementById('resetBtn');
  const changeFileBtn = document.getElementById('changeFileBtn');

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';
  let pdfDocProxy = null; // pdf.js document, for re-rendering thumbnails
  let pages = []; // { pageNum, baseRotation, delta, cardEl, canvasEl }

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  function baseName(name) {
    return name.replace(/\.pdf$/i, '');
  }

  function normalizeAngle(a) {
    return ((a % 360) + 360) % 360;
  }

  async function renderPageThumb(pageInfo) {
    const page = await pdfDocProxy.getPage(pageInfo.pageNum);
    const totalRotation = normalizeAngle(pageInfo.baseRotation + pageInfo.delta);
    const viewport = page.getViewport({ scale: 0.32, rotation: totalRotation });
    const canvas = pageInfo.canvasEl;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  }

  function updateCardBadge(pageInfo) {
    const rotated = normalizeAngle(pageInfo.delta) !== 0;
    pageInfo.cardEl.classList.toggle('rotated', rotated);
    const badge = pageInfo.cardEl.querySelector('.rotated-badge');
    if (badge) badge.textContent = `${normalizeAngle(pageInfo.delta)}°`;
  }

  async function rotatePage(pageInfo, deltaChange) {
    pageInfo.delta = normalizeAngle(pageInfo.delta + deltaChange);
    await renderPageThumb(pageInfo);
    updateCardBadge(pageInfo);
  }

  async function loadFile(file) {
    setStatus('reading file…');
    pageGrid.innerHTML = '';
    pages = [];

    const arrayBuffer = await file.arrayBuffer();
    sourceArrayBuffer = arrayBuffer;
    sourceFileName = file.name;

    pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    const pageCount = pdfDocProxy.numPages;

    docNameEl.textContent = `${file.name} · ${pageCount} pages`;
    toolbar.classList.add('active');
    window.VeloraQuickActions.render(document.getElementById('quickActions'), 'rotate.html', async () => {
      if (!hasPendingRotation()) return sourceArrayBuffer;
      return buildRotatedPdf();
    }, () => sourceFileName);
    actionsBar.classList.add('active');

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDocProxy.getPage(i);
      const baseRotation = page.rotate || 0;

      const card = document.createElement('div');
      card.className = 'page-card';

      const canvasWrap = document.createElement('div');
      canvasWrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      canvasWrap.appendChild(canvas);
      card.appendChild(canvasWrap);

      const label = document.createElement('div');
      label.className = 'page-num';
      label.textContent = `Page ${i}`;
      card.appendChild(label);

      const badge = document.createElement('div');
      badge.className = 'rotated-badge';
      card.appendChild(badge);

      const controls = document.createElement('div');
      controls.className = 'rotate-controls';
      const leftBtn = document.createElement('button');
      leftBtn.type = 'button';
      leftBtn.className = 'rotate-btn';
      leftBtn.title = 'Rotate left';
      leftBtn.textContent = '↺';
      const rightBtn = document.createElement('button');
      rightBtn.type = 'button';
      rightBtn.className = 'rotate-btn';
      rightBtn.title = 'Rotate right';
      rightBtn.textContent = '↻';
      controls.appendChild(leftBtn);
      controls.appendChild(rightBtn);
      card.appendChild(controls);

      pageGrid.appendChild(card);

      const pageInfo = { pageNum: i, baseRotation, delta: 0, cardEl: card, canvasEl: canvas };
      pages.push(pageInfo);

      leftBtn.addEventListener('click', () => rotatePage(pageInfo, -90));
      rightBtn.addEventListener('click', () => rotatePage(pageInfo, 90));

      await renderPageThumb(pageInfo);
    }

    setStatus(`${pageCount} pages loaded`);
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
    window.VeloraQuickActions.hide(document.getElementById('quickActions'));
    sourceArrayBuffer = null;
    pdfDocProxy = null;
    pages = [];
    pageGrid.innerHTML = '';
    toolbar.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  rotateAllLeftBtn.addEventListener('click', async () => {
    for (const p of pages) await rotatePage(p, -90);
  });
  rotateAllRightBtn.addEventListener('click', async () => {
    for (const p of pages) await rotatePage(p, 90);
  });
  resetBtn.addEventListener('click', async () => {
    for (const p of pages) {
      p.delta = 0;
      await renderPageThumb(p);
      updateCardBadge(p);
    }
    setStatus('rotation reset');
  });

  // ---- download ----

  async function buildRotatedPdf() {
    const { PDFDocument, degrees } = PDFLib;
    const pdfDoc = await PDFDocument.load(sourceArrayBuffer.slice(0));
    const libPages = pdfDoc.getPages();

    pages.forEach((p) => {
      if (normalizeAngle(p.delta) === 0) return;
      const libPage = libPages[p.pageNum - 1];
      const current = libPage.getRotation().angle || 0;
      const total = normalizeAngle(current + p.delta);
      libPage.setRotation(degrees(total));
    });

    return pdfDoc.save();
  }

  function hasPendingRotation() {
    return pages.some((p) => normalizeAngle(p.delta) !== 0);
  }

  downloadBtn.addEventListener('click', async () => {
    if (!sourceArrayBuffer) return;
    downloadBtn.disabled = true;
    setStatus('applying rotation…');
    try {
      const bytes = await buildRotatedPdf();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}-rotated.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('done — file downloaded');
    } catch (err) {
      console.error(err);
      setStatus('rotation failed — check the console');
    } finally {
      downloadBtn.disabled = false;
    }
  });

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => loadFile(file));
  }
})();
