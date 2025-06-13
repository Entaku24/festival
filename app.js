const ENTRIES_PER_PAGE = 10;
let entries = [];
let filterType = "all";
let sortKey = "date";
let sortAsc = false;
let editingId = null;
let deletedStack = [];
let currentPage = 1;

window.onload = function () {
  document.getElementById("date").value = new Date().toISOString().slice(0, 10);
  loadEntries();
  renderEntries();
  updateSummary();
  setupSortHeaders();
  setupFilter();
  updatePagination();
};

function saveEntries() {
  localStorage.setItem("eventEntriesV2", JSON.stringify(entries));
}
function loadEntries() {
  const stored = localStorage.getItem("eventEntriesV2");
  if (stored) entries = JSON.parse(stored);
}

function setupFilter() {
  document.getElementById("filter-type").onchange = function () {
    filterType = this.value;
    currentPage = 1;
    renderEntries();
    updateSummary();
    updatePagination();
  };
}
function setupSortHeaders() {
  document.querySelectorAll("#entry-table th[data-sort]").forEach(th => {
    th.onclick = function () {
      const key = this.getAttribute("data-sort");
      if (sortKey === key) {
        sortAsc = !sortAsc;
      } else {
        sortKey = key;
        sortAsc = true;
      }
      renderEntries();
      updatePagination();
    };
  });
}

document.getElementById("entry-form").onsubmit = function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const date = document.getElementById("date").value;
  const item = document.getElementById("item").value.trim();
  const amountStr = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const memo = document.getElementById("memo").value.trim();

  if (!username) return alert("入力者名を入力してください。");
  if (!date) return alert("日付を選択してください。");
  if (!item) return alert("項目名を入力してください。");
  if (!amountStr || parseInt(amountStr, 10) < 0) return alert("金額は0以上を入力してください。");
  if (!type) return alert("種別を選択してください。");
  const amount = parseInt(amountStr, 10);

  if (editingId) {
    const idx = entries.findIndex(e => e.id === editingId);
    if (idx !== -1) {
      entries[idx] = { id: editingId, username, date, item, amount, type, memo };
    }
    editingId = null;
    document.getElementById("submit-btn").innerHTML = `<i class="fa-solid fa-plus"></i> 登録`;
    document.getElementById("reset-btn").style.display = "none";
  } else {
    entries.push({ id: Date.now(), username, date, item, amount, type, memo });
  }
  saveEntries();
  renderEntries();
  updateSummary();
  updatePagination();
  this.reset();
  document.getElementById("date").value = new Date().toISOString().slice(0, 10);
};

document.getElementById("reset-btn").onclick = function () {
  editingId = null;
  document.getElementById("entry-form").reset();
  document.getElementById("date").value = new Date().toISOString().slice(0, 10);
  document.getElementById("submit-btn").innerHTML = `<i class="fa-solid fa-plus"></i> 登録`;
  this.style.display = "none";
};

document.getElementById("delete-all").onclick = function () {
  if (confirm("全ての収支データを削除してよろしいですか？")) {
    if (entries.length > 0) deletedStack.push([...entries]);
    entries = [];
    saveEntries();
    renderEntries();
    updateSummary();
    updatePagination();
    document.getElementById("undo-btn").disabled = false;
  }
};

document.getElementById("undo-btn").onclick = function () {
  if (deletedStack.length > 0) {
    entries = deletedStack.pop();
    saveEntries();
    renderEntries();
    updateSummary();
    updatePagination();
  }
  if (deletedStack.length === 0) {
    this.disabled = true;
  }
};

