fetch("history.json")
  .then(res => res.json())
  .then(data => {

    const dates = [...new Set(data.map(d => d.date))].sort();
    const names = [...new Set(data.map(d => d.name))];

    const datasets = names.map((name, i) => {
      return {
        label: name,
        data: dates.map(date => {
          const record = data.find(d => d.name === name && d.date === date);
          return record ? record.chars : null;
        }),
        borderWidth: 3,
        tension: 0.3
      };
    });

    const ctx = document.getElementById("chart").getContext("2d");

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
              padding: 16,
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: "文字数の推移（累積）"
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
            }
          }
        }
      }
    });
  });
