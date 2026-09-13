(() => {
  'use strict';

  const page = document.getElementById('page');
  const docNameInput = document.getElementById('docName');
  const statusText = document.getElementById('statusText');
  const downloadBtn = document.getElementById('downloadBtn');

  const blockStyleSelect = document.getElementById('blockStyleSelect');
  const fontFamilySelect = document.getElementById('fontFamilySelect');
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  const boldBtn = document.getElementById('boldBtn');
  const italicBtn = document.getElementById('italicBtn');
  const underlineBtn = document.getElementById('underlineBtn');
  const fontColorInput = document.getElementById('fontColorInput');
  const fontBgColorInput = document.getElementById('fontBgColorInput');
  const pageBgColorInput = document.getElementById('pageBgColorInput');
  const alignLeftBtn = document.getElementById('alignLeftBtn');
  const alignCenterBtn = document.getElementById('alignCenterBtn');
  const alignRightBtn = document.getElementById('alignRightBtn');
  const bulletListBtn = document.getElementById('bulletListBtn');
  const numberListBtn = document.getElementById('numberListBtn');

  const insertFieldBtn = document.getElementById('insertFieldBtn');
  const fieldMenu = document.getElementById('fieldMenu');
  const dropdownModal = document.getElementById('dropdownModal');
  const optRows = document.getElementById('optRows');
  const addOptRowBtn = document.getElementById('addOptRowBtn');
  const insertDropdownBtn = document.getElementById('insertDropdownBtn');
  const cancelDropdownBtn = document.getElementById('cancelDropdownBtn');

  let fieldCounter = 0;
  let savedRange = null;

  function setStatus(msg) { statusText.textContent = msg; setTimeout(() => { if (statusText.textContent === msg) statusText.textContent = ''; }, 2000); }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange = sel.getRangeAt(0).cloneRange();
  }
  function restoreSelection() {
    if (!savedRange) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  page.addEventListener('mouseup', saveSelection);
  page.addEventListener('keyup', saveSelection);
  page.addEventListener('focus', () => { if (!savedRange) placeCursorAtEnd(); });

  function placeCursorAtEnd() {
    const range = document.createRange();
    range.selectNodeContents(page);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    saveSelection();
  }

  page.focus();
  placeCursorAtEnd();

  // ---- basic formatting via execCommand ----

  function exec(cmd, value) {
    page.focus();
    restoreSelection();
    document.execCommand(cmd, false, value ?? null);
    saveSelection();
  }

  blockStyleSelect.addEventListener('change', () => {
    const val = blockStyleSelect.value;
    page.focus();
    restoreSelection();
    if (val === 'title' || val === 'subtitle') {
      document.execCommand('formatBlock', false, 'P');
      const sel = window.getSelection();
      let node = sel.anchorNode;
      while (node && node.nodeName !== 'P' && node !== page) node = node.parentNode;
      if (node && node.nodeName === 'P') {
        node.classList.remove('fb-title', 'fb-subtitle');
        node.classList.add(val === 'title' ? 'fb-title' : 'fb-subtitle');
      }
    } else {
      document.execCommand('formatBlock', false, val.toUpperCase());
    }
    saveSelection();
  });

  fontFamilySelect.addEventListener('change', () => exec('fontName', fontFamilySelect.value));

  fontSizeSelect.addEventListener('change', () => {
    page.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = `${fontSizeSelect.value}pt`;
    try {
      range.surroundContents(span);
    } catch (err) {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
    }
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
    saveSelection();
  });

  boldBtn.addEventListener('click', () => { exec('bold'); updateToolbarState(); });
  italicBtn.addEventListener('click', () => { exec('italic'); updateToolbarState(); });
  underlineBtn.addEventListener('click', () => { exec('underline'); updateToolbarState(); });

  fontColorInput.addEventListener('input', () => exec('foreColor', fontColorInput.value));
  fontBgColorInput.addEventListener('input', () => exec('hiliteColor', fontBgColorInput.value));
  pageBgColorInput.addEventListener('input', () => { page.style.background = pageBgColorInput.value; });

  alignLeftBtn.addEventListener('click', () => exec('justifyLeft'));
  alignCenterBtn.addEventListener('click', () => exec('justifyCenter'));
  alignRightBtn.addEventListener('click', () => exec('justifyRight'));

  bulletListBtn.addEventListener('click', () => exec('insertUnorderedList'));
  numberListBtn.addEventListener('click', () => exec('insertOrderedList'));

  function updateToolbarState() {
    try {
      boldBtn.classList.toggle('active', document.queryCommandState('bold'));
      italicBtn.classList.toggle('active', document.queryCommandState('italic'));
      underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
    } catch (err) { /* ignore */ }
  }
  page.addEventListener('keyup', updateToolbarState);
  page.addEventListener('mouseup', updateToolbarState);

  // ---- form field insertion ----

  insertFieldBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    saveSelection();
    fieldMenu.classList.toggle('active');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.fb-dropdown-wrap')) fieldMenu.classList.remove('active');
  });

  function buildFieldEl(type, opts) {
    fieldCounter += 1;
    const el = document.createElement('span');
    el.className = 'fb-field';
    el.contentEditable = 'false';
    el.dataset.fieldType = type;
    el.dataset.fieldName = `field_${fieldCounter}`;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'fb-field-del';
    del.textContent = '✕';
    del.addEventListener('click', (ev) => { ev.stopPropagation(); el.remove(); });
    el.appendChild(del);

    if (type === 'text' || type === 'email') {
      el.appendChild(document.createTextNode(type === 'email' ? 'email field' : 'text field'));
      el.style.width = '140px';
    } else if (type === 'checkbox') {
      el.appendChild(document.createTextNode('☐'));
    } else if (type === 'dropdown') {
      el.dataset.options = JSON.stringify(opts || ['Option 1']);
      el.appendChild(document.createTextNode(`${(opts || ['Option 1'])[0]} ▾`));
      el.style.width = '160px';
    }
    return el;
  }

  function insertFieldAtSelection(el) {
    page.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      page.appendChild(el);
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(el);
    range.setStartAfter(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    saveSelection();
  }

  fieldMenu.querySelectorAll('button[data-field]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.field;
      fieldMenu.classList.remove('active');
      if (type === 'dropdown') {
        openDropdownModal();
        return;
      }
      insertFieldAtSelection(buildFieldEl(type));
    });
  });

  // ---- dropdown options modal ----

  function renderOptRows(values) {
    optRows.innerHTML = '';
    values.forEach((v) => addOptRow(v));
  }
  function addOptRow(value) {
    const row = document.createElement('div');
    row.className = 'fb-modal-opt-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value || '';
    input.placeholder = 'Option text';
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.textContent = '✕';
    rm.addEventListener('click', () => row.remove());
    row.appendChild(input);
    row.appendChild(rm);
    optRows.appendChild(row);
  }

  function openDropdownModal() {
    renderOptRows(['Option 1', 'Option 2']);
    dropdownModal.classList.add('active');
  }
  addOptRowBtn.addEventListener('click', () => addOptRow(''));
  cancelDropdownBtn.addEventListener('click', () => dropdownModal.classList.remove('active'));
  insertDropdownBtn.addEventListener('click', () => {
    const values = Array.from(optRows.querySelectorAll('input')).map((i) => i.value.trim()).filter(Boolean);
    dropdownModal.classList.remove('active');
    if (!values.length) return;
    insertFieldAtSelection(buildFieldEl('dropdown', values));
  });

  // ---- PDF export ----

  function hexToRgb01(hex) {
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.substring(0, 2), 16) / 255,
      g: parseInt(h.substring(2, 4), 16) / 255,
      b: parseInt(h.substring(4, 6), 16) / 255,
    };
  }

  const BENGALI_RANGE = /[\u0980-\u09FF]/;
  const HIND_SILIGURI_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/hindsiliguri/HindSiliguri-Regular.ttf';

  async function buildFillablePdf() {
    const { PDFDocument, rgb, StandardFonts, degrees } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

    let bnFont = null, bnFontBold = null;
    const fullText = page.innerText || '';
    if (BENGALI_RANGE.test(fullText)) {
      const bytes = await fetch(HIND_SILIGURI_URL).then((r) => r.arrayBuffer());
      bnFont = await pdfDoc.embedFont(bytes, { subset: true });
      bnFontBold = bnFont;
    }
    function pickFont(bold, italic, text) {
      if (BENGALI_RANGE.test(text)) return bold ? (bnFontBold || bnFont) : bnFont;
      if (bold && italic) return fontBoldItalic;
      if (bold) return fontBold;
      if (italic) return fontItalic;
      return font;
    }

    const pageWidthPt = 595.28;
    const pageHeightPt = 841.89;
    const marginX = 72;
    const marginTop = 76;
    const marginBottom = 72;
    const maxWidth = pageWidthPt - marginX * 2;
    const pxToPt = 72 / 96; // browser CSS px -> PDF points

    const form = pdfDoc.getForm();
    let pdfPage = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
    let y = pageHeightPt - marginTop;

    function newPage() {
      pdfPage = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
      y = pageHeightPt - marginTop;
    }
    function ensureSpace(lineHeight) {
      if (y - lineHeight < marginBottom) newPage();
    }

    // Resolve a computed CSS font-size (px) for a DOM node, honoring inline
    // spans and block defaults, and convert to PDF points.
    function fontSizePtFor(el) {
      const cs = window.getComputedStyle(el);
      const px = parseFloat(cs.fontSize) || 16;
      return px * pxToPt;
    }
    function colorFor(el) {
      const cs = window.getComputedStyle(el);
      const m = cs.color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return { r: 0.06, g: 0.05, b: 0.04 };
      return { r: +m[1] / 255, g: +m[2] / 255, b: +m[3] / 255 };
    }
    function isBold(el) {
      const cs = window.getComputedStyle(el);
      return parseInt(cs.fontWeight, 10) >= 600 || cs.fontWeight === 'bold';
    }
    function isItalic(el) {
      return window.getComputedStyle(el).fontStyle === 'italic';
    }
    function alignFor(el) {
      let node = el;
      while (node && node !== page) {
        const ta = window.getComputedStyle(node).textAlign;
        if (ta && ta !== 'start' && ta !== '') return ta;
        node = node.parentElement;
      }
      return 'left';
    }

    // Flatten a block element into a list of inline "runs": text runs and
    // field runs, each carrying resolved style info.
    function collectRuns(blockEl) {
      const runs = [];
      function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.replace(/\u00A0/g, ' ');
          if (text.length) {
            const parentEl = node.parentElement || blockEl;
            runs.push({
              kind: 'text',
              text,
              sizePt: fontSizePtFor(parentEl),
              color: colorFor(parentEl),
              bold: isBold(parentEl),
              italic: isItalic(parentEl),
              underline: window.getComputedStyle(parentEl).textDecorationLine.includes('underline'),
              highlight: window.getComputedStyle(parentEl).backgroundColor,
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList && node.classList.contains('fb-field')) {
            runs.push({
              kind: 'field',
              fieldType: node.dataset.fieldType,
              fieldName: node.dataset.fieldName,
              options: node.dataset.options ? JSON.parse(node.dataset.options) : null,
              sizePt: fontSizePtFor(blockEl),
            });
            return;
          }
          Array.from(node.childNodes).forEach(walk);
        }
      }
      Array.from(blockEl.childNodes).forEach(walk);
      return runs;
    }

    function drawRuns(runs, align) {
      // Word-wrap runs into lines, each line is an array of {text/field, style, width}
      const words = [];
      runs.forEach((run) => {
        if (run.kind === 'field') {
          const w = run.fieldType === 'checkbox' ? 16 : 130;
          words.push({ ...run, width: w });
        } else {
          run.text.split(/(\s+)/).forEach((piece) => {
            if (!piece) return;
            const f = pickFont(run.bold, run.italic, piece);
            let width;
            try { width = f.widthOfTextAtSize(piece, run.sizePt); } catch (e) { width = piece.length * run.sizePt * 0.5; }
            words.push({ kind: 'text', text: piece, sizePt: run.sizePt, color: run.color, bold: run.bold, italic: run.italic, underline: run.underline, width });
          });
        }
      });

      const lines = [];
      let current = [];
      let currentWidth = 0;
      words.forEach((w) => {
        if (w.kind === 'text' && /^\s+$/.test(w.text) && current.length === 0) return; // skip leading spaces
        if (currentWidth + w.width > maxWidth && current.length) {
          lines.push(current);
          current = [];
          currentWidth = 0;
          if (w.kind === 'text' && /^\s+$/.test(w.text)) return;
        }
        current.push(w);
        currentWidth += w.width;
      });
      if (current.length) lines.push(current);
      if (lines.length === 0) lines.push([]);

      lines.forEach((line) => {
        const lineHeight = Math.max(14, ...(line.map((w) => (w.sizePt || 12) * 1.35)), 14);
        ensureSpace(lineHeight);
        const lineWidth = line.reduce((sum, w) => sum + w.width, 0);
        let x = marginX;
        if (align === 'center') x = marginX + (maxWidth - lineWidth) / 2;
        else if (align === 'right') x = marginX + (maxWidth - lineWidth);

        line.forEach((w) => {
          if (w.kind === 'field') {
            const fw = w.width;
            const fh = w.fieldType === 'checkbox' ? 16 : Math.max(16, w.sizePt * 1.3);
            const fy = y - fh + 2;
            try {
              if (w.fieldType === 'checkbox') {
                const cb = form.createCheckBox(w.fieldName);
                cb.addToPage(pdfPage, { x, y: fy, width: fh, height: fh });
              } else if (w.fieldType === 'dropdown') {
                const dd = form.createDropdown(w.fieldName);
                dd.addOptions(w.options || ['Option 1']);
                dd.select((w.options || ['Option 1'])[0]);
                dd.addToPage(pdfPage, { x, y: fy, width: fw, height: fh });
              } else {
                const tf = form.createTextField(w.fieldName);
                tf.setText('');
                tf.addToPage(pdfPage, { x, y: fy, width: fw, height: fh });
              }
            } catch (err) { console.error('field create failed', err); }
            x += fw;
          } else {
            const f = pickFont(w.bold, w.italic, w.text);
            if (w.highlight && w.highlight !== 'rgba(0, 0, 0, 0)' && w.highlight !== 'transparent') {
              const m = w.highlight.match(/(\d+),\s*(\d+),\s*(\d+)/);
              if (m) {
                pdfPage.drawRectangle({
                  x, y: y - w.sizePt * 0.22, width: w.width, height: w.sizePt * 1.15,
                  color: rgb(+m[1] / 255, +m[2] / 255, +m[3] / 255),
                });
              }
            }
            pdfPage.drawText(w.text, { x, y, size: w.sizePt, font: f, color: rgb(w.color.r, w.color.g, w.color.b) });
            if (w.underline) {
              pdfPage.drawLine({
                start: { x, y: y - w.sizePt * 0.12 },
                end: { x: x + w.width, y: y - w.sizePt * 0.12 },
                thickness: Math.max(0.6, w.sizePt * 0.045),
                color: rgb(w.color.r, w.color.g, w.color.b),
              });
            }
            x += w.width;
          }
        });
        y -= lineHeight;
      });
    }

    function processBlock(el) {
      const tag = el.tagName;
      if (tag === 'UL' || tag === 'OL') {
        Array.from(el.children).forEach((li, i) => {
          const bullet = tag === 'OL' ? `${i + 1}. ` : '•  ';
          const runs = [{ kind: 'text', text: bullet, sizePt: fontSizePtFor(li), color: colorFor(li), bold: false, italic: false, underline: false, highlight: 'transparent' }, ...collectRuns(li)];
          drawRuns(runs, alignFor(li));
        });
        return;
      }
      const runs = collectRuns(el);
      if (!runs.length) { y -= 14; return; }
      drawRuns(runs, alignFor(el));
    }

    Array.from(page.children).forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      processBlock(child);
    });

    form.updateFieldAppearances(font);
    return pdfDoc.save();
  }

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    setStatus('building PDF…');
    try {
      const bytes = await buildFillablePdf();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const name = (docNameInput.value || 'document').trim().replace(/[^\w\-]+/g, '_');
      a.download = `${name || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('done — PDF downloaded');
    } catch (err) {
      console.error(err);
      setStatus('failed — check console');
    } finally {
      downloadBtn.disabled = false;
    }
  });
})();
