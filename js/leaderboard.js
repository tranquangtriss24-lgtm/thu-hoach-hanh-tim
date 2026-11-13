eaderboard_js = """// =========================================================
// MODULE LEADERBOARD: BẢNG XẾP HẠNG TRỰC TUYẾN
// =========================================================

window.LeaderboardManager = (function () {
const leaderboardBody = document.getElementById("leaderboard-body");
let activeUsername = "";

function render(list) {
    if (!leaderboardBody) return;

    if (!list || list.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="5" class="text-center">Chưa có nông dân nào ghi danh. Hãy là người đầu tiên!</td></tr>`;
        return;
    }

    leaderboardBody.innerHTML = "";
    list.forEach((item, index) => {
        const tr = document.createElement("tr");
        if (activeUsername && item.name.toLowerCase() === activeUsername.toLowerCase()) {
            tr.classList.add("current-user-row");
        }

        let medal = `#${index + 1}`;
        if (index === 0) medal = "🥇 #1";
        else if (index === 1) medal = "🥈 #2";
        else if (index === 2) medal = "🥉 #3";

        tr.innerHTML = `
            <td><strong>${medal}</strong></td>
            <td>${escapeHTML(item.name)}</td>
            <td>🧅 <strong>${item.score}</strong> củ</td>
            <td>${item.wpm} WPM</td>
            <td>${item.accuracy ?? 100}%</td>
        `;
        leaderboardBody.appendChild(tr);
    });
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function init(username) {
    activeUsername = username || "";
    window.OnlineDB.subscribeLeaderboard(render);
}

async function saveAndRefresh(score, wpm, accuracy) {
    const user = window.AuthManager ? window.AuthManager.getCurrentUser() : activeUsername;
    if (!user) return;

    const record = {
        name: user,
        score: Number(score) || 0,
        wpm: Number(wpm) || 0,
        accuracy: Number(accuracy) || 100,
        updatedAt: Date.now()
    };

    await window.OnlineDB.submitScore(record);
    // Refresh lại nếu đang ở chế độ LocalStorage demo
    window.OnlineDB.subscribeLeaderboard(render);
}

return {
    init,
    saveAndRefresh
};
})();
"""

with open(os.path.join(base_dir, "js", "leaderboard.js"), "w", encoding="utf-8") as f:
f.write(leaderboard_js)
