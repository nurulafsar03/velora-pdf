(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const workspace = document.getElementById('workspace');
  const docNameEl = document.getElementById('docName');
  const previewWrap = document.getElementById('previewWrap');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');
  const changeFileBtn = document.getElementById('changeFileBtn');

  const modeTabs = document.querySelectorAll('.mode-tab');
  const drawPanel = document.getElementById('drawPanel');
  const typePanel = document.getElementById('typePanel');
  const uploadPanel = document.getElementById('uploadPanel');
  const sigPad = document.getElementById('sigPad');
  const clearSigBtn = document.getElementById('clearSigBtn');
  const sigTypeInput = document.getElementById('sigTypeInput');
  const sigUploadInput = document.getElementById('sigUploadInput');
  const uploadFileName = document.getElementById('uploadFileName');
  const colorSwatches = document.getElementById('colorSwatches');
  const pageNumInput = document.getElementById('pageNum');
  const pageOfEl = document.getElementById('pageOf');
  const sigScale = document.getElementById('sigScale');
  const scaleVal = document.getElementById('scaleVal');

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';
  let pdfDocProxy = null;
  let pageCount = 0;
  let currentPage = 1;
  let mode = 'draw';
  let selectedColor = '#16140f';

  let sigDataUrl = null;
  let sigAspect = 1; // height / width of the signature image
  let hasDrawing = false;
  let uploadedCanvas = null; // background-cleaned canvas from an uploaded image

  // overlay position/size, in percentage of the preview container
  let posX = 30; // left %, top-left corner
  let posY = 40; // top %
  let widthPct = 30;

  let basePageCanvas = null;
  let sigOverlayEl = null;

  function setStatus(msg) { statusText.textContent = msg; }
  function baseName(name) { return name.replace(/\.pdf$/i, ''); }

  // ---- mode tabs ----
  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      mode = tab.dataset.mode;
      modeTabs.forEach((t) => t.classList.toggle('selected', t === tab));
      drawPanel.classList.toggle('active', mode === 'draw');
      typePanel.classList.toggle('active', mode === 'type');
      uploadPanel.classList.toggle('active', mode === 'upload');
      regenerateSignature();
    });
  });

  colorSwatches.querySelectorAll('.swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      selectedColor = sw.dataset.color;
      colorSwatches.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('selected', s === sw));
      if (mode === 'draw') redrawSigPadStroke(); // recolor existing strokes isn't trivial; just affects new strokes
      regenerateSignature();
    });
  });

  // ---- signature pad (draw mode) ----
  const padCtx = sigPad.getContext('2d');
  let drawing = false;
  let lastPoint = null;
  let strokes = []; // array of {color, points:[{x,y}]}

  function resizeSigPad() {
    const rect = sigPad.getBoundingClientRect();
    sigPad.width = rect.width * 2;
    sigPad.height = rect.height * 2;
    padCtx.scale(2, 2);
    redrawSigPadStroke();
  }

  function getPadPoint(e) {
    const rect = sigPad.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function redrawSigPadStroke() {
    padCtx.clearRect(0, 0, sigPad.width, sigPad.height);
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      padCtx.strokeStyle = stroke.color;
      padCtx.lineWidth = 3;
      padCtx.lineCap = 'round';
      padCtx.lineJoin = 'round';
      padCtx.beginPath();
      padCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.slice(1).forEach((p) => padCtx.lineTo(p.x, p.y));
      padCtx.stroke();
    });
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    const p = getPadPoint(e);
    strokes.push({ color: selectedColor, points: [p] });
    lastPoint = p;
  }
  function moveDraw(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPadPoint(e);
    strokes[strokes.length - 1].points.push(p);
    redrawSigPadStroke();
    lastPoint = p;
  }
  function endDraw() {
    if (!drawing) return;
    drawing = false;
    hasDrawing = strokes.some((s) => s.points.length > 1);
    regenerateSignature();
  }

  sigPad.addEventListener('mousedown', startDraw);
  sigPad.addEventListener('mousemove', moveDraw);
  window.addEventListener('mouseup', endDraw);
  sigPad.addEventListener('touchstart', startDraw, { passive: false });
  sigPad.addEventListener('touchmove', moveDraw, { passive: false });
  sigPad.addEventListener('touchend', endDraw);

  clearSigBtn.addEventListener('click', () => {
    strokes = [];
    hasDrawing = false;
    redrawSigPadStroke();
    regenerateSignature();
  });

  sigTypeInput.addEventListener('input', () => regenerateSignature());

  sigUploadInput.addEventListener('change', async () => {
    const file = sigUploadInput.files[0];
    if (!file) return;
    uploadFileName.textContent = file.name;

    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Remove light/white backgrounds so a photographed signature
      // overlays cleanly, similar to a transparent PNG.
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const WHITE_CUTOFF = 235;
      const FADE_START = 195;
      for (let i = 0; i < data.length; i += 4) {
        const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (luminance >= WHITE_CUTOFF) {
          data[i + 3] = 0;
        } else if (luminance > FADE_START) {
          const t = (luminance - FADE_START) / (WHITE_CUTOFF - FADE_START);
          data[i + 3] = Math.round(data[i + 3] * (1 - t));
        }
      }
      ctx.putImageData(imageData, 0, 0);

      uploadedCanvas = canvas;
      regenerateSignature();
    };
    img.src = dataUrl;
  });

  // ---- signature image generation ----

  function trimCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 10) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (!found) return null;
    const pad = 6;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width, maxX + pad);
    maxY = Math.min(height, maxY + pad);
    const trimmed = document.createElement('canvas');
    trimmed.width = maxX - minX;
    trimmed.height = maxY - minY;
    trimmed.getContext('2d').drawImage(canvas, minX, minY, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);
    return trimmed;
  }

  async function regenerateSignature() {
    let canvas = null;

    if (mode === 'draw' && hasDrawing) {
      canvas = trimCanvas(sigPad);
    } else if (mode === 'upload' && uploadedCanvas) {
      canvas = trimCanvas(uploadedCanvas);
    } else if (mode === 'type' && sigTypeInput.value.trim()) {
      try {
        await document.fonts.load("700 80px 'Caveat'");
      } catch (e) { /* font may already be loaded */ }
      const text = sigTypeInput.value;
      const measureCanvas = document.createElement('canvas');
      const mctx = measureCanvas.getContext('2d');
      mctx.font = "700 80px 'Caveat', cursive";
      const textWidth = mctx.measureText(text).width;

      canvas = document.createElement('canvas');
      canvas.width = textWidth + 40;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.font = "700 80px 'Caveat', cursive";
      ctx.fillStyle = selectedColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 20, 65);
    }

    if (canvas) {
      sigDataUrl = canvas.toDataURL('image/png');
      sigAspect = canvas.height / canvas.width;
      updateOverlay();
    } else {
      sigDataUrl = null;
      if (sigOverlayEl) sigOverlayEl.style.display = 'none';
    }
    validateDownload();
  }

  function validateDownload() {
    downloadBtn.disabled = !sigDataUrl || !basePageCanvas;
  }

  // ---- preview + drag ----

  function updateOverlay() {
    if (!previewWrap.querySelector('canvas')) return;
    if (!sigOverlayEl) {
      sigOverlayEl = document.createElement('div');
      sigOverlayEl.className = 'sig-overlay';
      const img = document.createElement('img');
      sigOverlayEl.appendChild(img);
      previewWrap.appendChild(sigOverlayEl);
      wireDrag(sigOverlayEl);
    }
    if (!sigDataUrl) {
      sigOverlayEl.style.display = 'none';
      return;
    }
    sigOverlayEl.style.display = 'block';
    sigOverlayEl.querySelector('img').src = sigDataUrl;
    sigOverlayEl.style.left = `${posX}%`;
    sigOverlayEl.style.top = `${posY}%`;
    sigOverlayEl.style.width = `${widthPct}%`;
    sigOverlayEl.style.height = `${widthPct * sigAspect * (previewWrap.clientWidth / previewWrap.clientHeight)}%`;
  }

  function wireDrag(el) {
    let dragging = false;
    let offsetX = 0, offsetY = 0;

    function pointerDown(e) {
      dragging = true;
      const rect = previewWrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      offsetX = clientX - rect.left - (posX / 100) * rect.width;
      offsetY = clientY - rect.top - (posY / 100) * rect.height;
      e.preventDefault();
    }
    function pointerMove(e) {
      if (!dragging) return;
      const rect = previewWrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      let newX = ((clientX - rect.left - offsetX) / rect.width) * 100;
      let newY = ((clientY - rect.top - offsetY) / rect.height) * 100;
      newX = Math.max(0, Math.min(100 - widthPct, newX));
      const heightPct = widthPct * sigAspect * (rect.width / rect.height);
      newY = Math.max(0, Math.min(100 - heightPct, newY));
      posX = newX;
      posY = newY;
      updateOverlay();
    }
    function pointerUp() { dragging = false; }

    el.addEventListener('mousedown', pointerDown);
    window.addEventListener('mousemove', pointerMove);
    window.addEventListener('mouseup', pointerUp);
    el.addEventListener('touchstart', pointerDown, { passive: false });
    window.addEventListener('touchmove', pointerMove, { passive: false });
    window.addEventListener('touchend', pointerUp);
  }

  sigScale.addEventListener('input', () => {
    widthPct = parseInt(sigScale.value, 10);
    scaleVal.textContent = `${widthPct}%`;
    updateOverlay();
  });

  async function renderBasePage(pageNum) {
    const page = await pdfDocProxy.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.3 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    basePageCanvas = canvas;

    previewWrap.innerHTML = '';
    previewWrap.appendChild(canvas);
    sigOverlayEl = null;
    updateOverlay();
    validateDownload();
  }

  pageNumInput.addEventListener('change', () => {
    let n = parseInt(pageNumInput.value, 10) || 1;
    n = Math.max(1, Math.min(pageCount, n));
    pageNumInput.value = n;
    currentPage = n;
    renderBasePage(n);
  });

  // ---- file loading ----

  async function loadFile(file) {
    setStatus('reading file…');
    previewWrap.innerHTML = '';
    sigOverlayEl = null;

    const arrayBuffer = await file.arrayBuffer();
    sourceArrayBuffer = arrayBuffer;
    sourceFileName = file.name;

    pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    pageCount = pdfDocProxy.numPages;
    currentPage = 1;

    docNameEl.textContent = file.name;
    pageNumInput.value = 1;
    pageNumInput.max = pageCount;
    pageOfEl.textContent = `of ${pageCount}`;

    workspace.classList.add('active');
    actionsBar.classList.add('active');

    resizeSigPad();
    await renderBasePage(1);
    setStatus('draw or type your signature, then drag it into place');
  }

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
    basePageCanvas = null;
    sigOverlayEl = null;
    uploadedCanvas = null;
    previewWrap.innerHTML = '';
    workspace.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  window.addEventListener('resize', () => {
    if (sigPad.offsetWidth) resizeSigPad();
  });

  // ---- download ----

  downloadBtn.addEventListener('click', async () => {
    if (!sourceArrayBuffer || !sigDataUrl) return;
    downloadBtn.disabled = true;
    setStatus('placing signature…');

    try {
      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.load(sourceArrayBuffer.slice(0));
      const pages = pdfDoc.getPages();
      const targetPage = pages[currentPage - 1];
      const { width, height } = targetPage.getSize();

      const pngImage = await pdfDoc.embedPng(sigDataUrl);
      const imgWidthPts = width * (widthPct / 100);
      const imgHeightPts = imgWidthPts * sigAspect;

      const xPts = width * (posX / 100);
      const yFromTopPts = height * (posY / 100);
      const yPts = height - yFromTopPts - imgHeightPts;

      targetPage.drawImage(pngImage, {
        x: xPts,
        y: yPts,
        width: imgWidthPts,
        height: imgHeightPts,
      });

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}-signed.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('done — signed file downloaded');
    } catch (err) {
      console.error(err);
      setStatus('failed — check the console');
    } finally {
      validateDownload();
    }
  });

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => loadFile(file));
  }
})();
