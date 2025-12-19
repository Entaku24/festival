fetch("data.json")
  .then(res => res.json())
  .then(data => render(data));

function render(data) {
  const track = document.getElementById("track");
  track.innerHTML = "";

  // 最新データ取得
  const racers = data.map(p => {
    const h = p.history;
    const today = h[h.length - 1];
    const yesterday = h[h.length - 2] || today;

    return {
      name: p.name,
      pages: today.pages,
      chars: today.chars,
      diffPages: today.pages - yesterday.pages,
      diffChars: today.chars - yesterday.chars,
      title: giveTitle(today.pages, today.chars),
      horse: horseName(p.name)
    };
  });

  // 順位は文字数順
  racers.sort((a, b) => b.chars - a.chars);

  const maxChars = Math.max(...racers.map(r => r.chars));

  racers.forEach((r, i) => {
    const lane = document.createElement("div");
    lane.className = "lane";

    const progress = Math.min(90, (r.chars / maxChars) * 90);

    lane.innerHTML = `
      <div class="info">
        <div class="rank">🏁 ${i + 1}位　${r.name}（${r.horse}）</div>
        <div>${r.pages}ページ / ${r.chars}字 / ${r.title}</div>
      </div>
      <div class="track">
        <div class="horse" style="left:${progress}%">🐎</div>
      </div>
    `;

    track.appendChild(lane);
  });
}

function giveTitle(pages, chars) {
  if (pages >= 60) return "🗿 書き上げし者";
  if (pages >= 50) return "🏁 ゴール目前";
  if (chars >= 25000) return "🔥 爆筆王";
  if (chars >= 15000) return "🐢 堅実派ランナー";
  return "😇 構想中";
}

function horseName(name) {
  const map = {
    "悠真": "疾風号",
    "すみれ": "紅桜",
    "えんたく": "探究丸"
  };
  return map[name] || "名無し号";
}
