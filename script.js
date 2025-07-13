let points = {};

document.getElementById('browseBtn').addEventListener('click', () => {
  document.getElementById('csvFile').click();
});

document.getElementById('csvFile').addEventListener('change', function (e) {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

const dropArea = document.getElementById('drop-area');
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.style.background = '#eef';
});
dropArea.addEventListener('dragleave', () => {
  dropArea.style.background = '#f9f9f9';
});
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.style.background = '#f9f9f9';
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
    alert("❌ Unsupported file type. Please upload a CSV or Excel file.");
    return;
  }

  if (ext === 'csv') {
    parseCSV(file);
  } else {
    parseExcel(file);
  }
}

function parseCSV(file) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      processData(results.data);
    },
    error: function (err) {
      alert("Error parsing CSV: " + err.message);
    }
  });
}

function parseExcel(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headers = json[0];
    const rows = json.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    processData(rows);
  };
  reader.readAsArrayBuffer(file);
}

function processData(rows) {
  points = {};
  rows.forEach(row => {
    const name = String(row[Object.keys(row)[0]] || "").trim().toLowerCase();
    const x = parseFloat(row[Object.keys(row)[1]]);
    const y = parseFloat(row[Object.keys(row)[2]]);
    if (name && !isNaN(x) && !isNaN(y)) {
      points[name] = { x, y, label: row[Object.keys(row)[0]] };
    }
  });

  const datalist = document.getElementById('pointsList');
  datalist.innerHTML = '';
  Object.values(points).forEach(p => {
    const option = document.createElement('option');
    option.value = p.label;
    datalist.appendChild(option);
  });

  document.getElementById('inputs').style.display = 'block';
}

function calculateDistance() {
  const name1Raw = document.getElementById('point1').value.trim();
  const name2Raw = document.getElementById('point2').value.trim();
  const name1 = name1Raw.toLowerCase();
  const name2 = name2Raw.toLowerCase();

  if (!(name1 in points) || !(name2 in points)) {
    const available = Object.values(points).map(p => p.label).join(', ');
    document.getElementById('result').innerHTML =
      "❌ One or both point names not found.<br>Available names: " + available;
    return;
  }

  const p1 = points[name1];
  const p2 = points[name2];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  document.getElementById('result').innerHTML = `
    ✅ Distance between ${p1.label} and ${p2.label} is ${distance.toFixed(3)} units.<br>
    ✅ Distance between <b>${p1.label}</b> and <b>${p2.label}</b> = ${distance.toFixed(3)}<br>
    📌 Point (${p1.label}) coordinates: ${p1.x}, ${p1.y}<br>
    📌 Point (${p2.label}) coordinates: ${p2.x}, ${p2.y}
  `;
}