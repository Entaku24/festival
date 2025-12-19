const OWNER = "YOUR_GITHUB_NAME";
const REPO = "Derby";
const PATH = "data.json";
const TOKEN = "YOUR_GITHUB_TOKEN"; // ⚠️ 遊び用のみ

let globalData = [];

// ============================
// 初期表示
// ============================
fetch(PATH)
  .then(res => res.json())
  .then(data => {
    globalData = data;
    renderRace();
  });

// ============================
// レース描画
// ============================
function renderRace() {
  const raceDiv = document.getElementById("race");
  raceDiv.innerHTML = "";

  const racers = globalData.map(person => {
    const h = person.history;
    const today = h[h.length - 1];
    const yesterday = h[h.length - 2] || today;

    const diffPages = today.pages - yesterday.pages;
    const diffChars = today.chars - yesterday.chars;
    const streak = calcStreak(h);

    return {
      name: person.name,
      pages: today.pages,
      diffPages,
      diffChars,
      title: giveTitle({
        diffPages,
        diffChars,
        totalPages: today.pages,
        streak
      })
    };
  });

  racers.sort((a, b) => b.pages - a.pages);

  racers.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="rank">🏁 ${i + 1}位</div>
      <div class="name">${r.name}</div>
      <div class="stats">
        ${r.pages} ページ（+${r.diffPages}）<br>
        ${r.diffChars} 字増加
      </div>
      <div class="title">${r.title}</div>
    `;

    raceDiv.appendChild(card);
  });
}

// ============================
// 称号AI（大量）
// ============================
function giveTitle(s) {
  const { diffPages, diffChars, totalPages, streak } = s;

  // ゴール系
  if (totalPages >= 60) return "🗿 書き上げし者";
  if (totalPages >= 50) return "🏁 ゴール目前";

  // 爆発系
  if (diffPages >= 10) return "💥 覚醒モード";
  if (diffPages >= 7) return "🔥 爆筆王";
  if (diffPages >= 4) return "⚡ 追い込み馬";
  if (diffChars >= 5000) return "🚀 ロケット執筆";

  // 継続系
  if (streak >= 5) return "🛠 日課職人";
  if (streak >= 3 && diffPages >= 1) return "📅 連続更新王";
  if (diffPages >= 1 && diffPages <= 2) return "🐢 堅実派ランナー";

  // 思考系
  if (diffPages === 0 && diffChars > 0) return "☕ 思考中";
  if (diffPages === 0) return "😇 構想中";

  return "🏃 走行中";
}

// ============================
// 連続更新日数
// ============================
function calcStreak(history) {
  let streak = 0;
  for (let i = history.length - 1; i > 0; i--) {
    if (history[i].pages > history[i - 1].pages) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ============================
// 保存 → GitHub commit
// ============================
async function save() {
  const name = document.getElementById("name").value;
  const pages = Number(document.getElementById("pages").value);
  const chars = Number(document.getElementById("chars").value);
  const today = new Date().toISOString().slice(0, 10);

  if (!name || isNaN(pages) || isNaN(chars)) {
    alert("入力が不完全です");
    return;
  }

  // data.json を GitHub から取得
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`
  );
  const json = await res.json();
  const content = JSON.parse(atob(json.content));

  // 該当ユーザー更新
  const person = content.find(p => p.name === name);
  if (!person) {
    alert("名前が見つかりません");
    return;
  }

  person.history.push({ date: today, pages, chars });

  // commit
  await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `token ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Update ${name} on ${today}`,
        content: btoa(JSON.stringify(content, null, 2)),
        sha: json.sha
      })
    }
  );

  alert("保存＆コミット完了！");
  location.reload();
}
