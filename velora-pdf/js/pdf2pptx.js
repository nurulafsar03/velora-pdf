(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const pageGrid = document.getElementById('pageGrid');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');
  const quickActions = document.getElementById('quickActions');

  let pdfDocProxy = null;
  let sourceFileName = 'document';
  let sourceArrayBuffer = null;
  let pageCount = 0;

  function setStatus(msg) { statusText.textContent = msg; }
  function baseName(name) { return name.replace(/\.pdf$/i, ''); }

  async function renderThumbnails() {
    pageGrid.innerHTML = '';
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDocProxy.getPage(i);
      const thumbViewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      canvas.width = thumbViewport.width;
      canvas.height = thumbViewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: thumbViewport }).promise;

      const card = document.createElement('div');
      card.className = 'page-card';
      card.appendChild(canvas);
      const label = document.createElement('div');
      label.className = 'page-num';
      label.textContent = `Slide ${i}`;
      card.appendChild(label);
      pageGrid.appendChild(card);
    }
  }

  async function buildPptxBlob() {
    const pptx = new window.PptxGenJS();
    const MAX_DIM = 2200;

    const firstPage = await pdfDocProxy.getPage(1);
    const firstViewport = firstPage.getViewport({ scale: 1 });
    const widthIn = firstViewport.width / 72;
    const heightIn = firstViewport.height / 72;
    pptx.defineLayout({ name: 'PDF_LAYOUT', width: widthIn, height: heightIn });
    pptx.layout = 'PDF_LAYOUT';

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDocProxy.getPage(i);
      const baseViewport = page.getViewport({ scale: 1 });
      const longEdge = Math.max(baseViewport.width, baseViewport.height);
      const scale = Math.min(2, MAX_DIM / longEdge);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      // Fit this page's own image into the fixed presentation-wide slide
      // size, centered, in case a later page has a different aspect ratio.
      const pageWidthIn = baseViewport.width / 72;
      const pageHeightIn = baseViewport.height / 72;
      const fitScale = Math.min(widthIn / pageWidthIn, heightIn / pageHeightIn);
      const drawW = pageWidthIn * fitScale;
      const drawH = pageHeightIn * fitScale;
      const offsetX = (widthIn - drawW) / 2;
      const offsetY = (heightIn - drawH) / 2;

      const slide = pptx.addSlide();
      slide.addImage({ data: dataUrl, x: offsetX, y: offsetY, w: drawW, h: drawH });
    }

    return pptx.write({ outputType: 'blob' });
  }

  async function loadFile(file) {
    setStatus('reading file…');
    pageGrid.innerHTML = '';

    const arrayBuffer = await file.arrayBuffer();
    sourceArrayBuffer = arrayBuffer;
    sourceFileName = file.name;

    pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    pageCount = pdfDocProxy.numPages;

    docNameEl.textContent = `${file.name} · ${pageCount} pages`;
    toolbar.classList.add('active');
    actionsBar.classList.add('active');
    downloadBtn.disabled = false;

    window.VeloraQuickActions.render(quickActions, 'pdf2pptx.html', () => sourceArrayBuffer, () => sourceFileName);

    await renderThumbnails();
    setStatus('ready to convert');
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('drag-over'); })
  );
  dropzone.addEventListener('drop', (e) => {
    const file = Array.from(e.dataTransfer.files || []).find(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (file) loadFile(file);
  });

  changeFileBtn.addEventListener('click', () => {
    window.VeloraQuickActions.hide(quickActions);
    pdfDocProxy = null;
    pageCount = 0;
    pageGrid.innerHTML = '';
    toolbar.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  downloadBtn.addEventListener('click', async () => {
    if (!pdfDocProxy) return;
    downloadBtn.disabled = true;
    setStatus('building PowerPoint — this can take a moment for large PDFs…');
    try {
      const blob = await buildPptxBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('done — PowerPoint downloaded');
    } catch (err) {
      console.error(err);
      setStatus('conversion failed — check the console');
    } finally {
      downloadBtn.disabled = false;
    }
  });

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => loadFile(file));
  }
})();
