// =========================================================
// MODULE LEADERBOARD: BẢNG XẾP HẠNG & KHO BÁU TRỰC TUYẾN
// =========================================================

window.LeaderboardManager = (function () {
    let activeUsername = "";
    let cachedScores = [];

    const leaderboardBody = document.getElementById("leaderboard-body");
    const treasureBody = document.getElementById("treasure-leaderboard-body");

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // Hàm render chung cho cả 2 bảng
    function renderTable(tbodyElement, scores, isTreasure = false) {
        if (!tbodyElement) return;
        tbodyElement.innerHTML = "";

        if (!scores || scores.length === 0) {
            tbodyElement.innerHTML = `<tr><td colspan="5" class="text-center text-slate-500">Chưa có dữ liệu ghi danh!</td></tr>`;
            return;
        }

        scores.forEach((item, index) => {
            const isCurrentUser = activeUsername && item.name.toLowerCase() === activeUsername.toLowerCase();
            const tr = document.createElement("tr");
            tr.className = isCurrentUser ? "current-user-row" : "";

            let medal = `#${index + 1}`;
            if (index === 0) medal = "🥇 #1";
            else if (index === 1) medal = "🥈 #2";
            else if (index === 2) medal = "🥉 #3";

            if (!isTreasure) {
                // Render Bảng Xếp Hạng Thành Tích (Bên trái)
                const harvestedCount = item.harvested !== undefined ? item.harvested : (item.score || 0);
                tr.innerHTML = `
                    <td class="text-center"><strong>${medal}</strong></td>
                    <td>${escapeHTML(item.name)}</td>
                    <td class="font-extrabold text-purple-700">🧅 ${harvestedCount} củ</td>
                    <td class="font-bold text-emerald-700">${item.wpm || 0} WPM</td>
                    <td>${item.accuracy ?? 100}%</td>
                `;
            } else {
                // Render Bảng Vàng Kho Báu (Bên phải)
                tr.innerHTML = `
                    <td class="text-center"><strong>${medal}</strong></td>
                    <td>${escapeHTML(item.name)}</td>
                    <td class="text-center font-bold text-cyan-600">💎 ${item.diamond || 0}</td>
                    <td class="text-center font-bold text-amber-600">🥇 ${item.gold || 0}</td>
                    <td class="text-center font-bold text-slate-500">🥈 ${item.silver || 0}</td>
                `;
            }
            tbodyElement.appendChild(tr);
        });
    }

    function render(list) {
        cachedScores = list || [];
        
        // 1. Render Bảng Xếp Hạng Thường (Bên trái)
        renderTable(leaderboardBody, cachedScores, false);

        // 2. Sắp xếp ưu tiên theo số lượng Kim Cương -> Vàng -> Bạc cho Bảng Vàng Kho Báu (Bên phải)
        const treasureSorted = [...cachedScores].sort((a, b) => {
            return (b.diamond - a.diamond) || (b.gold - a.gold) || (b.silver - a.silver) || (b.harvested - a.harvested);
        });
        renderTable(treasureBody, treasureSorted, true);
    }

    function init(username) {
        activeUsername = username || "";
        if (window.OnlineDB && typeof window.OnlineDB.subscribeLeaderboard === "function") {
            window.OnlineDB.subscribeLeaderboard(render);
        }
    }

    async function saveAndRefresh(harvested, wpm, accuracy, diamond = 0, gold = 0, silver = 0) {
        const user = window.AuthManager ? window.AuthManager.getCurrentUser() : activeUsername;
        if (!user) return;

        const record = {
            name: user,
            harvested: Number(harvested) || 0,
            wpm: Number(wpm) || 0,
            accuracy: Number(accuracy) || 100,
            diamond: Number(diamond) || 0,
            gold: Number(gold) || 0,
            silver: Number(silver) || 0,
            updatedAt: Date.now()
        };

        if (window.OnlineDB && typeof window.OnlineDB.submitScore === "function") {
            await window.OnlineDB.submitScore(record);
            window.OnlineDB.subscribeLeaderboard(render);
        }
    }

    return {
        init,
        saveAndRefresh
    };
})();