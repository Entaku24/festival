fetch("history.json")
  .then(res => res.json())
  .then(data => {

    // 日付と名前を抽出
    const dates = [...new Set(data.map(d => d.date))].sort();
    const names = [...new Set(data.map(d => d.name))];

    // 色（自動割当・順序固定）
    const colors = [
      "#4e79a7", "#e15759", "#f28e2b", "#edc948",
      "#76b7b2", "#59a14f", "#af7aa1", "#ff9da7"
    ];

    const datasets = names.map((name, i) => ({
      label: name,
      data: dates.map(date => {
        const record = data.find(d => d.name === name && d.date === date);
        return record ? record.chars : null;
      }),
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length],
      borderWidth: 3,
      tension: 0.3,
      spanGaps: true
    }));

    const canvas = document.getElementById("chart");
    if (!canvas) {
      console.error("canvas #chart が見つかりません");
      return;
    }

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 14,
              font: {
                size: 12
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "日付"
            }
          },
          y: {
            title: {
              display: true,
              text: "累積文字数"
            },
            ticks: {
              callback: value => value.toLocaleString()
            }
          }
        }
      }
    });
  })
  .catch(err => {
    console.error("データ読み込みエラー", err);
  });
