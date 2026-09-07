(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const sheetPreview = document.getElementById('sheetPreview');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');
  const quickActions = document.getElementById('quickActions');

  const HIND_SILIGURI_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/hindsiliguri/HindSiliguri-Regular.ttf';
  const BENGALI_RANGE = /[\u0980-\u09FF]/;

  let workbook = null;
  let sourceFileName = 'document.xlsx';

  function setStatus(msg) { statusText.textContent = msg; }
  function baseName(name) { return name.replace(/\.(xlsx|xls)$/i, ''); }

  function sheetsAsRows() {
    return workbook.SheetNames.map((name) => ({
      name,
      rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: '' }),
    }));
  }

  function renderPreview() {
    const sheets = sheetsAsRows();
    sheetPreview.innerHTML = '';
    sheetPreview.style.display = 'block';
    sheets.forEach((sheet) => {
      const title = document.createElement('div');
      title.style.cssText = 'font-family:var(--font-mono);font-size:11px;color:var(--mist);margin:8px 0 4px;';
      title.textContent = `${sheet.name} (${sheet.rows.length} rows)`;
      sheetPreview.appendChild(title);

      const table = document.createElement('table');
      sheet.rows.slice(0, 8).forEach((row) => {
        const tr = document.createElement('tr');
        row.slice(0, 10).forEach((cell) => {
          const td = document.createElement('td');
          td.textContent = String(cell);
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
      sheetPreview.appendChild(table);
    });
  }

  async function buildTablePdf() {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const allText = workbook.SheetNames.map((n) => JSON.stringify(workbook.Sheets[n])).join(' ');
    let font, boldFont;
    if (BENGALI_RANGE.test(allText)) {
      const bytes = await fetch(HIND_SILIGURI_URL).then((r) => r.arrayBuffer());
      font = await pdfDoc.embedFont(bytes, { subset: true });
      boldFont = font;
    } else {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    const pageWidth = 841.89; // A4 landscape, more room for columns
    const pageHeight = 595.28;
    const margin = 36;
    const fontSize = 8.5;
    const rowHeight = 20;
    const maxWidth = pageWidth - margin * 2;

    sheetsAsRows().forEach((sheet, sheetIdx) => {
      if (sheet.rows.length === 0) return;
      const colCount = Math.max(...sheet.rows.map((r) => r.length), 1);
      const colWidth = Math.min(140, maxWidth / colCount);

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      page.drawText(sheet.name, { x: margin, y, size: 13, font: boldFont, color: rgb(0.05, 0.05, 0.05) });
      y -= 24;

      function newPageIfNeeded() {
        if (y < margin + rowHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
      }

      sheet.rows.forEach((row, rowIdx) => {
        newPageIfNeeded();
        const isHeader = rowIdx === 0;
        const rowFont = isHeader ? boldFont : font;

        for (let c = 0; c < colCount; c++) {
          const x = margin + c * colWidth;
          page.drawRectangle({
            x, y: y - rowHeight, width: colWidth, height: rowHeight,
            borderColor: rgb(0.75, 0.75, 0.75), borderWidth: 0.5,
          });
          const raw = row[c] !== undefined ? String(row[c]) : '';
          let text = raw;
          while (rowFont.widthOfTextAtSize(text, fontSize) > colWidth - 8 && text.length > 1) {
            text = text.slice(0, -1);
          }
          if (text !== raw && text.length > 1) text = text.slice(0, -1) + '…';
          page.drawText(text, { x: x + 4, y: y - rowHeight + 6, size: fontSize, font: rowFont, color: rgb(0.1, 0.1, 0.1) });
        }
        y -= rowHeight;
      });
    });

    return pdfDoc.save();
  }

  async function loadFile(file) {
    setStatus('reading file…');
    const arrayBuffer = await file.arrayBuffer();
    sourceFileName = file.name;

    try {
      workbook = XLSX.read(arrayBuffer, { type: 'array' });
    } catch (err) {
      console.error(err);
      setStatus("couldn't read this file — is it a valid Excel spreadsheet?");
      return;
    }

    docNameEl.textContent = `${file.name} · ${workbook.SheetNames.length} sheet${workbook.SheetNames.length > 1 ? 's' : ''}`;
    toolbar.classList.add('active');
    actionsBar.classList.add('active');
    downloadBtn.disabled = false;
    window.VeloraQuickActions.render(quickActions, 'xlsx2pdf.html', async () => (await buildTablePdf()), () => `${baseName(sourceFileName)}.pdf`);

    renderPreview();
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
      (f) => /\.(xlsx|xls)$/i.test(f.name)
    );
    if (file) loadFile(file);
  });

  changeFileBtn.addEventListener('click', () => {
    window.VeloraQuickActions.hide(quickActions);
    workbook = null;
    sheetPreview.style.display = 'none';
    sheetPreview.innerHTML = '';
    toolbar.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  downloadBtn.addEventListener('click', async () => {
    if (!workbook) return;
    downloadBtn.disabled = true;
    setStatus('building PDF…');
    try {
      const bytes = await buildTablePdf();
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
