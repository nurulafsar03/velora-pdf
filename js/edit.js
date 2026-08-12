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
  const drawToolBtn = document.getElementById('drawToolBtn');
  const drawControls = document.getElementById('drawControls');
  const drawColorPicker = document.getElementById('drawColorPicker');
  const strokeSelect = document.getElementById('strokeSelect');
  const clearDrawingBtn = document.getElementById('clearDrawingBtn');
  const doneDrawingBtn = document.getElementById('doneDrawingBtn');
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

  const COLORS = ['#16140f', '#6f97c9', '#c1502e'];
  const WHITEOUT_COLORS = ['#ffffff', '#16140f', '#ede6d6'];
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

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';
  let pdfDocProxy = null;
  let pageCount = 0;
  let currentPage = 1;
  let edits = []; // { id, type, pageNum, xPct, yPct, widthPct, heightPct, text, color, fontSizePct }
  let idCounter = 0;
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
      else if (edit.type === 'whiteout') createWhiteoutDom(edit);
      else if (edit.type === 'drawing') renderDrawingSvg(edit);
      else if (edit.type === 'shape') createShapeDom(edit);
      else if (edit.type === 'image') createImageDom(edit);
    });
  }

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
    }
    currentStroke = null;
    liveDrawPoly = null;
    if (liveDrawSvg) liveDrawSvg.innerHTML = '';
    validateDownload();
  }

  drawToolBtn.addEventListener('click', () => {
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

  doneDrawingBtn.addEventListener('click', () => {
    drawMode = false;
    drawToolBtn.classList.remove('toggled');
    drawControls.classList.remove('active');
    document.querySelectorAll('.edit-el').forEach((n) => { n.style.pointerEvents = ''; });
    removeLiveDrawSvg();
  });

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
    content.style.fontSize = `${edit.fontSizePct * 5}px`;
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
      content.style.fontSize = `${edit.fontSizePct * 5}px`;
    });
    biggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edit.fontSizePct = Math.min(12, edit.fontSizePct + 0.4);
      content.style.fontSize = `${edit.fontSizePct * 5}px`;
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

  function createWhiteoutDom(edit) {
    const el = document.createElement('div');
    el.className = 'edit-el whiteout-el';
    el.style.left = `${edit.xPct}%`;
    el.style.top = `${edit.yPct}%`;
    el.style.width = `${edit.widthPct}%`;
    el.style.height = `${edit.heightPct}%`;
    el.style.background = edit.color;

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

    const controls = document.createElement('div');
    controls.className = 'wo-controls';

    WHITEOUT_COLORS.forEach((c) => {
      const sw = document.createElement('span');
      sw.className = 'mini-swatch' + (c === edit.color ? ' selected' : '');
      sw.style.background = c;
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        edit.color = c;
        edit.baseColor = c;
        edit.colorAdjust = 0;
        adjustSlider.value = 0;
        el.style.background = c;
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
      el.style.background = edit.color;
      controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
    });
    colorPicker.addEventListener('click', (e) => e.stopPropagation());
    colorPicker.addEventListener('mousedown', (e) => e.stopPropagation());
    controls.appendChild(colorPicker);

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
          el.style.background = hex;
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
      el.style.background = edit.color;
      colorPicker.value = edit.color;
    });
    controls.appendChild(adjustSlider);

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

  function buildShapeSvg(shapeKind, color, strokeWidthPx) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    const ns = 'http://www.w3.org/2000/svg';
    const sw = strokeWidthPx;

    function line(x1, y1, x2, y2) {
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', x1); l.setAttribute('y1', y1);
      l.setAttribute('x2', x2); l.setAttribute('y2', y2);
      l.setAttribute('stroke', color);
      l.setAttribute('stroke-width', sw);
      l.setAttribute('stroke-linecap', 'round');
      l.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(l);
    }

    if (shapeKind === 'rect') {
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', 3); r.setAttribute('y', 3);
      r.setAttribute('width', 94); r.setAttribute('height', 94);
      r.setAttribute('fill', 'none'); r.setAttribute('stroke', color);
      r.setAttribute('stroke-width', sw); r.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(r);
    } else if (shapeKind === 'circle') {
      const c = document.createElementNS(ns, 'ellipse');
      c.setAttribute('cx', 50); c.setAttribute('cy', 50);
      c.setAttribute('rx', 46); c.setAttribute('ry', 46);
      c.setAttribute('fill', 'none'); c.setAttribute('stroke', color);
      c.setAttribute('stroke-width', sw); c.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(c);
    } else if (shapeKind === 'line') {
      line(5, 95, 95, 5);
    } else if (shapeKind === 'arrow') {
      line(5, 95, 92, 8);
      line(92, 8, 72, 12);
      line(92, 8, 88, 28);
    } else if (shapeKind === 'cross') {
      line(6, 6, 94, 94);
      line(94, 6, 6, 94);
    } else if (shapeKind === 'check') {
      line(8, 55, 38, 85);
      line(38, 85, 92, 12);
    }

    return svg;
  }

  function createShapeDom(edit) {
    const el = document.createElement('div');
    el.className = 'edit-el shape-el';
    el.style.left = `${edit.xPct}%`;
    el.style.top = `${edit.yPct}%`;
    el.style.width = `${edit.widthPct}%`;
    el.style.height = `${edit.heightPct}%`;

    const strokePx = edit.strokeWidthPct * 6;
    const svg = buildShapeSvg(edit.shapeKind, edit.color, strokePx);
    el.appendChild(svg);

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

    const controls = document.createElement('div');
    controls.className = 'shape-controls';
    SHAPE_COLORS.forEach((c) => {
      const sw = document.createElement('span');
      sw.className = 'mini-swatch' + (c === edit.color ? ' selected' : '');
      sw.style.background = c;
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        edit.color = c;
        el.replaceChild(buildShapeSvg(edit.shapeKind, edit.color, edit.strokeWidthPct * 6), el.querySelector('svg'));
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
      el.replaceChild(buildShapeSvg(edit.shapeKind, edit.color, edit.strokeWidthPct * 6), el.querySelector('svg'));
      controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
    });
    controls.appendChild(colorPicker);

    const strokeSel = document.createElement('select');
    [['0.3', 'Thin'], ['0.6', 'Medium'], ['1.1', 'Thick']].forEach(([val, label]) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = label;
      if (parseFloat(val) === edit.strokeWidthPct) opt.selected = true;
      strokeSel.appendChild(opt);
    });
    strokeSel.addEventListener('click', (e) => e.stopPropagation());
    strokeSel.addEventListener('mousedown', (e) => e.stopPropagation());
    strokeSel.addEventListener('change', () => {
      edit.strokeWidthPct = parseFloat(strokeSel.value);
      el.replaceChild(buildShapeSvg(edit.shapeKind, edit.color, edit.strokeWidthPct * 6), el.querySelector('svg'));
    });
    controls.appendChild(strokeSel);
    el.appendChild(controls);

    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    el.appendChild(handle);

    wireDrag(el, edit, () => {
      el.style.left = `${edit.xPct}%`;
      el.style.top = `${edit.yPct}%`;
    });

    let resizing = false;
    handle.addEventListener('mousedown', (e) => { resizing = true; e.stopPropagation(); e.preventDefault(); });
    handle.addEventListener('touchstart', (e) => { resizing = true; e.stopPropagation(); e.preventDefault(); }, { passive: false });
    window.addEventListener('mousemove', (e) => {
      if (!resizing) return;
      const rect = previewWrap.getBoundingClientRect();
      edit.widthPct = Math.max(3, ((e.clientX - rect.left) / rect.width) * 100 - edit.xPct);
      edit.heightPct = Math.max(3, ((e.clientY - rect.top) / rect.height) * 100 - edit.yPct);
      el.style.width = `${edit.widthPct}%`;
      el.style.height = `${edit.heightPct}%`;
    });
    window.addEventListener('touchmove', (e) => {
      if (!resizing) return;
      const rect = previewWrap.getBoundingClientRect();
      const t = e.touches[0];
      edit.widthPct = Math.max(3, ((t.clientX - rect.left) / rect.width) * 100 - edit.xPct);
      edit.heightPct = Math.max(3, ((t.clientY - rect.top) / rect.height) * 100 - edit.yPct);
      el.style.width = `${edit.widthPct}%`;
      el.style.height = `${edit.heightPct}%`;
    }, { passive: false });
    window.addEventListener('mouseup', () => { resizing = false; });
    window.addEventListener('touchend', () => { resizing = false; });

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

    const img = document.createElement('img');
    img.src = edit.dataUrl;
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

    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    el.appendChild(handle);

    wireDrag(el, edit, () => {
      el.style.left = `${edit.xPct}%`;
      el.style.top = `${edit.yPct}%`;
    });

    let resizing = false;
    handle.addEventListener('mousedown', (e) => { resizing = true; e.stopPropagation(); e.preventDefault(); });
    handle.addEventListener('touchstart', (e) => { resizing = true; e.stopPropagation(); e.preventDefault(); }, { passive: false });
    window.addEventListener('mousemove', (e) => {
      if (!resizing) return;
      const rect = previewWrap.getBoundingClientRect();
      const newWidthPct = Math.max(3, ((e.clientX - rect.left) / rect.width) * 100 - edit.xPct);
      edit.widthPct = newWidthPct;
      edit.heightPct = newWidthPct * (edit.naturalH / edit.naturalW) * (rect.width / rect.height);
      el.style.width = `${edit.widthPct}%`;
      el.style.height = `${edit.heightPct}%`;
    });
    window.addEventListener('touchmove', (e) => {
      if (!resizing) return;
      const rect = previewWrap.getBoundingClientRect();
      const t = e.touches[0];
      const newWidthPct = Math.max(3, ((t.clientX - rect.left) / rect.width) * 100 - edit.xPct);
      edit.widthPct = newWidthPct;
      edit.heightPct = newWidthPct * (edit.naturalH / edit.naturalW) * (rect.width / rect.height);
      el.style.width = `${edit.widthPct}%`;
      el.style.height = `${edit.heightPct}%`;
    }, { passive: false });
    window.addEventListener('mouseup', () => { resizing = false; });
    window.addEventListener('touchend', () => { resizing = false; });

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
        strokeWidthPct: 0.6,
      };
      edits.push(edit);
      renderPageElements();
      validateDownload();
      shapePopover.classList.remove('active');
    });
  });

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

  async function loadFile(file) {
    setStatus('reading file…');
    previewWrap.innerHTML = '';
    edits = [];

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
    const { PDFDocument, StandardFonts, rgb, LineCapStyle } = PDFLib;
    const pdfDoc = await PDFDocument.load(sourceArrayBuffer.slice(0));
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
        if (edit.type === 'whiteout') {
          const x = width * (edit.xPct / 100);
          const boxWidth = width * (edit.widthPct / 100);
          const boxHeight = height * (edit.heightPct / 100);
          const y = height - height * (edit.yPct / 100) - boxHeight;
          const { r, g, b } = hexToRgb(edit.color || '#ffffff');
          page.drawRectangle({ x, y, width: boxWidth, height: boxHeight, color: rgb(r, g, b) });
        } else if (edit.type === 'shape') {
          const { r, g, b } = hexToRgb(edit.color);
          const thickness = width * (edit.strokeWidthPct / 100);
          const bx = width * (edit.xPct / 100);
          const bw = width * (edit.widthPct / 100);
          const by = height - height * (edit.yPct / 100) - height * (edit.heightPct / 100);
          const bh = height * (edit.heightPct / 100);

          // Map the 0-100 local shape coordinates (see buildShapeSvg) into
          // this box's absolute PDF coordinates (PDF y-axis points up).
          const px = (lx) => bx + (lx / 100) * bw;
          const py = (ly) => by + bh - (ly / 100) * bh;
          const seg = (x1, y1, x2, y2) => page.drawLine({
            start: { x: px(x1), y: py(y1) },
            end: { x: px(x2), y: py(y2) },
            thickness,
            color: rgb(r, g, b),
            lineCap: LineCapStyle.Round,
          });

          if (edit.shapeKind === 'rect') {
            page.drawRectangle({ x: bx, y: by, width: bw, height: bh, borderColor: rgb(r, g, b), borderWidth: thickness });
          } else if (edit.shapeKind === 'circle') {
            page.drawEllipse({ x: bx + bw / 2, y: by + bh / 2, xScale: bw / 2, yScale: bh / 2, borderColor: rgb(r, g, b), borderWidth: thickness });
          } else if (edit.shapeKind === 'line') {
            seg(5, 95, 95, 5);
          } else if (edit.shapeKind === 'arrow') {
            seg(5, 95, 92, 8);
            seg(92, 8, 72, 12);
            seg(92, 8, 88, 28);
          } else if (edit.shapeKind === 'cross') {
            seg(6, 6, 94, 94);
            seg(94, 6, 6, 94);
          } else if (edit.shapeKind === 'check') {
            seg(8, 55, 38, 85);
            seg(38, 85, 92, 12);
          }
        } else if (edit.type === 'image') {
          const embedded = edit.imgType === 'png'
            ? await pdfDoc.embedPng(edit.arrayBuffer)
            : await pdfDoc.embedJpg(edit.arrayBuffer);
          const bx = width * (edit.xPct / 100);
          const bw = width * (edit.widthPct / 100);
          const bh = height * (edit.heightPct / 100);
          const by = height - height * (edit.yPct / 100) - bh;
          page.drawImage(embedded, { x: bx, y: by, width: bw, height: bh });
        } else if (edit.type === 'drawing') {
          edit.strokes.forEach((stroke) => {
            const { r, g, b } = hexToRgb(stroke.color);
            const thickness = width * (stroke.widthPct / 100);
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