document.getElementById("download-csv").onclick = function () {
  if (entries.length === 0) return alert("データがありません。");
  const header = ["日付", "入力者", "項目名", "金額", "種別", "メモ"];
  const rows = entries.map(e => [
    e.date, e.username, e.item, e.amount, e.type === "income" ? "収入" : "支出", e.memo
  ]);
  const csvContent =
    [header, ...rows]
      .map(row => row.map(cell => `"${(cell+"").replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

  // BOM追加で文字化け防止
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `収支管理_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

document.getElementById("upload-csv-btn").onclick = function () {
  document.getElementById("upload-csv").click();
};
document.getElementById("upload-csv").onchange = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    const text = ev.target.result;
    const lines = text.split(/\r?\n/);
    const newEntries = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",");
      if (row.length < 6) continue;
      newEntries.push({
        id: Date.now() + i,
        date: row[0].replace(/"/g, ""),
        username: row[1].replace(/"/g, ""),
        item: row[2].replace(/"/g, ""),
        amount: parseInt(row[3]),
        type: row[4].replace(/"/g, "") === "収入" ? "income" : "expense",
        memo: row[5] ? row[5].replace(/"/g, "") : ""
      });
    }
    entries = entries.concat(newEntries);
    saveEntries();
    renderEntries();
    updateSummary();
    updatePagination();
    document.getElementById("upload-csv").value = "";
    alert("CSVの取込が完了しました。");
  };
  reader.readAsText(file);
};

function renderEntries() {
  const tbody = document.querySelector("#entry-table tbody");
  tbody.innerHTML = "";
  let filtered = entries.filter(e => {
    if (filterType === "all") return true;
    return e.type === filterType;
  });

  filtered.sort((a, b) => {
    let v1 = a[sortKey], v2 = b[sortKey];
    if (sortKey === "amount") {
      v1 = Number(v1); v2 = Number(v2);
    }
    if (v1 < v2) return sortAsc ? -1 : 1;
    if (v1 > v2) return sortAsc ? 1 : -1;
    return 0;
  });

  const totalPage = Math.ceil(filtered.length / ENTRIES_PER_PAGE) || 1;
  if (currentPage > totalPage) currentPage = totalPage;
  const startIdx = (currentPage - 1) * ENTRIES_PER_PAGE;
  const pageData = filtered.slice(startIdx, startIdx + ENTRIES_PER_PAGE);

  if (pageData.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.textContent = "データがありません。";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const entry of pageData) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${escapeHtml(entry.username)}</td>
      <td>${escapeHtml(entry.item)}</td>
      <td>${Number(entry.amount).toLocaleString()}</td>
      <td>${entry.type === "income" ? "収入" : "支出"}</td>
      <td>${escapeHtml(entry.memo)}</td>
      <td>
        <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i> 編集</button>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i> 削除</button>
      </td>
    `;
    tr.querySelector(".edit-btn").onclick = () => {
      editingId = entry.id;
      document.getElementById("username").value = entry.username;
      document.getElementById("date").value = entry.date;
      document.getElementById("item").value = entry.item;
      document.getElementById("amount").value = entry.amount;
      document.getElementById("type").value = entry.type;
      document.getElementById("memo").value = entry.memo;
      document.getElementById("submit-btn").innerHTML = `<i class="fa-solid fa-check"></i> 更新`;
      document.getElementById("reset-btn").style.display = "";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    tr.querySelector(".delete-btn").onclick = () => {
      if (confirm("このデータを削除してよろしいですか？")) {
        deletedStack.push([entry]);
        entries = entries.filter(e => e.id !== entry.id);
        saveEntries();
        renderEntries();
        updateSummary();
        updatePagination();
        document.getElementById("undo-btn").disabled = false;
      }
    };
    tbody.appendChild(tr);
  }
}

function updatePagination() {
  const filtered = entries.filter(e => {
    if (filterType === "all") return true;
    return e.type === filterType;
  });
  const totalPage = Math.ceil(filtered.length / ENTRIES_PER_PAGE) || 1;
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (totalPage <= 1) return;
  for (let i = 1; i <= totalPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = function () {
      currentPage = i;
      renderEntries();
      updatePagination();
    };
    pagination.appendChild(btn);
  }
}

function updateSummary() {
  let filtered = entries.filter(e => {
    if (filterType === "all") return true;
    return e.type === filterType;
  });
  const totalIncome = filtered.filter(e => e.type === "income").reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpense = filtered.filter(e => e.type === "expense").reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalIncome - totalExpense;
  document.getElementById("total-income").textContent = `収入合計: ${totalIncome.toLocaleString()}円`;
  document.getElementById("total-expense").textContent = `支出合計: ${totalExpense.toLocaleString()}円`;
  document.getElementById("balance").textContent = `差引残高: ${balance.toLocaleString()}円`;
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
