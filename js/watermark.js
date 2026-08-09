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
  const textPanel = document.getElementById('textPanel');
  const imagePanel = document.getElementById('imagePanel');

  const wmText = document.getElementById('wmText');
  const colorSwatches = document.getElementById('colorSwatches');
  const wmSize = document.getElementById('wmSize');
  const sizeVal = document.getElementById('sizeVal');
  const wmOpacity = document.getElementById('wmOpacity');
  const opacityVal = document.getElementById('opacityVal');
  const wmRotation = document.getElementById('wmRotation');
  const rotationVal = document.getElementById('rotationVal');

  const wmImageInput = document.getElementById('wmImageInput');
  const imageFileName = document.getElementById('imageFileName');
  const wmImgOpacity = document.getElementById('wmImgOpacity');
  const imgOpacityVal = document.getElementById('imgOpacityVal');
  const wmImgScale = document.getElementById('wmImgScale');
  const imgScaleVal = document.getElementById('imgScaleVal');

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';
  let pdfDocProxy = null;
  let pageCount = 0;
  let basePageCanvas = null; // rendered page 1, reused as preview background

  let mode = 'text';
  let selectedColor = '#6f97c9';
  let logoImage = null; // { dataUrl, arrayBuffer, type: 'png'|'jpg', naturalW, naturalH }

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  function baseName(name) {
    return name.replace(/\.pdf$/i, '');
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  }

  // ---- mode tabs ----
  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      mode = tab.dataset.mode;
      modeTabs.forEach((t) => t.classList.toggle('selected', t === tab));
      textPanel.classList.toggle('active', mode === 'text');
      imagePanel.classList.toggle('active', mode === 'image');
      drawPreview();
    });
  });

  colorSwatches.querySelectorAll('.swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      selectedColor = sw.dataset.color;
      colorSwatches.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('selected', s === sw));
      drawPreview();
    });
  });

  [wmText, wmSize, wmOpacity, wmRotation, wmImgOpacity, wmImgScale].forEach((el) => {
    el.addEventListener('input', () => {
      sizeVal.textContent = wmSize.value;
      opacityVal.textContent = `${wmOpacity.value}%`;
      rotationVal.textContent = `${wmRotation.value}°`;
      imgOpacityVal.textContent = `${wmImgOpacity.value}%`;
      imgScaleVal.textContent = `${wmImgScale.value}%`;
      drawPreview();
    });
  });

  wmImageInput.addEventListener('change', async () => {
    const file = wmImageInput.files[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    const img = new Image();
    img.onload = () => {
      logoImage = {
        dataUrl,
        arrayBuffer,
        type: file.type.includes('png') ? 'png' : 'jpg',
        naturalW: img.width,
        naturalH: img.height,
        el: img,
      };
      imageFileName.textContent = file.name;
      drawPreview();
    };
    img.src = dataUrl;
  });

  function drawPreview() {
    if (!basePageCanvas) return;
    const canvas = document.createElement('canvas');
    canvas.width = basePageCanvas.width;
    canvas.height = basePageCanvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(basePageCanvas, 0, 0);

    if (mode === 'text' && wmText.value.trim()) {
      const size = parseInt(wmSize.value, 10) * (canvas.width / 800);
      const opacity = parseInt(wmOpacity.value, 10) / 100;
      const rotation = parseInt(wmRotation.value, 10);
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = selectedColor;
      ctx.font = `bold ${size}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(wmText.value, 0, 0);
      ctx.restore();
    } else if (mode === 'image' && logoImage) {
      const opacity = parseInt(wmImgOpacity.value, 10) / 100;
      const scalePct = parseInt(wmImgScale.value, 10) / 100;
      const targetW = canvas.width * scalePct;
      const targetH = targetW * (logoImage.naturalH / logoImage.naturalW);
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(logoImage.el, (canvas.width - targetW) / 2, (canvas.height - targetH) / 2, targetW, targetH);
      ctx.restore();
    }

    previewWrap.innerHTML = '';
    previewWrap.appendChild(canvas);
  }

  async function loadFile(file) {
    setStatus('reading file…');
    previewWrap.innerHTML = '';

    const arrayBuffer = await file.arrayBuffer();
    sourceArrayBuffer = arrayBuffer;
    sourceFileName = file.name;

    pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    pageCount = pdfDocProxy.numPages;

    docNameEl.textContent = `${file.name} · ${pageCount} pages`;
    workspace.classList.add('active');
    actionsBar.classList.add('active');
    downloadBtn.disabled = false;

    const page = await pdfDocProxy.getPage(1);
    const viewport = page.getViewport({ scale: 1.2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    basePageCanvas = canvas;

    drawPreview();
    setStatus('adjust the watermark, then download');
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
    previewWrap.innerHTML = '';
    workspace.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  // ---- download ----

  downloadBtn.addEventListener('click', async () => {
    if (!sourceArrayBuffer) return;
    downloadBtn.disabled = true;
    setStatus('applying watermark…');

    try {
      const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;
      const pdfDoc = await PDFDocument.load(sourceArrayBuffer.slice(0));
      const pages = pdfDoc.getPages();

      if (mode === 'text' && wmText.value.trim()) {
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const text = wmText.value;
        const size = parseFloat(wmSize.value);
        const opacity = parseInt(wmOpacity.value, 10) / 100;
        const rotation = parseInt(wmRotation.value, 10);
        const { r, g, b } = hexToRgb(selectedColor);
        const textWidth = font.widthOfTextAtSize(text, size);

        pages.forEach((page) => {
          const { width, height } = page.getSize();
          page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: height / 2,
            size,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(rotation),
          });
        });
      } else if (mode === 'image' && logoImage) {
        const embedded = logoImage.type === 'png'
          ? await pdfDoc.embedPng(logoImage.arrayBuffer)
          : await pdfDoc.embedJpg(logoImage.arrayBuffer);
        const opacity = parseInt(wmImgOpacity.value, 10) / 100;
        const scalePct = parseInt(wmImgScale.value, 10) / 100;

        pages.forEach((page) => {
          const { width, height } = page.getSize();
          const targetW = width * scalePct;
          const targetH = targetW * (logoImage.naturalH / logoImage.naturalW);
          page.drawImage(embedded, {
            x: (width - targetW) / 2,
            y: (height - targetH) / 2,
            width: targetW,
            height: targetH,
            opacity,
          });
        });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}-watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('done — file downloaded');
    } catch (err) {
      console.error(err);
      setStatus('failed — check the console');
    } finally {
      downloadBtn.disabled = false;
    }
  });
})();
