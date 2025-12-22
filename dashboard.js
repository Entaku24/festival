fetch("data.json")
  .then(res => res.json())
  .then(records => drawLine(records));

function drawLine(records) {

  // 日付一覧（昇順）
  const dates = Array.from(
    new Set(records.map(r => r.date))
  ).sort();

  // 名前一覧
  const names = Array.from(
    new Set(records.map(r => r.name))
  );

  // 各人の折れ線データを作成
  const datasets = names.map(name => {

    let lastValue = 0;

    const values = dates.map(date => {
      const hit = records.find(
        r => r.name === name && r.date === date
      );
      if (hit) {
        lastValue = hit.chars;
      }
      return lastValue;
    });

    return {
      label: name,
      data: values,
      fill: false,
      tension: 0.3
    };
  });

  new Chart(document.getElementById("progressLine"), {
    type: "line",
    data: {
      labels: dates,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top"
        },
        tooltip: {
          mode: "index",
          intersect: false
        }
      },
      interaction: {
        mode: "nearest",
        intersect: false
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "日付"
          }
        },
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
