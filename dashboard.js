fetch("data.json")
  .then(res => res.json())
  .then(data => {
    drawTodayCharBar(data);
    drawCumulativeCharLine(data);
  });

/* =========================
① 本日の文字数（棒グラフ）
========================= */
function drawTodayCharBar(data) {
  const labels = [];
  const values = [];

  data.forEach(person => {
    const latest = person.history[person.history.length - 1];
    labels.push(person.name);
    values.push(latest.chars);
  });

  new Chart(document.getElementById("barTodayChars"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "文字数",
        data: values,
        backgroundColor: "rgba(255, 159, 64, 0.7)"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "文字数"
          }
        }
      }
    }
  });
}

/* =========================
② 累積文字数（折れ線）
========================= */
function drawCumulativeCharLine(data) {

  // 全員の履歴から日付一覧を作る
  const dates = Array.from(
    new Set(
      data.flatMap(p => p.history.map(h => h.date))
    )
  ).sort();

  const datasets = data.map(person => {
    let lastChars = 0;

    const charsByDate = dates.map(date => {
      const record = person.history.find(h => h.date === date);
      if (record) {
        lastChars = record.chars;
      }
      return lastChars;
    });

    return {
      label: person.name,
      data: charsByDate,
      fill: false,
      tension: 0.3
    };
  });

  new Chart(document.getElementById("lineCumulativeChars"), {
    type: "line",
    data: {
      labels: dates,
      datasets: datasets
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "累積文字数"
          }
        }
      }
    }
  });
}
