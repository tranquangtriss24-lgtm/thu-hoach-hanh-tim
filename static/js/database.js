// =========================================================
// MODULE DATABASE: KẾT NỐI TRỰC TIẾP VỚI FIREBASE REALTIME DB
// =========================================================

window.OnlineDB = (function () {
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        databaseURL: "https://thu-hoach-hanh-tim-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.database();

    function updateStatusBadges(isOnline) {
        const text = isOnline
            ? "🟢 Firebase Realtime Database (Đang hoạt động)"
            : "🔴 Mất kết nối Firebase";
        ["db-status-badge", "db-status-badge-modal"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });
    }

    // Mã hóa nhẹ phía client (bản demo; nếu làm hệ thống lớn nên dùng Firebase Auth)
    async function hashPassword(password) {
        const salt = "ninhthuan_hanh_tim_2026";
        const data = new TextEncoder().encode(password + salt);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    function sanitizeKey(name) {
        return String(name).trim().toLowerCase().replace(/[.#$/[\]]/g, "_");
    }

    // 1. Đăng ký hoặc Đăng nhập tài khoản
    async function verifyOrCreateAccount(username, password, mode = "login") {
        const cleanUser = String(username || "").trim();
        const cleanPass = String(password || "").trim();

        if (cleanUser.length < 2) {
            return { ok: false, message: "Tên tài khoản phải từ 2 ký tự trở lên!" };
        }
        if (cleanPass.length < 6) {
            return { ok: false, message: "Mật khẩu phải có ít nhất 6 ký tự!" };
        }

        const userKey = sanitizeKey(cleanUser);
        const userRef = db.ref("users/" + userKey);
        const snapshot = await userRef.get();
        const passHash = await hashPassword(cleanPass);

        if (mode === "register") {
            if (snapshot.exists()) {
                return { ok: false, message: "Tên tài khoản này đã có người đăng ký!" };
            }
            await userRef.set({
                username: cleanUser,
                passHash: passHash,
                createdAt: Date.now()
            });
            return { ok: true, username: cleanUser, isNew: true };
        } else {
            if (!snapshot.exists()) {
                return { ok: false, message: "Tài khoản không tồn tại. Vui lòng bấm Đăng Ký Mới!" };
            }
            const userData = snapshot.val();
            if (userData.passHash !== passHash) {
                return { ok: false, message: "Sai mật khẩu cho tài khoản này!" };
            }
            return { ok: true, username: userData.username || cleanUser, isNew: false };
        }
    }

    // 2. Lưu thành tích & cộng dồn kho báu (KC, Vàng, Bạc)
    async function submitScore(record) {
        const cleanName = String(record.name || "").trim();
        if (!cleanName) return;

        const userKey = sanitizeKey(cleanName);
        const lbRef = db.ref("leaderboard/" + userKey);

        const harvested = Number(record.harvested) || 0;
        const wpm = Number(record.wpm) || 0;
        const accuracy = Number(record.accuracy) ?? 100;
        const diamond = Number(record.diamond) || 0;
        const gold = Number(record.gold) || 0;
        const silver = Number(record.silver) || 0;

        await lbRef.transaction(current => {
            if (!current) {
                return {
                    name: cleanName,
                    harvested,
                    wpm,
                    accuracy,
                    diamond,
                    gold,
                    silver,
                    updatedAt: Date.now()
                };
            }

            const bestHarvested = harvested > (current.harvested || 0) ? harvested : (current.harvested || 0);
            const bestWpm = (harvested >= (current.harvested || 0) && wpm > (current.wpm || 0))
                ? wpm
                : (current.wpm || 0);
            const bestAccuracy = harvested >= (current.harvested || 0)
                ? accuracy
                : (current.accuracy ?? 100);

            return {
                name: current.name || cleanName,
                harvested: bestHarvested,
                wpm: bestWpm,
                accuracy: bestAccuracy,
                diamond: (current.diamond || 0) + diamond,
                gold: (current.gold || 0) + gold,
                silver: (current.silver || 0) + silver,
                updatedAt: Date.now()
            };
        });
    }

    // 3. Lắng nghe bảng xếp hạng thời gian thực (Top 10)
    function subscribeLeaderboard(callback) {
        const lbRef = db.ref("leaderboard");

        db.ref(".info/connected").on("value", snap => {
            updateStatusBadges(Boolean(snap.val()));
        });

        lbRef.on("value", snapshot => {
            updateStatusBadges(true);
            const raw = snapshot.val() || {};
            const list = Object.values(raw)
                .sort((a, b) => {
                    return (b.harvested - a.harvested)
                        || (b.wpm - a.wpm)
                        || ((b.accuracy ?? 100) - (a.accuracy ?? 100));
                })
                .slice(0, 10);
            callback(list);
        }, err => {
            console.error("Lỗi đọc bảng xếp hạng từ Firebase:", err);
            updateStatusBadges(false);
        });
    }

    return {
        verifyOrCreateAccount,
        submitScore,
        subscribeLeaderboard
    };
})();
