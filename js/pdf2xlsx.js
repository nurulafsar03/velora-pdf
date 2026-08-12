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

  let pdfDocProxy = null;
  let sourceFileName = 'document.pdf';
  let extractedRows = null; // array of row arrays, built on demand

  function setStatus(msg) { statusText.textContent = msg; }
  function baseName(name) { return name.replace(/\.pdf$/i, ''); }

  // Groups a page's text items into rows (by Y position) and, within each
  // row, into columns (by X gaps). This is a heuristic, not true table
  // detection — it works reasonably for simple, grid-like PDFs.
  async function extractPageRows(page) {
    const content = await page.getTextContent();
    const items = content.items
      .filter((it) => it.str.trim().length > 0)
      .map((it) => ({ str: it.str, x: it.transform[4], y: it.transform[5] }));

    if (items.length === 0) return [];

    items.sort((a, b) => b.y - a.y || a.x - b.x);

    const rows = [];
    const Y_TOLERANCE = 4;
    let currentRow = [];
    let currentY = null;

    items.forEach((item) => {
      if (currentY === null || Math.abs(item.y - currentY) <= Y_TOLERANCE) {
        currentRow.push(item);
        currentY = currentY === null ? item.y : currentY;
      } else {
        rows.push(currentRow);
        currentRow = [item];
        currentY = item.y;
      }
    });
    if (currentRow.length) rows.push(currentRow);

    // Within each row, insert a new column whenever there's a big horizontal
    // gap between consecutive items; otherwise merge into the same cell.
    const GAP_THRESHOLD = 14;
    return rows.map((row) => {
      row.sort((a, b) => a.x - b.x);
      const cells = [];
      let cellText = row[0].str;
      let lastEndX = row[0].x + row[0].str.length * 5;
      for (let i = 1; i < row.length; i++) {
        const item = row[i];
        if (item.x - lastEndX > GAP_THRESHOLD) {
          cells.push(cellText.trim());
          cellText = item.str;
        } else {
          cellText += item.str;
        }
        lastEndX = item.x + item.str.length * 5;
      }
      cells.push(cellText.trim());
      return cells;
    });
  }

  async function extractAllRows() {
    const rows = [];
    for (let i = 1; i <= pdfDocProxy.numPages; i++) {
      setStatus(`reading page ${i} of ${pdfDocProxy.numPages}…`);
      const page = await pdfDocProxy.getPage(i);
      const pageRows = await extractPageRows(page);
      rows.push(...pageRows);
    }
    return rows;
  }

  function renderPreview(rows) {
    sheetPreview.innerHTML = '';
    sheetPreview.style.display = 'block';
    const table = document.createElement('table');
    rows.slice(0, 15).forEach((row) => {
      const tr = document.createElement('tr');
      row.slice(0, 10).forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    sheetPreview.appendChild(table);
    if (rows.length > 15) {
      const more = document.createElement('div');
      more.style.cssText = 'font-family:var(--font-mono);font-size:11px;color:var(--mist);margin-top:6px;';
      more.textContent = `+ ${rows.length - 15} more rows`;
      sheetPreview.appendChild(more);
    }
  }

  async function buildXlsxBlob() {
    if (!extractedRows) extractedRows = await extractAllRows();
    const ws = XLSX.utils.aoa_to_sheet(extractedRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  async function loadFile(file) {
    setStatus('reading file…');
    sheetPreview.style.display = 'none';
    sheetPreview.innerHTML = '';
    extractedRows = null;

    const arrayBuffer = await file.arrayBuffer();
    sourceFileName = file.name;

    try {
      pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    } catch (err) {
      console.error(err);
      setStatus("couldn't open this file — is it a valid PDF?");
      return;
    }

    docNameEl.textContent = `${file.name} · ${pdfDocProxy.numPages} pages`;
    toolbar.classList.add('active');
    actionsBar.classList.add('active');
    downloadBtn.disabled = false;
    window.VeloraQuickActions.render(quickActions, 'pdf2xlsx.html', () => arrayBuffer, () => sourceFileName);

    setStatus('extracting text…');
    extractedRows = await extractAllRows();
    renderPreview(extractedRows);
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
    extractedRows = null;
    sheetPreview.style.display = 'none';
    sheetPreview.innerHTML = '';
    toolbar.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  downloadBtn.addEventListener('click', async () => {
    if (!pdfDocProxy) return;
    downloadBtn.disabled = true;
    setStatus('building spreadsheet…');
    try {
      const blob = await buildXlsxBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('done — spreadsheet downloaded');
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
