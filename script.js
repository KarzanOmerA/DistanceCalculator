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
  if (ext === 'csv') {
    parseCSV(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    parseExcel(file);
  } else {
    alert("Unsupported file type. Please use CSV or Excel.");
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
      points[name] = { x, y };
    }
  });

  const datalist = document.getElementById('pointsList');
  datalist.innerHTML = '';
  Object.keys(points).forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    datalist.appendChild(option);
  });

  document.getElementById('inputs').style.display = 'block';
}

function calculateDistance() {
  const name1 = document.getElementById('point1').value.trim().toLowerCase();
  const name2 = document.getElementById('point2').value.trim().toLowerCase();

  if (!(name1 in points) || !(name2 in points)) {
    const available = Object.keys(points).join(', ');
    document.getElementById('result').textContent = 
      "One or both point names not found. Available names: " + available;
    return;
  }

  const dx = points[name2].x - points[name1].x;
  const dy = points[name2].y - points[name1].y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  document.getElementById('result').textContent = 
    `Distance between ${name1} and ${name2} is ${distance.toFixed(3)} units.`;
}