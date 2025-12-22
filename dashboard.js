fetch("data.json")
  .then(res => res.json())
  .then(data => drawDailyLine(data));

function drawDailyLine(records) {

  // ① 日付一覧（昇順）
  const dates = Array.from(
    new Set(records.map(r => r.date))
  ).sort();

  // ② 人名一覧
  const names = Array.from(
    new Set(records.map(r => r.name))
  );

  // ③ 人ごとに日付→文字数を対応づけ
  const datasets = names.map(name => {

    let lastChars = 0;

    const dataByDate = dates.map(date => {
      const rec = records.find(
        r => r.name === name && r.date === date
      );
      if (rec) {
        lastChars = rec.chars;
      }
      return lastChars;
    });

    return {
      label: name,
      data: dataByDate,
      tension: 0.3,
      fill: false
    };
  });

  // ④ Chart.js
  new Chart(document.getElementById("lineDaily"), {
    type: "line",
    data: {
      labels: dates,
      datasets: datasets
    },
    options: {
      responsive: true,
      interaction: {
        mode: "nearest",
        intersect: false
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "累積文字数"
          }
        },
        x: {
          title: {
            display: true,
            text: "日付"
          }
        }
      }
    }
  });
}
