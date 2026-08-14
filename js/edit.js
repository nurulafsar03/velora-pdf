(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const pageNumInput = document.getElementById('pageNum');
  const pageOfEl = document.getElementById('pageOf');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const addTextBtn = document.getElementById('addTextBtn');
  const addWhiteoutBtn = document.getElementById('addWhiteoutBtn');
  const addHighlightBtn = document.getElementById('addHighlightBtn');
  const highlightTextBtn = document.getElementById('highlightTextBtn');
  const underlineBtn = document.getElementById('underlineBtn');
  const strikethroughBtn = document.getElementById('strikethroughBtn');
  const textMarkControls = document.getElementById('textMarkControls');
  const textMarkSwatches = document.getElementById('textMarkSwatches');
  const textMarkColorPicker = document.getElementById('textMarkColorPicker');
  const textMarkDoneBtn = document.getElementById('textMarkDoneBtn');
  const drawToolBtn = document.getElementById('drawToolBtn');
  const drawControls = document.getElementById('drawControls');
  const drawColorPicker = document.getElementById('drawColorPicker');
  const strokeSelect = document.getElementById('strokeSelect');
  const strokeVal = document.getElementById('strokeVal');
  strokeSelect.addEventListener('input', () => {
    strokeVal.textContent = `${strokeSelect.value}pt`;
  });
  const clearDrawingBtn = document.getElementById('clearDrawingBtn');
  const doneDrawingBtn = document.getElementById('doneDrawingBtn');
  const drawControlsGrip = document.getElementById('drawControlsGrip');
  const shapeToolBtn = document.getElementById('shapeToolBtn');
  const shapePopover = document.getElementById('shapePopover');
  const imageToolBtn = document.getElementById('imageToolBtn');
  const imageInput = document.getElementById('imageInput');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const workspace = document.getElementById('workspace');
  const previewWrap = document.getElementById('previewWrap');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const viewPrintBtn = document.getElementById('viewPrintBtn');
  const statusText = document.getElementById('statusText');
  const printModal = document.getElementById('printModal');
  const printPagesWrap = document.getElementById('printPagesWrap');
  const closePrintModalBtn = document.getElementById('closePrintModalBtn');
  const printNowBtn = document.getElementById('printNowBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const zoomPctLabel = document.getElementById('zoomPctLabel');
  const headerFooterBtn = document.getElementById('headerFooterBtn');
  const hfModal = document.getElementById('headerFooterModal');
  const hfHeaderLeft = document.getElementById('hfHeaderLeft');
  const hfHeaderCenter = document.getElementById('hfHeaderCenter');
  const hfHeaderRight = document.getElementById('hfHeaderRight');
  const hfFooterLeft = document.getElementById('hfFooterLeft');
  const hfFooterCenter = document.getElementById('hfFooterCenter');
  const hfFooterRight = document.getElementById('hfFooterRight');
  const hfFontSize = document.getElementById('hfFontSize');
  const hfColorPicker = document.getElementById('hfColorPicker');
  const hfClearBtn = document.getElementById('hfClearBtn');
  const hfCloseBtn = document.getElementById('hfCloseBtn');
  const pageNumberBtn = document.getElementById('pageNumberBtn');
  const pageNumberPopover = document.getElementById('pageNumberPopover');
  const pnFormatSelect = document.getElementById('pnFormatSelect');
  const pnAddBtn = document.getElementById('pnAddBtn');
  const screenshotBtn = document.getElementById('screenshotBtn');
  const screenshotControls = document.getElementById('screenshotControls');
  const screenshotDoneBtn = document.getElementById('screenshotDoneBtn');

  const COLORS = ['#16140f', '#6f97c9', '#c1502e'];
  const WHITEOUT_COLORS = ['#ffffff', '#16140f', '#ede6d6'];
  const HIGHLIGHT_COLORS = ['#ffeb3b', '#4caf50', '#ff4081', '#448aff', '#ff9800'];
  const GH = 'https://raw.githubusercontent.com/google/fonts/main';

  // Each custom entry's urls give the exact files that exist; missing
  // bold/italic variants simply reuse the closest available file, both
  // for the live preview (browser fake-bold/italic) and for the final
  // embedded PDF (falls back to the nearest real style).
  const FONT_CATALOG = [
    { key: 'Helvetica', label: 'Helvetica', category: 'Sans', standard: true },
    { key: 'Lato', label: 'Lato', category: 'Sans', urls: { r: `${GH}/ofl/lato/Lato-Regular.ttf`, b: `${GH}/ofl/lato/Lato-Bold.ttf`, i: `${GH}/ofl/lato/Lato-Italic.ttf`, bi: `${GH}/ofl/lato/Lato-BoldItalic.ttf` } },
    { key: 'Poppins', label: 'Poppins', category: 'Sans', urls: { r: `${GH}/ofl/poppins/Poppins-Regular.ttf`, b: `${GH}/ofl/poppins/Poppins-Bold.ttf`, i: `${GH}/ofl/poppins/Poppins-Italic.ttf`, bi: `${GH}/ofl/poppins/Poppins-BoldItalic.ttf` } },

    { key: 'TimesRoman', label: 'Times', category: 'Serif', standard: true },
    { key: 'PTSerif', label: 'PT Serif', category: 'Serif', urls: { r: `${GH}/ofl/ptserif/PT_Serif-Web-Regular.ttf`, b: `${GH}/ofl/ptserif/PT_Serif-Web-Bold.ttf`, i: `${GH}/ofl/ptserif/PT_Serif-Web-Italic.ttf`, bi: `${GH}/ofl/ptserif/PT_Serif-Web-BoldItalic.ttf` } },

    { key: 'Courier', label: 'Courier', category: 'Monospace', standard: true },
    { key: 'CourierPrime', label: 'Courier Prime', category: 'Monospace', urls: { r: `${GH}/ofl/courierprime/CourierPrime-Regular.ttf`, b: `${GH}/ofl/courierprime/CourierPrime-Bold.ttf`, i: `${GH}/ofl/courierprime/CourierPrime-Italic.ttf`, bi: `${GH}/ofl/courierprime/CourierPrime-BoldItalic.ttf` } },
    { key: 'SpaceMono', label: 'Space Mono', category: 'Monospace', urls: { r: `${GH}/ofl/spacemono/SpaceMono-Regular.ttf`, b: `${GH}/ofl/spacemono/SpaceMono-Bold.ttf`, i: `${GH}/ofl/spacemono/SpaceMono-Italic.ttf`, bi: `${GH}/ofl/spacemono/SpaceMono-BoldItalic.ttf` } },
    { key: 'FiraMono', label: 'Fira Mono', category: 'Monospace', urls: { r: `${GH}/ofl/firamono/FiraMono-Regular.ttf`, b: `${GH}/ofl/firamono/FiraMono-Bold.ttf` } },

    { key: 'Kalam', label: 'Kalam', category: 'Handwriting', urls: { r: `${GH}/ofl/kalam/Kalam-Regular.ttf`, b: `${GH}/ofl/kalam/Kalam-Bold.ttf` } },
    { key: 'IndieFlower', label: 'Indie Flower', category: 'Handwriting', urls: { r: `${GH}/ofl/indieflower/IndieFlower-Regular.ttf` } },
    { key: 'ArchitectsDaughter', label: 'Architects Daughter', category: 'Handwriting', urls: { r: `${GH}/ofl/architectsdaughter/ArchitectsDaughter-Regular.ttf` } },
    { key: 'Pacifico', label: 'Pacifico', category: 'Handwriting', urls: { r: `${GH}/ofl/pacifico/Pacifico-Regular.ttf` } },
    { key: 'GreatVibes', label: 'Great Vibes', category: 'Handwriting', urls: { r: `${GH}/ofl/greatvibes/GreatVibes-Regular.ttf` } },

    { key: 'BebasNeue', label: 'Bebas Neue', category: 'Display', urls: { r: `${GH}/ofl/bebasneue/BebasNeue-Regular.ttf` } },
    { key: 'Anton', label: 'Anton', category: 'Display', urls: { r: `${GH}/ofl/anton/Anton-Regular.ttf` } },
    { key: 'AbrilFatface', label: 'Abril Fatface', category: 'Display', urls: { r: `${GH}/ofl/abrilfatface/AbrilFatface-Regular.ttf` } },
    { key: 'Righteous', label: 'Righteous', category: 'Display', urls: { r: `${GH}/ofl/righteous/Righteous-Regular.ttf` } },
    { key: 'Lobster', label: 'Lobster', category: 'Display', urls: { r: `${GH}/ofl/lobster/Lobster-Regular.ttf` } },
    { key: 'OleoScript', label: 'Oleo Script', category: 'Display', urls: { r: `${GH}/ofl/oleoscript/OleoScript-Regular.ttf`, b: `${GH}/ofl/oleoscript/OleoScript-Bold.ttf` } },

    { key: 'HindSiliguri', label: 'Hind Siliguri (বাংলা)', category: 'Bengali', urls: { r: `${GH}/ofl/hindsiliguri/HindSiliguri-Regular.ttf`, b: `${GH}/ofl/hindsiliguri/HindSiliguri-Bold.ttf` } },
  ];

  function catalogEntry(key) {
    return FONT_CATALOG.find((f) => f.key === key) || FONT_CATALOG[0];
  }

  function cssFontFamily(entry) {
    if (entry.standard) {
      if (entry.key === 'Helvetica') return 'Helvetica, Arial, sans-serif';
      if (entry.key === 'TimesRoman') return "'Times New Roman', Times, serif";
      if (entry.key === 'Courier') return "'Courier New', Courier, monospace";
    }
    const fallback = entry.category === 'Serif' ? 'serif' : entry.category === 'Monospace' ? 'monospace' : 'sans-serif';
    return `'${entry.label}', ${fallback}`;
  }

  // Preview font-size must be derived from previewWrap's actual on-screen
  // width using the SAME percentage-of-width formula used when the text is
  // baked into the final PDF (fontSize = pageWidth * fontSizePct / 100).
  // Previously this used a fixed "* 5" multiplier that had no relation to
  // previewWrap's width, so text looked fine on screen but came out much
  // larger (and overflowed its box) in the downloaded PDF.
  function pxFontSize(fontSizePct) {
    return (previewWrap.clientWidth * fontSizePct) / 100;
  }

  // ---- text layer positioning ----
  // pdf.js renders text-layer spans at the native viewport pixel size
  // (e.g. up to 1700px). We CSS-scale that whole layer down/up to match
  // previewWrap's actual on-screen width (which changes with zoom and
  // window resizing) — the standard technique pdf.js's own viewer uses.
  let currentViewportDims = null;
  function positionTextLayer() {
    const textLayerDiv = previewWrap.querySelector('.textLayer');
    if (!textLayerDiv || !currentViewportDims || !currentViewportDims.width) return;
    const scale = previewWrap.clientWidth / currentViewportDims.width;
    textLayerDiv.style.transform = `scale(${scale})`;
    textLayerDiv.style.transformOrigin = '0 0';
  }

  // ---- zoom ----
  // Zoom just resizes previewWrap itself (as a % width inside its
  // scrollable parent). Since the canvas is CSS `width:100%` and every
  // edit element is positioned/sized in percentages relative to
  // previewWrap, everything scales together automatically. Only the
  // preview font-size (computed in real px via pxFontSize) and the text
  // layer's scale transform need an explicit refresh after a zoom change.
  let zoomPct = 100;
  const ZOOM_MIN = 40;
  const ZOOM_MAX = 300;
  const ZOOM_STEP = 10;

  function applyZoom() {
    previewWrap.style.width = `${zoomPct}%`;
    if (zoomPctLabel) zoomPctLabel.textContent = `${zoomPct}%`;
    refreshTextFontSizes();
    positionTextLayer();
  }

  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => {
    zoomPct = Math.max(ZOOM_MIN, zoomPct - ZOOM_STEP);
    applyZoom();
  });
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => {
    zoomPct = Math.min(ZOOM_MAX, zoomPct + ZOOM_STEP);
    applyZoom();
  });
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => {
    zoomPct = 100;
    applyZoom();
  });

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';
  let sourcePassword = null;
  let pdfDocProxy = null;
  let pageCount = 0;
  let currentPage = 1;
  let edits = []; // { id, type, pageNum, xPct, yPct, widthPct, heightPct, text, color, fontSizePct }
  let idCounter = 0;

  // Header/Footer is document-wide (applies to every page), not a
  // per-page edit, so it's kept separately from `edits`.
  const HF_MARGIN_X_PCT = 6;
  const HF_MARGIN_Y_PCT = 4;
  let headerFooterConfig = {
    headerLeft: '', headerCenter: '', headerRight: '',
    footerLeft: '', footerCenter: '', footerRight: '',
    fontSizePct: 1.8,
    color: '#16140f',
  };
  function hasAnyHeaderFooterText() {
    return ['headerLeft', 'headerCenter', 'headerRight', 'footerLeft', 'footerCenter', 'footerRight']
      .some((k) => (headerFooterConfig[k] || '').trim());
  }
  function substituteTokens(str, pageNum, totalPages) {
    return str.replace(/\{page\}/g, pageNum).replace(/\{pages\}/g, totalPages);
  }
  function renderHeaderFooterPreview() {
    previewWrap.querySelectorAll('.hf-preview').forEach((el) => el.remove());
    if (!hasAnyHeaderFooterText()) return;
    const slots = [
      ['headerLeft', 'hf-top hf-left'],
      ['headerCenter', 'hf-top hf-center'],
      ['headerRight', 'hf-top hf-right'],
      ['footerLeft', 'hf-bottom hf-left'],
      ['footerCenter', 'hf-bottom hf-center'],
      ['footerRight', 'hf-bottom hf-right'],
    ];
    slots.forEach(([key, cls]) => {
      const raw = (headerFooterConfig[key] || '').trim();
      if (!raw) return;
      const el = document.createElement('div');
      el.className = `hf-preview ${cls}`;
      el.textContent = substituteTokens(raw, currentPage, pageCount || 1);
      el.style.fontSize = `${pxFontSize(headerFooterConfig.fontSizePct)}px`;
      el.style.color = headerFooterConfig.color;
      previewWrap.appendChild(el);
    });
  }

  // ---- header/footer modal ----

  function hfSyncInputsFromConfig() {
    hfHeaderLeft.value = headerFooterConfig.headerLeft;
    hfHeaderCenter.value = headerFooterConfig.headerCenter;
    hfHeaderRight.value = headerFooterConfig.headerRight;
    hfFooterLeft.value = headerFooterConfig.footerLeft;
    hfFooterCenter.value = headerFooterConfig.footerCenter;
    hfFooterRight.value = headerFooterConfig.footerRight;
    hfColorPicker.value = headerFooterConfig.color;
  }

  if (headerFooterBtn) {
    headerFooterBtn.addEventListener('click', () => {
      hfSyncInputsFromConfig();
      hfModal.classList.add('active');
    });
  }

  [
    [hfHeaderLeft, 'headerLeft'], [hfHeaderCenter, 'headerCenter'], [hfHeaderRight, 'headerRight'],
    [hfFooterLeft, 'footerLeft'], [hfFooterCenter, 'footerCenter'], [hfFooterRight, 'footerRight'],
  ].forEach(([input, key]) => {
    if (!input) return;
    input.addEventListener('input', () => {
      headerFooterConfig[key] = input.value;
      renderHeaderFooterPreview();
      validateDownload();
    });
  });

  if (hfFontSize) {
    hfFontSize.addEventListener('input', () => {
      headerFooterConfig.fontSizePct = parseFloat(hfFontSize.value);
      renderHeaderFooterPreview();
    });
  }
  if (hfColorPicker) {
    hfColorPicker.addEventListener('input', () => {
      headerFooterConfig.color = hfColorPicker.value;
      renderHeaderFooterPreview();
    });
  }
  if (hfClearBtn) {
    hfClearBtn.addEventListener('click', () => {
      headerFooterConfig = {
        headerLeft: '', headerCenter: '', headerRight: '',
        footerLeft: '', footerCenter: '', footerRight: '',
        fontSizePct: 1.8,
        color: '#16140f',
      };
      hfSyncInputsFromConfig();
      renderHeaderFooterPreview();
      validateDownload();
    });
  }
  if (hfCloseBtn) {
    hfCloseBtn.addEventListener('click', () => {
      hfModal.classList.remove('active');
    });
  }
  let activeEl = null;
  let drawMode = false;
  let drawColor = '#c1502e';
  let currentStroke = null; // { points: [] } while actively drawing

  function setStatus(msg) { statusText.textContent = msg; }
  function baseName(name) { return name.replace(/\.pdf$/i, ''); }
  function newId() { return `e${++idCounter}`; }

  function validateDownload() {
    downloadBtn.disabled = !sourceArrayBuffer;
    viewPrintBtn.disabled = !sourceArrayBuffer;

    const counterEl = document.getElementById('editCount');
    if (counterEl) {
      if (edits.length === 0) {
        counterEl.textContent = '';
      } else {
        const pagesUsed = new Set(edits.map((e) => e.pageNum)).size;
        counterEl.textContent = `${edits.length} edit${edits.length > 1 ? 's' : ''} across ${pagesUsed} page${pagesUsed > 1 ? 's' : ''}`;
      }
    }
  }

  // ---- rendering base page ----

  async function renderBasePage(pageNum) {
    addTextBtn.disabled = true;
    addWhiteoutBtn.disabled = true;
    setStatus(`loading page ${pageNum}…`);

    try {
      const page = await pdfDocProxy.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });

      // Cap the rendered resolution so very large scanned pages don't
      // blow past canvas memory limits and silently fail to render.
      const MAX_DIM = 1700;
      const longEdge = Math.max(baseViewport.width, baseViewport.height);
      const scale = Math.max(0.3, Math.min(1.3, MAX_DIM / longEdge));

      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

      previewWrap.innerHTML = '';
      previewWrap.style.minHeight = '';
      previewWrap.appendChild(canvas);

      // Real, selectable text layer (pdf.js) for the text-selection-based
      // highlight/underline/strikethrough tools. Scanned/image-only PDFs
      // simply produce an empty text layer — nothing to select there.
      currentViewportDims = { width: viewport.width, height: viewport.height };
      try {
        const textContent = await page.getTextContent();
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'textLayer';
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.height = `${viewport.height}px`;
        previewWrap.appendChild(textLayerDiv);
        const task = pdfjsLib.renderTextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport,
          textDivs: [],
        });
        if (task && task.promise) await task.promise;
        positionTextLayer();
      } catch (tlErr) {
        console.error('Text layer unavailable for this page', tlErr);
      }

      previewWrap.appendChild(drawControls);
      renderPageElements();
      addTextBtn.disabled = false;
      addWhiteoutBtn.disabled = false;
      setStatus('add text or a whiteout box, then download');
      return true;
    } catch (err) {
      console.error('Failed to render page', pageNum, err);
      previewWrap.innerHTML = '';
      previewWrap.style.minHeight = '200px';
      setStatus(`couldn't render page ${pageNum} — try a different page, or a smaller/re-saved copy of this PDF`);
      return false;
    }
  }

  function renderPageElements() {
    previewWrap.querySelectorAll('.edit-el').forEach((el) => el.remove());
    previewWrap.querySelectorAll('.drawing-svg').forEach((el) => el.remove());

    edits.filter((e) => e.pageNum === currentPage).forEach((edit) => {
      if (edit.type === 'text') createTextDom(edit);
      else if (edit.type === 'whiteout' || edit.type === 'highlight') createWhiteoutDom(edit);
      else if (edit.type === 'drawing') renderDrawingSvg(edit);
      else if (edit.type === 'shape') createShapeDom(edit);
      else if (edit.type === 'image') createImageDom(edit);
      else if (edit.type === 'textHighlight' || edit.type === 'underline' || edit.type === 'strikethrough') createTextMarkDom(edit);
    });

    renderHeaderFooterPreview();
  }

  // Duplicate any edit (text, whiteout, shape, or image) as a new
  // element nudged slightly down-right so it's visibly a copy and not
  // stacked exactly on top of the original.
  function duplicateEdit(edit) {
    const copy = {
      ...edit,
      id: newId(),
      xPct: Math.min(94, edit.xPct + 3),
      yPct: Math.min(94, edit.yPct + 3),
    };
    edits.push(copy);
    renderPageElements();
    validateDownload();
  }

  // Re-apply preview font sizes for all text boxes on the current page.
  // Needed whenever previewWrap's rendered width can change (window
  // resize, orientation change) since pxFontSize() depends on it.
  function refreshTextFontSizes() {
    previewWrap.querySelectorAll('.text-el').forEach((el) => {
      const edit = edits.find((e) => e.id === el.dataset.editId);
      if (!edit) return;
      const content = el.querySelector('.text-content');
      if (content) content.style.fontSize = `${pxFontSize(edit.fontSizePct)}px`;
    });
  }

  let resizeDebounce = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      refreshTextFontSizes();
      positionTextLayer();
    }, 100);
  });

  function findDrawingEdit(pageNum) {
    return edits.find((e) => e.type === 'drawing' && e.pageNum === pageNum);
  }

  function strokeToPointsAttr(points) {
    return points.map((p) => `${p.xPct},${p.yPct}`).join(' ');
  }

  function renderDrawingSvg(edit) {
    const old = previewWrap.querySelector('.drawing-svg[data-static="1"]');
    if (old) old.remove();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'draw-overlay-svg drawing-svg');
    svg.setAttribute('data-static', '1');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.pointerEvents = 'none';

    edit.strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      poly.setAttribute('points', strokeToPointsAttr(stroke.points));
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', stroke.color);
      poly.setAttribute('stroke-width', stroke.widthPct);
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      poly.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(poly);
    });

    previewWrap.insertBefore(svg, previewWrap.firstChild.nextSibling);
  }

  // ---- draw tool ----

  let liveDrawSvg = null;
  let liveDrawPoly = null;

  function ensureLiveDrawSvg() {
    if (liveDrawSvg) return;
    liveDrawSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    liveDrawSvg.setAttribute('class', 'draw-overlay-svg interactive');
    liveDrawSvg.setAttribute('viewBox', '0 0 100 100');
    liveDrawSvg.setAttribute('preserveAspectRatio', 'none');
    previewWrap.appendChild(liveDrawSvg);
  }

  function removeLiveDrawSvg() {
    if (liveDrawSvg) {
      liveDrawSvg.remove();
      liveDrawSvg = null;
    }
  }

  function pointFromEvent(e) {
    const rect = previewWrap.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      xPct: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      yPct: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }

  function startStroke(e) {
    if (!drawMode || e.target.closest('#drawControls')) return;
    e.preventDefault();
    const strokeWidthPct = parseFloat(strokeSelect.value);
    currentStroke = { color: drawColor, widthPct: strokeWidthPct, points: [pointFromEvent(e)] };
    liveDrawPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    liveDrawPoly.setAttribute('fill', 'none');
    liveDrawPoly.setAttribute('stroke', drawColor);
    liveDrawPoly.setAttribute('stroke-width', strokeWidthPct);
    liveDrawPoly.setAttribute('stroke-linecap', 'round');
    liveDrawPoly.setAttribute('stroke-linejoin', 'round');
    liveDrawPoly.setAttribute('vector-effect', 'non-scaling-stroke');
    liveDrawSvg.appendChild(liveDrawPoly);
  }

  function moveStroke(e) {
    if (!drawMode || !currentStroke) return;
    e.preventDefault();
    currentStroke.points.push(pointFromEvent(e));
    liveDrawPoly.setAttribute('points', strokeToPointsAttr(currentStroke.points));
  }

  function endStroke() {
    if (!drawMode || !currentStroke) return;
    if (currentStroke.points.length > 1) {
      let drawingEdit = findDrawingEdit(currentPage);
      if (!drawingEdit) {
        drawingEdit = { id: newId(), type: 'drawing', pageNum: currentPage, strokes: [] };
        edits.push(drawingEdit);
      }
      drawingEdit.strokes.push(currentStroke);
      renderDrawingSvg(drawingEdit);
    }
    currentStroke = null;
    liveDrawPoly = null;
    if (liveDrawSvg) liveDrawSvg.innerHTML = '';
    validateDownload();
  }

  // ---- draggable draw-controls panel ----

  (() => {
    let dragging = false;
    let offsetX = 0, offsetY = 0;

    function down(e) {
      dragging = true;
      const rect = drawControls.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;
      e.preventDefault();
      e.stopPropagation();
    }
    function move(e) {
      if (!dragging) return;
      const wrapRect = previewWrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      let left = clientX - wrapRect.left - offsetX;
      let top = clientY - wrapRect.top - offsetY;
      left = Math.max(0, Math.min(wrapRect.width - drawControls.offsetWidth, left));
      top = Math.max(0, Math.min(wrapRect.height - drawControls.offsetHeight, top));
      drawControls.style.left = `${left}px`;
      drawControls.style.top = `${top}px`;
    }
    function up() { dragging = false; }

    drawControlsGrip.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    drawControlsGrip.addEventListener('touchstart', down, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  })();

  function turnOffDrawMode() {
    drawMode = false;
    drawToolBtn.classList.remove('toggled');
    drawControls.classList.remove('active');
    document.querySelectorAll('.edit-el').forEach((n) => { n.style.pointerEvents = ''; });
    removeLiveDrawSvg();
  }

  drawToolBtn.addEventListener('click', () => {
    if (!drawMode) { turnOffMarkMode(); turnOffScreenshotMode(); }
    drawMode = !drawMode;
    drawToolBtn.classList.toggle('toggled', drawMode);
    drawControls.classList.toggle('active', drawMode);
    document.querySelectorAll('.edit-el').forEach((n) => { n.style.pointerEvents = drawMode ? 'none' : ''; });
    if (drawMode) {
      ensureLiveDrawSvg();
    } else {
      removeLiveDrawSvg();
    }
  });

  doneDrawingBtn.addEventListener('click', turnOffDrawMode);

  clearDrawingBtn.addEventListener('click', () => {
    edits = edits.filter((e) => !(e.type === 'drawing' && e.pageNum === currentPage));
    renderPageElements();
    validateDownload();
  });

  drawControls.querySelectorAll('.mini-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      drawColor = sw.dataset.color;
      drawControls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.toggle('selected', s === sw));
      drawColorPicker.value = drawColor;
    });
  });
  drawColorPicker.addEventListener('input', (e) => {
    drawColor = e.target.value;
    drawControls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
  });

  previewWrap.addEventListener('mousedown', startStroke);
  previewWrap.addEventListener('mousemove', moveStroke);
  window.addEventListener('mouseup', endStroke);
  previewWrap.addEventListener('touchstart', startStroke, { passive: false });
  previewWrap.addEventListener('touchmove', moveStroke, { passive: false });
  window.addEventListener('touchend', endStroke);

  previewWrap.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.edit-el')) {
      previewWrap.querySelectorAll('.edit-el').forEach((n) => n.classList.remove('active'));
    }
  });
  previewWrap.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.edit-el')) {
      previewWrap.querySelectorAll('.edit-el').forEach((n) => n.classList.remove('active'));
    }
  });

  // ---- text-selection highlight / underline / strikethrough ----
  // Unlike Area Highlight (a manually placed box), these snap onto the
  // PDF's real, selectable text via pdf.js's text layer. Only works on
  // pages that actually have text (not scanned/image-only pages).

  const MARK_LINE_COLORS = ['#c1502e', '#6f97c9', '#4caf50', '#16140f'];
  let textMarkMode = null; // 'highlight' | 'underline' | 'strikethrough' | null
  let textMarkColor = HIGHLIGHT_COLORS[0];

  function markPalette() {
    return textMarkMode === 'highlight' ? HIGHLIGHT_COLORS : MARK_LINE_COLORS;
  }

  function renderMarkSwatches() {
    if (!textMarkSwatches) return;
    textMarkSwatches.innerHTML = '';
    markPalette().forEach((c) => {
      const sw = document.createElement('span');
      sw.className = 'mini-swatch' + (c === textMarkColor ? ' selected' : '');
      sw.style.background = c;
      sw.addEventListener('click', () => {
        textMarkColor = c;
        renderMarkSwatches();
        if (textMarkColorPicker) textMarkColorPicker.value = c;
      });
      textMarkSwatches.appendChild(sw);
    });
  }

  function turnOffMarkMode() {
    if (!textMarkMode) return;
    textMarkMode = null;
    [highlightTextBtn, underlineBtn, strikethroughBtn].forEach((b) => b && b.classList.remove('toggled'));
    if (textMarkControls) textMarkControls.classList.remove('active');
    const tl = previewWrap.querySelector('.textLayer');
    if (tl) tl.classList.remove('active');
    document.querySelectorAll('.edit-el').forEach((n) => { n.style.pointerEvents = ''; });
    window.getSelection().removeAllRanges();
  }

  function enterMarkMode(mode, btn) {
    turnOffDrawMode();
    turnOffScreenshotMode();
    const turningOn = textMarkMode !== mode;
    turnOffMarkMode();
    if (!turningOn) return;
    textMarkMode = mode;
    btn.classList.add('toggled');
    if (textMarkControls) textMarkControls.classList.add('active');
    const tl = previewWrap.querySelector('.textLayer');
    if (tl) tl.classList.add('active');
    document.querySelectorAll('.edit-el').forEach((n) => { n.style.pointerEvents = 'none'; });
    textMarkColor = markPalette()[0];
    if (textMarkColorPicker) textMarkColorPicker.value = textMarkColor;
    renderMarkSwatches();
  }

  if (highlightTextBtn) highlightTextBtn.addEventListener('click', () => enterMarkMode('highlight', highlightTextBtn));
  if (underlineBtn) underlineBtn.addEventListener('click', () => enterMarkMode('underline', underlineBtn));
  if (strikethroughBtn) strikethroughBtn.addEventListener('click', () => enterMarkMode('strikethrough', strikethroughBtn));
  if (textMarkDoneBtn) textMarkDoneBtn.addEventListener('click', turnOffMarkMode);
  if (textMarkColorPicker) {
    textMarkColorPicker.addEventListener('input', (e) => {
      textMarkColor = e.target.value;
      renderMarkSwatches();
    });
  }

  function rectsFromSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return [];
    const wrapRect = previewWrap.getBoundingClientRect();
    const results = [];
    for (let i = 0; i < sel.rangeCount; i++) {
      const range = sel.getRangeAt(i);
      const clientRects = range.getClientRects();
      for (const r of clientRects) {
        if (r.width < 1 || r.height < 1) continue;
        results.push({
          xPct: ((r.left - wrapRect.left) / wrapRect.width) * 100,
          yPct: ((r.top - wrapRect.top) / wrapRect.height) * 100,
          widthPct: (r.width / wrapRect.width) * 100,
          heightPct: (r.height / wrapRect.height) * 100,
        });
      }
    }
    return results;
  }

  function captureTextMark() {
    if (!textMarkMode) return;
    const rects = rectsFromSelection();
    window.getSelection().removeAllRanges();
    if (rects.length === 0) return;
    const edit = {
      id: newId(),
      type: textMarkMode === 'highlight' ? 'textHighlight' : textMarkMode,
      pageNum: currentPage,
      rects,
      color: textMarkColor,
      opacity: textMarkMode === 'highlight' ? 40 : 100,
    };
    edits.push(edit);
    renderPageElements();
    validateDownload();
  }

  previewWrap.addEventListener('mouseup', (e) => {
    if (!textMarkMode || !e.target.closest('.textLayer')) return;
    setTimeout(captureTextMark, 0);
  });
  previewWrap.addEventListener('touchend', (e) => {
    if (!textMarkMode) return;
    setTimeout(captureTextMark, 0);
  });

  function createTextMarkDom(edit) {
    edit.rects.forEach((r) => {
      const mark = document.createElement('div');
      mark.dataset.editId = edit.id;
      if (edit.type === 'textHighlight') {
        mark.className = 'edit-el textmark-highlight';
        mark.style.background = hexToRgba(edit.color, (edit.opacity ?? 40) / 100);
        mark.style.left = `${r.xPct}%`;
        mark.style.top = `${r.yPct}%`;
        mark.style.width = `${r.widthPct}%`;
        mark.style.height = `${r.heightPct}%`;
      } else {
        mark.className = 'edit-el textmark-line';
        mark.style.background = edit.color;
        mark.style.left = `${r.xPct}%`;
        mark.style.width = `${r.widthPct}%`;
        const linePct = edit.type === 'underline' ? r.yPct + r.heightPct * 0.9 : r.yPct + r.heightPct * 0.5;
        mark.style.top = `${linePct}%`;
        mark.style.height = `${Math.max(0.25, r.heightPct * 0.07)}%`;
      }
      previewWrap.appendChild(mark);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'edit-el textmark-del';
    delBtn.dataset.editId = edit.id;
    delBtn.textContent = '✕';
    delBtn.title = window.veloraT ? window.veloraT('edit_close_btn') : 'Delete';
    if (edit.rects[0]) {
      delBtn.style.left = `${edit.rects[0].xPct}%`;
      delBtn.style.top = `${edit.rects[0].yPct}%`;
    }
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edits = edits.filter((x) => x.id !== edit.id);
      renderPageElements();
      validateDownload();
    });
    previewWrap.appendChild(delBtn);
  }

  // ---- screenshot / snip tool ----
  // Crops directly from the rendered <canvas> pixel data (the original
  // PDF page render), not the DOM overlay — so it reflects the page as
  // rendered, not any text/whiteout/shape edits sitting on top of it.

  let screenshotMode = false;
  let snipStart = null; // {clientX, clientY}
  let snipEl = null;

  function turnOffScreenshotMode() {
    if (!screenshotMode) return;
    screenshotMode = false;
    if (screenshotBtn) screenshotBtn.classList.remove('toggled');
    if (screenshotControls) screenshotControls.classList.remove('active');
    previewWrap.classList.remove('snip-active');
    document.querySelectorAll('.edit-el').forEach((n) => { n.style.pointerEvents = ''; });
    if (snipEl) { snipEl.remove(); snipEl = null; }
    snipStart = null;
  }

  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', () => {
      const turningOn = !screenshotMode;
      turnOffDrawMode();
      turnOffMarkMode();
      turnOffScreenshotMode();
      if (!turningOn) return;
      screenshotMode = true;
      screenshotBtn.classList.add('toggled');
      if (screenshotControls) screenshotControls.classList.add('active');
      previewWrap.classList.add('snip-active');
      document.querySelectorAll('.edit-el').forEach((n) => { n.style.pointerEvents = 'none'; });
    });
  }
  if (screenshotDoneBtn) screenshotDoneBtn.addEventListener('click', turnOffScreenshotMode);

  function snipPointerDown(e) {
    if (!screenshotMode || e.target.closest('#screenshotControls')) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    snipStart = { clientX, clientY };
    snipEl = document.createElement('div');
    snipEl.className = 'snip-selection';
    previewWrap.appendChild(snipEl);
  }

  function snipPointerMove(e) {
    if (!screenshotMode || !snipStart || !snipEl) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const wrapRect = previewWrap.getBoundingClientRect();
    const x1 = Math.min(snipStart.clientX, clientX) - wrapRect.left;
    const y1 = Math.min(snipStart.clientY, clientY) - wrapRect.top;
    const w = Math.abs(clientX - snipStart.clientX);
    const h = Math.abs(clientY - snipStart.clientY);
    snipEl.style.left = `${x1}px`;
    snipEl.style.top = `${y1}px`;
    snipEl.style.width = `${w}px`;
    snipEl.style.height = `${h}px`;
  }

  async function snipPointerUp(e) {
    if (!screenshotMode || !snipStart) return;
    const clientX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) || snipStart.clientX;
    const clientY = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) || snipStart.clientY;

    const canvas = previewWrap.querySelector('canvas');
    if (snipEl) { snipEl.remove(); snipEl = null; }
    const startClient = snipStart;
    snipStart = null;
    if (!canvas) return;

    const left = Math.min(startClient.clientX, clientX);
    const top = Math.min(startClient.clientY, clientY);
    const widthPx = Math.abs(clientX - startClient.clientX);
    const heightPx = Math.abs(clientY - startClient.clientY);
    if (widthPx < 4 || heightPx < 4) return; // ignore accidental clicks

    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    let sx = (left - canvasRect.left) * scaleX;
    let sy = (top - canvasRect.top) * scaleY;
    let sw = widthPx * scaleX;
    let sh = heightPx * scaleY;
    // Clamp to the canvas bounds in case the drag went slightly outside it.
    sx = Math.max(0, sx);
    sy = Math.max(0, sy);
    sw = Math.min(sw, canvas.width - sx);
    sh = Math.min(sh, canvas.height - sy);
    if (sw < 1 || sh < 1) return;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = Math.max(1, Math.round(sw));
    cropCanvas.height = Math.max(1, Math.round(sh));
    cropCanvas.getContext('2d').drawImage(canvas, sx, sy, sw, sh, 0, 0, cropCanvas.width, cropCanvas.height);

    const filename = `${baseName(sourceFileName)}-page${currentPage}-screenshot.png`;
    cropCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setStatus('screenshot copied to clipboard and downloaded');
      } catch (clipErr) {
        setStatus('screenshot downloaded');
      }
    }, 'image/png');
  }

  previewWrap.addEventListener('mousedown', snipPointerDown);
  previewWrap.addEventListener('mousemove', snipPointerMove);
  window.addEventListener('mouseup', snipPointerUp);
  previewWrap.addEventListener('touchstart', snipPointerDown, { passive: false });
  previewWrap.addEventListener('touchmove', snipPointerMove, { passive: false });
  window.addEventListener('touchend', snipPointerUp);

  // ---- drag helper (shared) ----

  function wireDrag(el, edit, onMove) {
    let dragging = false;
    let offsetX = 0, offsetY = 0;

    function down(e) {
      if (e.target.closest('input, button, .resize-handle')) return;
      dragging = true;
      activeEl = el;
      document.querySelectorAll('.edit-el').forEach((n) => n.classList.remove('active'));
      el.classList.add('active');
      const rect = previewWrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      offsetX = clientX - rect.left - (edit.xPct / 100) * rect.width;
      offsetY = clientY - rect.top - (edit.yPct / 100) * rect.height;
      e.stopPropagation();
    }
    function move(e) {
      if (!dragging) return;
      const rect = previewWrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      edit.xPct = Math.max(0, Math.min(98, ((clientX - rect.left - offsetX) / rect.width) * 100));
      edit.yPct = Math.max(0, Math.min(98, ((clientY - rect.top - offsetY) / rect.height) * 100));
      onMove();
    }
    function up() { dragging = false; }

    el.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    el.addEventListener('touchstart', down, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  }

  // ---- text elements ----

  function createTextDom(edit) {
    const el = document.createElement('div');
    el.className = 'edit-el text-el';
    el.dataset.editId = edit.id;
    el.style.left = `${edit.xPct}%`;
    el.style.top = `${edit.yPct}%`;
    el.style.maxWidth = `${Math.max(10, 98 - edit.xPct)}%`;

    const strip = document.createElement('div');
    strip.className = 'drag-strip';
    el.appendChild(strip);

    const content = document.createElement('div');
    content.className = 'text-content';
    content.contentEditable = 'true';
    content.spellcheck = false;
    content.textContent = edit.text;
    content.style.color = edit.color;
    content.style.fontSize = `${pxFontSize(edit.fontSizePct)}px`;
    content.style.fontFamily = cssFontFamily(catalogEntry(edit.fontFamily));
    content.style.fontWeight = edit.bold ? '700' : '400';
    content.style.fontStyle = edit.italic ? 'italic' : 'normal';
    content.addEventListener('input', () => {
      edit.text = content.textContent;
    });
    content.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.execCommand('insertText', false, '\n');
      }
    });
    content.addEventListener('mousedown', (e) => e.stopPropagation());
    content.addEventListener('touchstart', (e) => e.stopPropagation());
    el.appendChild(content);

    const controls = document.createElement('div');
    controls.className = 'el-controls';

    const smallerBtn = document.createElement('button');
    smallerBtn.textContent = 'A-';
    smallerBtn.title = 'Smaller';
    const biggerBtn = document.createElement('button');
    biggerBtn.textContent = 'A+';
    biggerBtn.title = 'Bigger';
    const boldBtn = document.createElement('button');
    boldBtn.textContent = 'B';
    boldBtn.style.fontWeight = '700';
    boldBtn.title = 'Bold';
    boldBtn.classList.toggle('toggled', !!edit.bold);
    const italicBtn = document.createElement('button');
    italicBtn.textContent = 'I';
    italicBtn.style.fontStyle = 'italic';
    italicBtn.title = 'Italic';
    italicBtn.classList.toggle('toggled', !!edit.italic);

    smallerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edit.fontSizePct = Math.max(1, edit.fontSizePct - 0.4);
      content.style.fontSize = `${pxFontSize(edit.fontSizePct)}px`;
    });
    biggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edit.fontSizePct = Math.min(12, edit.fontSizePct + 0.4);
      content.style.fontSize = `${pxFontSize(edit.fontSizePct)}px`;
    });
    boldBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edit.bold = !edit.bold;
      content.style.fontWeight = edit.bold ? '700' : '400';
      boldBtn.classList.toggle('toggled', edit.bold);
    });
    italicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edit.italic = !edit.italic;
      content.style.fontStyle = edit.italic ? 'italic' : 'normal';
      italicBtn.classList.toggle('toggled', edit.italic);
    });

    controls.appendChild(smallerBtn);
    controls.appendChild(biggerBtn);

    const sepFont = document.createElement('div');
    sepFont.className = 'ctrl-sep';
    controls.appendChild(sepFont);

    const fontSelect = document.createElement('select');
    fontSelect.className = 'font-select';
    const categories = [...new Set(FONT_CATALOG.map((f) => f.category))];
    categories.forEach((cat) => {
      const group = document.createElement('optgroup');
      group.label = cat;
      FONT_CATALOG.filter((f) => f.category === cat).forEach((f) => {
        const opt = document.createElement('option');
        opt.value = f.key;
        opt.textContent = f.label;
        if (f.key === edit.fontFamily) opt.selected = true;
        group.appendChild(opt);
      });
      fontSelect.appendChild(group);
    });
    fontSelect.addEventListener('click', (e) => e.stopPropagation());
    fontSelect.addEventListener('change', () => {
      edit.fontFamily = fontSelect.value;
      content.style.fontFamily = cssFontFamily(catalogEntry(edit.fontFamily));
    });
    controls.appendChild(fontSelect);

    const sepBI = document.createElement('div');
    sepBI.className = 'ctrl-sep';
    controls.appendChild(sepBI);

    controls.appendChild(boldBtn);
    controls.appendChild(italicBtn);

    const sep1 = document.createElement('div');
    sep1.className = 'ctrl-sep';
    controls.appendChild(sep1);

    COLORS.forEach((c) => {
      const sw = document.createElement('span');
      sw.className = 'mini-swatch' + (c === edit.color ? ' selected' : '');
      sw.style.background = c;
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        edit.color = c;
        content.style.color = c;
        controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.toggle('selected', s === sw));
        colorPicker.value = c;
      });
      controls.appendChild(sw);
    });

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'color-picker';
    colorPicker.value = edit.color;
    colorPicker.title = 'Custom color';
    colorPicker.addEventListener('input', (e) => {
      edit.color = e.target.value;
      content.style.color = edit.color;
      controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
    });
    colorPicker.addEventListener('click', (e) => e.stopPropagation());
    controls.appendChild(colorPicker);

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '⧉';
    copyBtn.title = window.veloraT ? window.veloraT('edit_copy_title') : 'Copy';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateEdit(edit);
    });
    controls.appendChild(copyBtn);

    const sep2 = document.createElement('div');
    sep2.className = 'ctrl-sep';
    controls.appendChild(sep2);

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.textContent = '✕';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edits = edits.filter((x) => x.id !== edit.id);
      renderPageElements();
      validateDownload();
    });
    controls.appendChild(delBtn);

    el.appendChild(controls);

    wireDrag(strip, edit, () => {
      el.style.left = `${edit.xPct}%`;
      el.style.top = `${edit.yPct}%`;
      el.style.maxWidth = `${Math.max(10, 98 - edit.xPct)}%`;
    });

    previewWrap.appendChild(el);
  }

  // ---- whiteout elements ----

  function hexToRgbTuple(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    if (s === 0) { const v = l * 255; return [v, v, v]; }
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
  }

  function adjustLightness(hex, deltaPct) {
    const [r, g, b] = hexToRgbTuple(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    const newL = Math.max(0, Math.min(100, l + deltaPct));
    const [nr, ng, nb] = hslToRgb(h, s, newL);
    return rgbToHex(nr, ng, nb);
  }

  function hexToRgba(hex, alpha) {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function createWhiteoutDom(edit) {
    const isHighlight = edit.type === 'highlight';
    const PALETTE = isHighlight ? HIGHLIGHT_COLORS : WHITEOUT_COLORS;

    function paint() {
      el.style.background = isHighlight
        ? hexToRgba(edit.color, (edit.opacity ?? 40) / 100)
        : edit.color;
    }

    const el = document.createElement('div');
    el.className = isHighlight ? 'edit-el highlight-el' : 'edit-el whiteout-el';
    el.style.left = `${edit.xPct}%`;
    el.style.top = `${edit.yPct}%`;
    el.style.width = `${edit.widthPct}%`;
    el.style.height = `${edit.heightPct}%`;
    paint();

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn-box';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edits = edits.filter((x) => x.id !== edit.id);
      renderPageElements();
      validateDownload();
    });
    el.appendChild(delBtn);

    const dupBtn = document.createElement('button');
    dupBtn.className = 'dup-btn-box';
    dupBtn.textContent = '⧉';
    dupBtn.title = window.veloraT ? window.veloraT('edit_copy_title') : 'Copy';
    dupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateEdit(edit);
    });
    el.appendChild(dupBtn);

    const controls = document.createElement('div');
    controls.className = 'wo-controls';

    PALETTE.forEach((c) => {
      const sw = document.createElement('span');
      sw.className = 'mini-swatch' + (c === edit.color ? ' selected' : '');
      sw.style.background = c;
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        edit.color = c;
        edit.baseColor = c;
        edit.colorAdjust = 0;
        adjustSlider.value = 0;
        paint();
        controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.toggle('selected', s === sw));
        colorPicker.value = c;
      });
      controls.appendChild(sw);
    });

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'color-picker';
    colorPicker.value = edit.color;
    colorPicker.title = 'Custom color';
    colorPicker.addEventListener('input', (e) => {
      edit.color = e.target.value;
      edit.baseColor = e.target.value;
      edit.colorAdjust = 0;
      adjustSlider.value = 0;
      paint();
      controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
    });
    colorPicker.addEventListener('click', (e) => e.stopPropagation());
    colorPicker.addEventListener('mousedown', (e) => e.stopPropagation());
    controls.appendChild(colorPicker);

    if (!isHighlight) {
      const eyedropperBtn = document.createElement('button');
      eyedropperBtn.type = 'button';
      eyedropperBtn.className = 'eyedropper-btn';
      eyedropperBtn.title = 'Click anywhere on the page to pick that color';
      eyedropperBtn.textContent = '💧';
      eyedropperBtn.addEventListener('mousedown', (e) => e.stopPropagation());
      eyedropperBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const canvas = previewWrap.querySelector('canvas');
        if (!canvas) return;

        previewWrap.style.cursor = 'crosshair';
        eyedropperBtn.classList.add('toggled');
        document.querySelectorAll('.edit-el').forEach((n) => { n.style.pointerEvents = 'none'; });

        function sampleAt(clientX, clientY) {
          const rect = canvas.getBoundingClientRect();
          const px = Math.round(((clientX - rect.left) / rect.width) * canvas.width);
          const py = Math.round(((clientY - rect.top) / rect.height) * canvas.height);
          const ctx = canvas.getContext('2d');
          const radius = 3;
          const x0 = Math.max(0, px - radius);
          const y0 = Math.max(0, py - radius);
          const w = Math.min(canvas.width, px + radius) - x0;
          const h = Math.min(canvas.height, py + radius) - y0;
          const data = ctx.getImageData(x0, y0, Math.max(1, w), Math.max(1, h)).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
          }
          r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
          return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
        }

        function onPick(ev) {
          ev.stopPropagation();
          ev.preventDefault();
          const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
          const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
          try {
            const hex = sampleAt(clientX, clientY);
            edit.color = hex;
            edit.baseColor = hex;
            edit.colorAdjust = 0;
            adjustSlider.value = 0;
            paint();
            colorPicker.value = hex;
            controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
          } catch (err) {
            console.error('color sampling failed', err);
          }
          cleanup();
        }

        function onKey(ev) {
          if (ev.key === 'Escape') cleanup();
        }

        function cleanup() {
          previewWrap.style.cursor = '';
          eyedropperBtn.classList.remove('toggled');
          document.querySelectorAll('.edit-el').forEach((n) => { n.style.pointerEvents = ''; });
          previewWrap.removeEventListener('click', onPick, true);
          previewWrap.removeEventListener('touchstart', onPick, true);
          document.removeEventListener('keydown', onKey);
        }

        previewWrap.addEventListener('click', onPick, { capture: true, once: true });
        previewWrap.addEventListener('touchstart', onPick, { capture: true, once: true, passive: false });
        document.addEventListener('keydown', onKey);
      });
      controls.appendChild(eyedropperBtn);
    }

    const adjustSlider = document.createElement('input');
    adjustSlider.type = 'range';
    adjustSlider.className = 'adjust-slider';
    adjustSlider.min = '-50';
    adjustSlider.max = '50';
    adjustSlider.value = String(edit.colorAdjust || 0);
    adjustSlider.title = 'Fine-tune: lighter / darker';
    adjustSlider.addEventListener('mousedown', (e) => e.stopPropagation());
    adjustSlider.addEventListener('click', (e) => e.stopPropagation());
    adjustSlider.addEventListener('input', () => {
      edit.colorAdjust = parseInt(adjustSlider.value, 10);
      edit.color = adjustLightness(edit.baseColor, edit.colorAdjust);
      paint();
      colorPicker.value = edit.color;
    });
    controls.appendChild(adjustSlider);

    if (isHighlight) {
      const opacitySlider = document.createElement('input');
      opacitySlider.type = 'range';
      opacitySlider.className = 'adjust-slider';
      opacitySlider.min = '10';
      opacitySlider.max = '80';
      opacitySlider.value = String(edit.opacity ?? 40);
      opacitySlider.title = 'Highlight opacity';
      opacitySlider.addEventListener('mousedown', (e) => e.stopPropagation());
      opacitySlider.addEventListener('click', (e) => e.stopPropagation());
      opacitySlider.addEventListener('input', () => {
        edit.opacity = parseInt(opacitySlider.value, 10);
        paint();
      });
      controls.appendChild(opacitySlider);
    }

    el.appendChild(controls);

    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    el.appendChild(handle);

    wireDrag(el, edit, () => {
      el.style.left = `${edit.xPct}%`;
      el.style.top = `${edit.yPct}%`;
    });

    let resizing = false;
    handle.addEventListener('mousedown', (e) => {
      resizing = true;
      e.stopPropagation();
      e.preventDefault();
    });
    handle.addEventListener('touchstart', (e) => {
      resizing = true;
      e.stopPropagation();
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('mousemove', (e) => {
      if (!resizing) return;
      const rect = previewWrap.getBoundingClientRect();
      edit.widthPct = Math.max(3, ((e.clientX - rect.left) / rect.width) * 100 - edit.xPct);
      edit.heightPct = Math.max(2, ((e.clientY - rect.top) / rect.height) * 100 - edit.yPct);
      el.style.width = `${edit.widthPct}%`;
      el.style.height = `${edit.heightPct}%`;
    });
    window.addEventListener('touchmove', (e) => {
      if (!resizing) return;
      const rect = previewWrap.getBoundingClientRect();
      const t = e.touches[0];
      edit.widthPct = Math.max(3, ((t.clientX - rect.left) / rect.width) * 100 - edit.xPct);
      edit.heightPct = Math.max(2, ((t.clientY - rect.top) / rect.height) * 100 - edit.yPct);
      el.style.width = `${edit.widthPct}%`;
      el.style.height = `${edit.heightPct}%`;
    }, { passive: false });
    window.addEventListener('mouseup', () => { resizing = false; });
    window.addEventListener('touchend', () => { resizing = false; });

    previewWrap.appendChild(el);
  }

  // ---- shape rendering ----

  const SHAPE_COLORS = ['#16140f', '#c1502e', '#6f97c9'];

  // Each shape's geometry as one or more polylines in local 0-100 space,
  // relative to its own bounding box. Shared by the live preview (SVG)
  // and the final PDF export, so rotation only needs to be handled once.
  function getLocalShapePolylines(shapeKind, state) {
    if (shapeKind === 'rect') return [[[2, 2], [98, 2], [98, 98], [2, 98], [2, 2]]];
    if (shapeKind === 'circle') {
      const pts = [];
      const N = 40;
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * 2 * Math.PI;
        pts.push([50 + 46 * Math.cos(a), 50 + 46 * Math.sin(a)]);
      }
      return [pts];
    }
    if (shapeKind === 'line') return [[[5, 95], [95, 5]]];
    if (shapeKind === 'arrow') return [[[5, 95], [92, 8]], [[92, 8], [72, 12]], [[92, 8], [88, 28]]];
    if (shapeKind === 'cross') return [[[6, 6], [94, 94]], [[94, 6], [6, 94]]];
    if (shapeKind === 'check') return [[[8, 55], [38, 85], [92, 12]]];
    if (shapeKind === 'checkbox') {
      const box = [[4, 4], [96, 4], [96, 96], [4, 96], [4, 4]];
      const mark = state === 'cross'
        ? [[[22, 22], [78, 78]], [[78, 22], [22, 78]]]
        : [[[15, 52], [40, 78], [85, 15]]];
      return [box, ...mark];
    }
    return [];
  }

  function rotateLocalPoint(x, y, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = x - 50;
    const dy = y - 50;
    return [50 + dx * cos - dy * sin, 50 + dx * sin + dy * cos];
  }

  function buildShapeSvg(shapeKind, color, strokeWidthPx, state) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    const ns = 'http://www.w3.org/2000/svg';

    getLocalShapePolylines(shapeKind, state).forEach((pts) => {
      const poly = document.createElementNS(ns, 'polyline');
      poly.setAttribute('points', pts.map((p) => p.join(',')).join(' '));
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', color);
      poly.setAttribute('stroke-width', strokeWidthPx);
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      poly.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(poly);
    });

    return svg;
  }

  // ---- rotate handle (shared by shapes and images) ----

  function wireRotate(el, edit, onRotate) {
    const handle = document.createElement('div');
    handle.className = 'rotate-handle';
    el.appendChild(handle);

    let rotating = false;

    function angleFromCenter(clientX, clientY) {
      const rect = previewWrap.getBoundingClientRect();
      const centerX = rect.left + ((edit.xPct + edit.widthPct / 2) / 100) * rect.width;
      const centerY = rect.top + ((edit.yPct + edit.heightPct / 2) / 100) * rect.height;
      let deg = (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI + 90;
      return ((deg % 360) + 360) % 360;
    }

    function down(e) {
      rotating = true;
      e.stopPropagation();
      e.preventDefault();
    }
    function move(e) {
      if (!rotating) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      edit.rotation = angleFromCenter(clientX, clientY);
      onRotate();
    }
    function up() { rotating = false; }

    handle.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    handle.addEventListener('touchstart', down, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);

    return handle;
  }

  // ---- multi-point resize (shared by shapes and images) ----

  const MIN_SIZE_PCT = 3;

  function wireMultiResize(el, edit, opts, onResize) {
    const aspectLocked = !!opts.aspectLocked;
    const aspectRatio = aspectLocked ? edit.naturalH / edit.naturalW : null;

    function addHandle(direction, className) {
      const handle = document.createElement('div');
      handle.className = `resize-handle-dot ${className}`;
      el.appendChild(handle);

      let dragging = false;
      function down(e) { dragging = true; e.stopPropagation(); e.preventDefault(); }
      function move(e) {
        if (!dragging) return;
        const rect = previewWrap.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const px = ((clientX - rect.left) / rect.width) * 100;
        const py = ((clientY - rect.top) / rect.height) * 100;
        const rightEdge = edit.xPct + edit.widthPct;
        const bottomEdge = edit.yPct + edit.heightPct;

        if (aspectLocked && (direction === 'corner')) {
          const newWidth = Math.max(MIN_SIZE_PCT, px - edit.xPct);
          edit.widthPct = newWidth;
          edit.heightPct = newWidth * aspectRatio * (rect.width / rect.height);
        } else {
          if (direction === 'right' || direction === 'corner') {
            edit.widthPct = Math.max(MIN_SIZE_PCT, px - edit.xPct);
          }
          if (direction === 'left') {
            const newWidth = Math.max(MIN_SIZE_PCT, rightEdge - px);
            edit.xPct = rightEdge - newWidth;
            edit.widthPct = newWidth;
          }
          if (direction === 'bottom' || direction === 'corner') {
            edit.heightPct = Math.max(MIN_SIZE_PCT, py - edit.yPct);
          }
          if (direction === 'top') {
            const newHeight = Math.max(MIN_SIZE_PCT, bottomEdge - py);
            edit.yPct = bottomEdge - newHeight;
            edit.heightPct = newHeight;
          }
        }

        el.style.left = `${edit.xPct}%`;
        el.style.top = `${edit.yPct}%`;
        el.style.width = `${edit.widthPct}%`;
        el.style.height = `${edit.heightPct}%`;
        onResize();
      }
      function up() { dragging = false; }

      handle.addEventListener('mousedown', down);
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      handle.addEventListener('touchstart', down, { passive: false });
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('touchend', up);
    }

    addHandle('corner', 'corner');
    addHandle('top', 'edge-top');
    addHandle('bottom', 'edge-bottom');
    addHandle('left', 'edge-left');
    addHandle('right', 'edge-right');
  }

  function createShapeDom(edit) {
    const el = document.createElement('div');
    el.className = 'edit-el shape-el';
    el.style.left = `${edit.xPct}%`;
    el.style.top = `${edit.yPct}%`;
    el.style.width = `${edit.widthPct}%`;
    el.style.height = `${edit.heightPct}%`;
    el.style.transform = `rotate(${edit.rotation || 0}deg)`;

    const strokePx = edit.strokeWidthPct * 6;
    const svg = buildShapeSvg(edit.shapeKind, edit.color, strokePx, edit.checkState);
    el.appendChild(svg);

    if (edit.shapeKind === 'checkbox') {
      el.style.cursor = 'pointer';
      let downX = 0, downY = 0, downTime = 0;
      el.addEventListener('mousedown', (e) => {
        downX = e.clientX; downY = e.clientY; downTime = Date.now();
      });
      el.addEventListener('mouseup', (e) => {
        const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
        if (moved < 4 && Date.now() - downTime < 400) {
          edit.checkState = edit.checkState === 'cross' ? 'check' : 'cross';
          el.replaceChild(
            buildShapeSvg(edit.shapeKind, edit.color, edit.strokeWidthPct * 6, edit.checkState),
            el.querySelector('svg')
          );
        }
      });
    }

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn-box';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edits = edits.filter((x) => x.id !== edit.id);
      renderPageElements();
      validateDownload();
    });
    el.appendChild(delBtn);

    const dupBtn = document.createElement('button');
    dupBtn.className = 'dup-btn-box';
    dupBtn.textContent = '⧉';
    dupBtn.title = window.veloraT ? window.veloraT('edit_copy_title') : 'Copy';
    dupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateEdit(edit);
    });
    el.appendChild(dupBtn);

    const controls = document.createElement('div');
    controls.className = 'shape-controls';
    SHAPE_COLORS.forEach((c) => {
      const sw = document.createElement('span');
      sw.className = 'mini-swatch' + (c === edit.color ? ' selected' : '');
      sw.style.background = c;
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        edit.color = c;
        el.replaceChild(buildShapeSvg(edit.shapeKind, edit.color, edit.strokeWidthPct * 6, edit.checkState), el.querySelector('svg'));
        controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.toggle('selected', s === sw));
        colorPicker.value = c;
      });
      controls.appendChild(sw);
    });
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'color-picker';
    colorPicker.value = edit.color;
    colorPicker.addEventListener('click', (e) => e.stopPropagation());
    colorPicker.addEventListener('mousedown', (e) => e.stopPropagation());
    colorPicker.addEventListener('input', (e) => {
      edit.color = e.target.value;
      el.replaceChild(buildShapeSvg(edit.shapeKind, edit.color, edit.strokeWidthPct * 6, edit.checkState), el.querySelector('svg'));
      controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
    });
    controls.appendChild(colorPicker);

    const strokeSel = document.createElement('input');
    strokeSel.type = 'range';
    strokeSel.min = '0.5';
    strokeSel.max = '10';
    strokeSel.step = '0.5';
    strokeSel.value = String(edit.strokeWidthPct);
    strokeSel.className = 'stroke-slider';
    strokeSel.title = 'Stroke width';
    strokeSel.addEventListener('click', (e) => e.stopPropagation());
    strokeSel.addEventListener('mousedown', (e) => e.stopPropagation());
    strokeSel.addEventListener('input', () => {
      edit.strokeWidthPct = parseFloat(strokeSel.value);
      el.replaceChild(buildShapeSvg(edit.shapeKind, edit.color, edit.strokeWidthPct * 6, edit.checkState), el.querySelector('svg'));
    });
    controls.appendChild(strokeSel);
    el.appendChild(controls);

    wireRotate(el, edit, () => {
      el.style.transform = `rotate(${edit.rotation}deg)`;
    });

    wireDrag(el, edit, () => {
      el.style.left = `${edit.xPct}%`;
      el.style.top = `${edit.yPct}%`;
    });

    wireMultiResize(el, edit, { aspectLocked: false }, () => {
      el.replaceChild(buildShapeSvg(edit.shapeKind, edit.color, edit.strokeWidthPct * 6, edit.checkState), el.querySelector('svg'));
    });

    previewWrap.appendChild(el);
  }

  // ---- image rendering ----

  function createImageDom(edit) {
    const el = document.createElement('div');
    el.className = 'edit-el image-el';
    el.style.left = `${edit.xPct}%`;
    el.style.top = `${edit.yPct}%`;
    el.style.width = `${edit.widthPct}%`;
    el.style.height = `${edit.heightPct}%`;
    el.style.transform = `rotate(${edit.rotation || 0}deg)`;

    const img = document.createElement('img');
    img.src = edit.dataUrl;
    img.style.opacity = (edit.opacity ?? 100) / 100;
    el.appendChild(img);

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn-box';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edits = edits.filter((x) => x.id !== edit.id);
      renderPageElements();
      validateDownload();
    });
    el.appendChild(delBtn);

    const dupBtn = document.createElement('button');
    dupBtn.className = 'dup-btn-box';
    dupBtn.textContent = '⧉';
    dupBtn.title = window.veloraT ? window.veloraT('edit_copy_title') : 'Copy';
    dupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateEdit(edit);
    });
    el.appendChild(dupBtn);

    const controls = document.createElement('div');
    controls.className = 'shape-controls';
    const opLabel = document.createElement('span');
    opLabel.style.fontSize = '11px';
    opLabel.style.color = 'var(--paper-dim)';
    opLabel.textContent = 'Opacity';
    controls.appendChild(opLabel);
    const opSlider = document.createElement('input');
    opSlider.type = 'range';
    opSlider.min = '10';
    opSlider.max = '100';
    opSlider.step = '5';
    opSlider.value = String(edit.opacity ?? 100);
    opSlider.className = 'stroke-slider';
    opSlider.addEventListener('click', (e) => e.stopPropagation());
    opSlider.addEventListener('mousedown', (e) => e.stopPropagation());
    opSlider.addEventListener('input', () => {
      edit.opacity = parseInt(opSlider.value, 10);
      img.style.opacity = edit.opacity / 100;
    });
    controls.appendChild(opSlider);
    el.appendChild(controls);

    wireRotate(el, edit, () => {
      el.style.transform = `rotate(${edit.rotation}deg)`;
    });

    wireDrag(el, edit, () => {
      el.style.left = `${edit.xPct}%`;
      el.style.top = `${edit.yPct}%`;
    });

    wireMultiResize(el, edit, { aspectLocked: true }, () => {});

    previewWrap.appendChild(el);
  }

  // ---- toolbar actions ----

  addTextBtn.addEventListener('click', () => {
    const edit = {
      id: newId(),
      type: 'text',
      pageNum: currentPage,
      xPct: 15,
      yPct: 15,
      text: 'Text',
      color: COLORS[0],
      fontSizePct: 5.5,
      fontFamily: 'Helvetica',
      bold: false,
      italic: false,
    };
    edits.push(edit);
    renderPageElements();
    validateDownload();
  });

  addWhiteoutBtn.addEventListener('click', () => {
    const edit = {
      id: newId(),
      type: 'whiteout',
      pageNum: currentPage,
      xPct: 15,
      yPct: 15,
      widthPct: 30,
      heightPct: 6,
      color: '#ffffff',
      baseColor: '#ffffff',
      colorAdjust: 0,
    };
    edits.push(edit);
    renderPageElements();
    validateDownload();
  });

  addHighlightBtn.addEventListener('click', () => {
    const edit = {
      id: newId(),
      type: 'highlight',
      pageNum: currentPage,
      xPct: 15,
      yPct: 15,
      widthPct: 30,
      heightPct: 6,
      color: HIGHLIGHT_COLORS[0],
      baseColor: HIGHLIGHT_COLORS[0],
      colorAdjust: 0,
      opacity: 40,
    };
    edits.push(edit);
    renderPageElements();
    validateDownload();
  });

  // ---- shape tool ----

  shapeToolBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    shapePopover.classList.toggle('active');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.shape-picker-wrap')) shapePopover.classList.remove('active');
  });
  shapePopover.querySelectorAll('button[data-shape]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.shape;
      const edit = {
        id: newId(),
        type: 'shape',
        shapeKind: kind,
        pageNum: currentPage,
        xPct: 25,
        yPct: 25,
        widthPct: 25,
        heightPct: kind === 'line' || kind === 'arrow' ? 15 : 20,
        color: SHAPE_COLORS[0],
        strokeWidthPct: 3,
        rotation: 0,
        checkState: 'check',
      };
      edits.push(edit);
      renderPageElements();
      validateDownload();
      shapePopover.classList.remove('active');
    });
  });

  // ---- page number (quick preset into headerFooterConfig) ----

  let pnSelectedSlot = 'footerCenter';

  if (pageNumberBtn) {
    pageNumberBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pageNumberPopover.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#pageNumberPopover') && e.target !== pageNumberBtn) {
        pageNumberPopover.classList.remove('active');
      }
    });
    pageNumberPopover.querySelectorAll('button[data-pos]').forEach((btn) => {
      btn.addEventListener('click', () => {
        pnSelectedSlot = btn.dataset.pos;
        pageNumberPopover.querySelectorAll('button[data-pos]').forEach((b) => b.classList.toggle('pn-selected', b === btn));
      });
    });
    if (pnAddBtn) {
      pnAddBtn.addEventListener('click', () => {
        headerFooterConfig[pnSelectedSlot] = pnFormatSelect.value;
        renderHeaderFooterPreview();
        validateDownload();
        pageNumberPopover.classList.remove('active');
      });
    }
  }

  // ---- image tool ----

  imageToolBtn.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', async () => {
    const file = imageInput.files[0];
    imageInput.value = '';
    if (!file) return;

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

    const heightPct = 25 * (dims.h / dims.w) * (previewWrap.clientWidth / previewWrap.clientHeight);
    const edit = {
      id: newId(),
      type: 'image',
      pageNum: currentPage,
      xPct: 25,
      yPct: 25,
      widthPct: 25,
      heightPct: heightPct || 20,
      dataUrl,
      arrayBuffer,
      imgType: file.type === 'image/png' ? 'png' : 'jpg',
      naturalW: dims.w,
      naturalH: dims.h,
      rotation: 0,
      opacity: 100,
    };
    edits.push(edit);
    renderPageElements();
    validateDownload();
  });

  async function goToPage(n) {
    n = Math.max(1, Math.min(pageCount, n));
    const ok = await renderBasePage(n);
    if (ok) {
      currentPage = n;
      pageNumInput.value = n;
    } else {
      pageNumInput.value = currentPage;
    }
  }

  pageNumInput.addEventListener('change', () => {
    const n = parseInt(pageNumInput.value, 10) || currentPage;
    goToPage(n);
  });
  prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
  nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));

  // ---- file loading ----

  // ---- password-protected PDF handling ----

  const passwordModal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('passwordInput');
  const passwordError = document.getElementById('passwordError');
  const passwordUnlockBtn = document.getElementById('passwordUnlockBtn');
  const passwordCancelBtn = document.getElementById('passwordCancelBtn');

  function promptForPassword(isRetry) {
    return new Promise((resolve) => {
      passwordError.classList.toggle('visible', !!isRetry);
      passwordInput.value = '';
      passwordModal.classList.add('active');
      setTimeout(() => passwordInput.focus(), 50);

      function cleanup() {
        passwordModal.classList.remove('active');
        passwordUnlockBtn.removeEventListener('click', onUnlock);
        passwordCancelBtn.removeEventListener('click', onCancel);
        passwordInput.removeEventListener('keydown', onKeydown);
      }
      function onUnlock() {
        cleanup();
        resolve(passwordInput.value);
      }
      function onCancel() {
        cleanup();
        resolve(null);
      }
      function onKeydown(e) {
        if (e.key === 'Enter') onUnlock();
        if (e.key === 'Escape') onCancel();
      }

      passwordUnlockBtn.addEventListener('click', onUnlock);
      passwordCancelBtn.addEventListener('click', onCancel);
      passwordInput.addEventListener('keydown', onKeydown);
    });
  }

  async function loadPdfWithPasswordSupport(arrayBuffer) {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
    let cancelled = false;

    loadingTask.onPassword = (callback, reason) => {
      promptForPassword(reason === 2).then((pwd) => {
        if (pwd === null) {
          cancelled = true;
          loadingTask.destroy();
          return;
        }
        sourcePassword = pwd;
        callback(pwd);
      });
    };

    try {
      return await loadingTask.promise;
    } catch (err) {
      if (cancelled) throw new Error('cancelled');
      throw err;
    }
  }

  async function loadFile(file) {
    setStatus('reading file…');
    previewWrap.innerHTML = '';
    edits = [];
    sourcePassword = null;
    zoomPct = 100;
    applyZoom();
    turnOffMarkMode();
    turnOffDrawMode();
    turnOffScreenshotMode();
    headerFooterConfig = {
      headerLeft: '', headerCenter: '', headerRight: '',
      footerLeft: '', footerCenter: '', footerRight: '',
      fontSizePct: 1.8,
      color: '#16140f',
    };

    const arrayBuffer = await file.arrayBuffer();
    sourceArrayBuffer = arrayBuffer;
    sourceFileName = file.name;

    let doc;
    try {
      doc = await loadPdfWithPasswordSupport(arrayBuffer);
    } catch (err) {
      console.error(err);
      setStatus(err.message === 'cancelled' ? '' : "couldn't open this file — is it a valid PDF?");
      return;
    }
    pdfDocProxy = doc;
    pageCount = pdfDocProxy.numPages;
    currentPage = 1;

    docNameEl.textContent = file.name;
    pageNumInput.value = 1;
    pageNumInput.max = pageCount;
    pageOfEl.textContent = `of ${pageCount}`;

    toolbar.classList.add('active');
    workspace.classList.add('active');
    window.VeloraQuickActions.render(document.getElementById('quickActions'), 'edit.html', async () => {
      if (edits.length === 0) return sourceArrayBuffer;
      const { bytes } = await buildEditedPdf();
      return bytes;
    }, () => sourceFileName);
    actionsBar.classList.add('active');

    await renderBasePage(1);
    validateDownload();
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
    window.VeloraQuickActions.hide(document.getElementById('quickActions'));
    sourceArrayBuffer = null;
    sourcePassword = null;
    pdfDocProxy = null;
    pageCount = 0;
    edits = [];
    drawMode = false;
    currentStroke = null;
    removeLiveDrawSvg();
    drawToolBtn.classList.remove('toggled');
    drawControls.classList.remove('active');
    previewWrap.innerHTML = '';
    previewWrap.appendChild(drawControls);
    toolbar.classList.remove('active');
    workspace.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  // ---- download ----

  async function buildEditedPdf() {
    const { PDFDocument, StandardFonts, rgb, LineCapStyle, BlendMode } = PDFLib;
    const loadOpts = sourcePassword ? { password: sourcePassword } : undefined;
    const pdfDoc = await PDFDocument.load(sourceArrayBuffer.slice(0), loadOpts);
    pdfDoc.registerFontkit(fontkit);
    const pages = pdfDoc.getPages();

    const STANDARD_SETS = {
      Helvetica: [StandardFonts.Helvetica, StandardFonts.HelveticaBold, StandardFonts.HelveticaOblique, StandardFonts.HelveticaBoldOblique],
      TimesRoman: [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold, StandardFonts.TimesRomanItalic, StandardFonts.TimesRomanBoldItalic],
      Courier: [StandardFonts.Courier, StandardFonts.CourierBold, StandardFonts.CourierOblique, StandardFonts.CourierBoldOblique],
    };

    const embeddedCache = {};
    let anyFontFailed = false;

    async function getEmbeddedSet(familyKey) {
      if (embeddedCache[familyKey]) return embeddedCache[familyKey];

      const entry = catalogEntry(familyKey);
      if (entry.standard) {
        const set = await Promise.all(STANDARD_SETS[entry.key].map((f) => pdfDoc.embedFont(f)));
        embeddedCache[familyKey] = set;
        return set;
      }

      try {
        const order = ['r', 'b', 'i', 'bi'];
        const bytesList = await Promise.all(
          order.map((k) => {
            const url = entry.urls[k] || entry.urls.r;
            return fetch(url).then((res) => {
              if (!res.ok) throw new Error(`fetch failed: ${url}`);
              return res.arrayBuffer();
            });
          })
        );
        const set = await Promise.all(bytesList.map((bytes) => pdfDoc.embedFont(bytes, { subset: true })));
        embeddedCache[familyKey] = set;
        return set;
      } catch (err) {
        console.error(`Could not load font "${entry.label}", using Helvetica instead`, err);
        anyFontFailed = true;
        const fallback = await getEmbeddedSet('Helvetica');
        embeddedCache[familyKey] = fallback;
        return fallback;
      }
    }

    async function pickFont(edit) {
      const set = await getEmbeddedSet(edit.fontFamily);
      const idx = (edit.bold ? 1 : 0) + (edit.italic ? 2 : 0);
      return set[idx];
    }

    function hexToRgb(hex) {
      const n = parseInt(hex.replace('#', ''), 16);
      return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
    }

    function wrapLines(text, font, fontSize, maxWidth) {
      const lines = [];
      text.split('\n').forEach((paragraph) => {
        const words = paragraph.split(' ');
        let current = '';
        words.forEach((word) => {
          const candidate = current ? `${current} ${word}` : word;
          if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
            lines.push(current);
            current = word;
          } else {
            current = candidate;
          }
        });
        lines.push(current);
      });
      return lines;
    }

    const BENGALI_RANGE = /[\u0980-\u09FF]/;
    let skippedCount = 0;

    for (const edit of edits) {
      const page = pages[edit.pageNum - 1];
      if (!page) continue;
      const { width, height } = page.getSize();

      try {
        if (edit.type === 'whiteout' || edit.type === 'highlight') {
          const isHighlight = edit.type === 'highlight';
          const x = width * (edit.xPct / 100);
          const boxWidth = width * (edit.widthPct / 100);
          const boxHeight = height * (edit.heightPct / 100);
          const y = height - height * (edit.yPct / 100) - boxHeight;
          const { r, g, b } = hexToRgb(edit.color || (isHighlight ? '#ffeb3b' : '#ffffff'));
          const drawOpts = { x, y, width: boxWidth, height: boxHeight, color: rgb(r, g, b) };
          if (isHighlight) {
            drawOpts.opacity = (edit.opacity ?? 40) / 100;
            drawOpts.blendMode = BlendMode.Multiply;
          }
          page.drawRectangle(drawOpts);
        } else if (edit.type === 'textHighlight' || edit.type === 'underline' || edit.type === 'strikethrough') {
          const { r, g, b } = hexToRgb(edit.color);
          edit.rects.forEach((rect) => {
            const rx = width * (rect.xPct / 100);
            const rw = width * (rect.widthPct / 100);
            const rh = height * (rect.heightPct / 100);
            const ry = height - height * (rect.yPct / 100) - rh;
            if (edit.type === 'textHighlight') {
              page.drawRectangle({
                x: rx, y: ry, width: rw, height: rh,
                color: rgb(r, g, b),
                opacity: (edit.opacity ?? 40) / 100,
                blendMode: BlendMode.Multiply,
              });
            } else {
              const lineY = edit.type === 'underline' ? ry + rh * 0.08 : ry + rh * 0.5;
              page.drawLine({
                start: { x: rx, y: lineY },
                end: { x: rx + rw, y: lineY },
                thickness: Math.max(0.6, rh * 0.06),
                color: rgb(r, g, b),
              });
            }
          });
        } else if (edit.type === 'shape') {
          const { r, g, b } = hexToRgb(edit.color);
          const thickness = edit.strokeWidthPct;
          const bx = width * (edit.xPct / 100);
          const bw = width * (edit.widthPct / 100);
          const by = height - height * (edit.yPct / 100) - height * (edit.heightPct / 100);
          const bh = height * (edit.heightPct / 100);
          const rotation = edit.rotation || 0;

          // Map a local 0-100 point (rotated around the box's own center)
          // into this box's absolute PDF coordinates (PDF y-axis points up).
          const toPdfPoint = ([lx, ly]) => {
            const [rx, ry] = rotateLocalPoint(lx, ly, rotation);
            return { x: bx + (rx / 100) * bw, y: by + bh - (ry / 100) * bh };
          };

          getLocalShapePolylines(edit.shapeKind, edit.checkState).forEach((pts) => {
            for (let i = 0; i < pts.length - 1; i++) {
              const start = toPdfPoint(pts[i]);
              const end = toPdfPoint(pts[i + 1]);
              page.drawLine({ start, end, thickness, color: rgb(r, g, b), lineCap: LineCapStyle.Round });
            }
          });
        } else if (edit.type === 'image') {
          const embedded = edit.imgType === 'png'
            ? await pdfDoc.embedPng(edit.arrayBuffer)
            : await pdfDoc.embedJpg(edit.arrayBuffer);
          const bx = width * (edit.xPct / 100);
          const bw = width * (edit.widthPct / 100);
          const bh = height * (edit.heightPct / 100);
          const by = height - height * (edit.yPct / 100) - bh;
          const imgRotation = edit.rotation || 0;
          const imgOpacity = (edit.opacity ?? 100) / 100;

          if (imgRotation) {
            const { pushGraphicsState, popGraphicsState, concatTransformationMatrix } = PDFLib;
            const cx = bx + bw / 2;
            const cy = by + bh / 2;
            const rad = (imgRotation * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            page.pushOperators(
              pushGraphicsState(),
              concatTransformationMatrix(1, 0, 0, 1, cx, cy),
              concatTransformationMatrix(cos, sin, -sin, cos, 0, 0)
            );
            page.drawImage(embedded, { x: -bw / 2, y: -bh / 2, width: bw, height: bh, opacity: imgOpacity });
            page.pushOperators(popGraphicsState());
          } else {
            page.drawImage(embedded, { x: bx, y: by, width: bw, height: bh, opacity: imgOpacity });
          }
        } else if (edit.type === 'drawing') {
          edit.strokes.forEach((stroke) => {
            const { r, g, b } = hexToRgb(stroke.color);
            const thickness = stroke.widthPct;
            for (let i = 0; i < stroke.points.length - 1; i++) {
              const p1 = stroke.points[i];
              const p2 = stroke.points[i + 1];
              page.drawLine({
                start: { x: width * (p1.xPct / 100), y: height - height * (p1.yPct / 100) },
                end: { x: width * (p2.xPct / 100), y: height - height * (p2.yPct / 100) },
                thickness,
                color: rgb(r, g, b),
                lineCap: LineCapStyle.Round,
              });
            }
          });
        } else if (edit.type === 'text' && edit.text.trim()) {
          const fontSize = width * (edit.fontSizePct / 100);
          const { r, g, b } = hexToRgb(edit.color);
          const effectiveFamily = BENGALI_RANGE.test(edit.text) ? 'HindSiliguri' : edit.fontFamily;
          const font = await pickFont({ ...edit, fontFamily: effectiveFamily });
          const x = width * (edit.xPct / 100);
          const maxWidth = Math.max(fontSize * 3, width - x);
          const lineHeight = fontSize * 1.25;
          const lines = wrapLines(edit.text, font, fontSize, maxWidth);
          let y = height - height * (edit.yPct / 100) - fontSize;
          lines.forEach((line) => {
            page.drawText(line, { x, y, size: fontSize, font, color: rgb(r, g, b) });
            y -= lineHeight;
          });
        }
      } catch (editErr) {
        console.error('Skipped one edit that failed to render', edit, editErr);
        skippedCount += 1;
      }
    }

    if (hasAnyHeaderFooterText()) {
      const hfColor = hexToRgb(headerFooterConfig.color);
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNum = i + 1;
        const marginX = width * (HF_MARGIN_X_PCT / 100);
        const marginY = height * (HF_MARGIN_Y_PCT / 100);
        const fontSize = width * (headerFooterConfig.fontSizePct / 100);

        const slots = [
          [headerFooterConfig.headerLeft, height - marginY, 'left'],
          [headerFooterConfig.headerCenter, height - marginY, 'center'],
          [headerFooterConfig.headerRight, height - marginY, 'right'],
          [headerFooterConfig.footerLeft, marginY, 'left'],
          [headerFooterConfig.footerCenter, marginY, 'center'],
          [headerFooterConfig.footerRight, marginY, 'right'],
        ];

        for (const [raw, y, align] of slots) {
          if (!raw || !raw.trim()) continue;
          try {
            const text = substituteTokens(raw, pageNum, pages.length);
            const effectiveFamily = BENGALI_RANGE.test(text) ? 'HindSiliguri' : 'Helvetica';
            const font = await pickFont({ fontFamily: effectiveFamily, bold: false, italic: false });
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            let x = marginX;
            if (align === 'center') x = width / 2 - textWidth / 2;
            if (align === 'right') x = width - marginX - textWidth;
            page.drawText(text, { x, y, size: fontSize, font, color: rgb(hfColor.r, hfColor.g, hfColor.b) });
          } catch (hfErr) {
            console.error('Skipped one header/footer slot that failed to render', hfErr);
            skippedCount += 1;
          }
        }
      }
    }

    const bytes = await pdfDoc.save();
    return { bytes, anyFontFailed, skippedCount };
  }

  downloadBtn.addEventListener('click', async () => {
    if (!sourceArrayBuffer) return;
    downloadBtn.disabled = true;
    setStatus('applying edits…');

    try {
      const { bytes, anyFontFailed, skippedCount } = await buildEditedPdf();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}-edited.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const warnings = [];
      if (anyFontFailed) warnings.push("some fonts couldn't load and were substituted");
      if (skippedCount) warnings.push(`${skippedCount} edit${skippedCount > 1 ? 's' : ''} couldn't be applied`);
      setStatus(warnings.length ? `done — downloaded (${warnings.join('; ')})` : 'done — edited file downloaded');
    } catch (err) {
      console.error(err);
      setStatus('failed — check the console');
    } finally {
      validateDownload();
    }
  });

  // ---- view & print ----

  viewPrintBtn.addEventListener('click', async () => {
    if (!sourceArrayBuffer) return;
    viewPrintBtn.disabled = true;
    setStatus('preparing preview…');

    try {
      const { bytes } = await buildEditedPdf();
      const viewDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;

      printPagesWrap.innerHTML = '';
      const desiredScale = Math.max(2, window.devicePixelRatio || 1);
      const MAX_DIM = 2400;
      let skippedPrintPages = 0;

      for (let i = 1; i <= viewDoc.numPages; i++) {
        try {
          const page = await viewDoc.getPage(i);
          const baseViewport = page.getViewport({ scale: 1 });
          const longEdge = Math.max(baseViewport.width, baseViewport.height);
          const scale = Math.min(desiredScale, MAX_DIM / longEdge);

          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'print-page-canvas';
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          printPagesWrap.appendChild(canvas);
        } catch (pageErr) {
          console.error(`Failed to render page ${i} for preview`, pageErr);
          skippedPrintPages += 1;
        }
      }

      printModal.classList.add('active');
      setStatus(skippedPrintPages
        ? `${skippedPrintPages} page(s) couldn't render in the preview`
        : 'add text or a whiteout box, then download');
    } catch (err) {
      console.error(err);
      setStatus('preview failed — check the console');
    } finally {
      viewPrintBtn.disabled = false;
    }
  });

  closePrintModalBtn.addEventListener('click', () => {
    printModal.classList.remove('active');
    printPagesWrap.innerHTML = '';
  });

  printNowBtn.addEventListener('click', () => {
    window.print();
  });

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => loadFile(file));
  }
})();
