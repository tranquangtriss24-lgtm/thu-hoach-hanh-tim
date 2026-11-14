// =========================================================
// MODULE DATABASE: KẾT NỐI TRỰC TIẾP VỚI PYTHON FLASK + SQLITE
// =========================================================

window.OnlineDB = (function () {
    function updateStatusBadges(isOnline) {
        const text = isOnline
            ? "🟢 Máy chủ Python SQLite (Đang hoạt động)"
            : "🔴 Mất kết nối máy chủ Python";
        ["db-status-badge", "db-status-badge-modal"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });
    }

    async function verifyOrCreateAccount(username, password, mode = "login") {
        const response = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, mode })
        });
        return await response.json();
    }

    async function submitScore(record) {
        await fetch("/api/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record)
        });
    }

    async function subscribeLeaderboard(callback) {
        try {
            const response = await fetch("/api/leaderboard");
            if (response.ok) {
                const list = await response.json();
                updateStatusBadges(true);
                callback(list);
            } else {
                updateStatusBadges(false);
            }
        } catch (err) {
            console.error("Lỗi tải bảng xếp hạng từ Python:", err);
            updateStatusBadges(false);
        }
    }

    return {
        verifyOrCreateAccount,
        submitScore,
        subscribeLeaderboard
    };
})();