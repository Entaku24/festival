fetch("data.json")
  .then(res => res.json())
  .then(data => {
    drawTodayBar(data);
    drawCumulativeLine(data);
  });

/* ==========
① 今日のページ数（積み上げ棒）
========== */
function drawTodayBar(data) {
  const labels = [];
  const values = [];

  data.forEach(person => {
    const latest = person.history[person.history.length - 1];
    labels.push(person.name);
    values.push(latest.pages);
  });

  new Chart(document.getElementById("barToday"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "ページ数",
        data: values,
        backgroundColor: "rgba(75, 135, 185, 0.7)"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "ページ数" }
        }
      }
    }
  });
}

/* ==========
② 累積ページ数（折れ線）
========== */
function drawCumulativeLine(data) {
  // 日付一覧を集める
  const dates = Array.from(new Set(
    data.flatMap(p => p.history.map(h => h.date))
  )).sort();

  const datasets = data.map(person => {
    let last = 0;
    const pagesByDate = dates.map(d => {
      const hit = person.history.find(h => h.date === d);
      if (hit) last = hit.pages;
      return last;
    });

    return {
      label: person.name,
      data: pagesByDate,
      fill: false,
      tension: 0.3
    };
  });

  new Chart(document.getElementById("lineCumulative"), {
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
          title: { display: true, text: "累積ページ数" }
        }
      }
    }
  });
}
