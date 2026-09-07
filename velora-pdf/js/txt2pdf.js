(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');
  const quickActions = document.getElementById('quickActions');

  const HIND_SILIGURI_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/hindsiliguri/HindSiliguri-Regular.ttf';
  const BENGALI_RANGE = /[\u0980-\u09FF]/;

  let sourceText = '';
  let sourceFileName = 'document.txt';

  function setStatus(msg) { statusText.textContent = msg; }
  function baseName(name) { return name.replace(/\.txt$/i, ''); }

  async function buildTxtPdf() {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    let font;
    if (BENGALI_RANGE.test(sourceText)) {
      const bytes = await fetch(HIND_SILIGURI_URL).then((r) => r.arrayBuffer());
      font = await pdfDoc.embedFont(bytes, { subset: true });
    } else {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 56;
    const fontSize = 12;
    const lineHeight = fontSize * 1.45;
    const maxWidth = pageWidth - margin * 2;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    function newPageIfNeeded() {
      if (y < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
    }
    function drawLine(text) {
      newPageIfNeeded();
      if (text) page.drawText(text, { x: margin, y, size: fontSize, font, color: rgb(0.09, 0.08, 0.06) });
      y -= lineHeight;
    }

    sourceText.split('\n').forEach((paragraph) => {
      const words = paragraph.split(' ');
      let line = '';
      words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && line) {
          drawLine(line);
          line = word;
        } else {
          line = candidate;
        }
      });
      drawLine(line);
    });

    return pdfDoc.save();
  }

  async function loadFile(file) {
    setStatus('reading file…');
    sourceText = await file.text();
    sourceFileName = file.name;

    docNameEl.textContent = `${file.name} · ${(new Blob([sourceText]).size / 1024).toFixed(1)} KB`;
    toolbar.classList.add('active');
    actionsBar.classList.add('active');
    window.VeloraQuickActions.render(quickActions, 'txt2pdf.html', async () => (await buildTxtPdf()), () => `${baseName(sourceFileName)}.pdf`);
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
      (f) => f.type === 'text/plain' || f.name.toLowerCase().endsWith('.txt')
    );
    if (file) loadFile(file);
  });

  changeFileBtn.addEventListener('click', () => {
    window.VeloraQuickActions.hide(quickActions);
    sourceText = '';
    toolbar.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  downloadBtn.addEventListener('click', async () => {
    if (!sourceText) return;
    downloadBtn.disabled = true;
    setStatus('building PDF…');
    try {
      const bytes = await buildTxtPdf();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('done — PDF downloaded');
    } catch (err) {
      console.error(err);
      setStatus('conversion failed — check the console');
    } finally {
      downloadBtn.disabled = false;
    }
  });

})();
