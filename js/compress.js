(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const workspace = document.getElementById('workspace');
  const docNameEl = document.getElementById('docName');
  const levelGroup = document.getElementById('levelGroup');
  const originalSizeEl = document.getElementById('originalSize');
  const estimatedSizeEl = document.getElementById('estimatedSize');
  const previewWrap = document.getElementById('previewWrap');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');
  const changeFileBtn = document.getElementById('changeFileBtn');

  const LEVELS = {
    high: { scale: 1.5, quality: 0.85 },
    balanced: { scale: 1.1, quality: 0.6 },
    small: { scale: 0.85, quality: 0.4 },
  };

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';
  let originalBytes = 0;
  let pdfDocProxy = null;
  let pageCount = 0;
  let currentLevel = 'balanced';

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  function baseName(name) {
    return name.replace(/\.pdf$/i, '');
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  async function renderPreview() {
    if (!pdfDocProxy) return;
    const { scale, quality } = LEVELS[currentLevel];
    const page = await pdfDocProxy.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    previewWrap.innerHTML = '';
    const img = new Image();
    img.src = dataUrl;
    previewWrap.appendChild(img);

    // rough per-page byte estimate from this page's compressed size, scaled to page count
    const approxBytesForPage = Math.round((dataUrl.length * 3) / 4);
    const estimatedTotal = approxBytesForPage * pageCount + 2048; // small PDF overhead
    estimatedSizeEl.textContent = `~${fmtSize(estimatedTotal)}`;
  }

  function selectLevel(level) {
    currentLevel = level;
    document.querySelectorAll('.level-option').forEach((el) => {
      el.classList.toggle('selected', el.dataset.level === level);
    });
    renderPreview();
  }

  levelGroup.addEventListener('change', (e) => {
    if (e.target.name === 'level') selectLevel(e.target.value);
  });
  levelGroup.querySelectorAll('.level-option').forEach((el) => {
    el.addEventListener('click', () => {
      const radio = el.querySelector('input[type="radio"]');
      radio.checked = true;
      selectLevel(el.dataset.level);
    });
  });

  async function loadFile(file) {
    setStatus('reading file…');
    previewWrap.innerHTML = '';

    const arrayBuffer = await file.arrayBuffer();
    sourceArrayBuffer = arrayBuffer;
    sourceFileName = file.name;
    originalBytes = file.size;

    pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    pageCount = pdfDocProxy.numPages;

    docNameEl.textContent = `${file.name} · ${pageCount} pages`;
    originalSizeEl.textContent = fmtSize(originalBytes);
    workspace.classList.add('active');
    actionsBar.classList.add('active');
    downloadBtn.disabled = false;

    await renderPreview();
    setStatus('adjust the level, then compress');
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
    pdfDocProxy = null;
    pageCount = 0;
    previewWrap.innerHTML = '';
    workspace.classList.remove('active');
    actionsBar.classList.remove('active');
    originalSizeEl.textContent = '—';
    estimatedSizeEl.textContent = '—';
    setStatus('');
  });

  // ---- compress + download ----

  downloadBtn.addEventListener('click', async () => {
    if (!pdfDocProxy) return;
    downloadBtn.disabled = true;
    setStatus('compressing pages…');

    try {
      const { PDFDocument } = PDFLib;
      const { scale, quality } = LEVELS[currentLevel];
      const outPdf = await PDFDocument.create();

      for (let i = 1; i <= pageCount; i++) {
        setStatus(`compressing page ${i} of ${pageCount}…`);
        const page = await pdfDocProxy.getPage(i);
        const baseViewport = page.getViewport({ scale: 1 });
        const renderViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = renderViewport.width;
        canvas.height = renderViewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: renderViewport }).promise;

        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        const jpegImage = await outPdf.embedJpg(jpegDataUrl);

        const pageWidth = baseViewport.width;
        const pageHeight = baseViewport.height;
        const newPage = outPdf.addPage([pageWidth, pageHeight]);
        newPage.drawImage(jpegImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }

      const bytes = await outPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}-compressed.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const reduction = originalBytes > 0 ? Math.round((1 - bytes.length / originalBytes) * 100) : 0;
      setStatus(`done — ${fmtSize(bytes.length)} (${reduction}% smaller) downloaded`);
    } catch (err) {
      console.error(err);
      setStatus('compression failed — check the console');
    } finally {
      downloadBtn.disabled = false;
    }
  });

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => loadFile(file));
  }
})();
