database_js = """// =========================================================
// MODULE DATABASE: KẾT NỐI FIREBASE REALTIME DATABASE ONLINE
// =========================================================

const firebaseConfig = {
// Thay bằng thông tin dự án Firebase của bạn để đồng bộ trực tuyến toàn cầu
apiKey: "YOUR_API_KEY",
authDomain: "thu-hoach-hanh-tim.firebaseapp.com",
databaseURL: "https://thu-hoach-hanh-tim-default-rtdb.firebaseio.com",
projectId: "thu-hoach-hanh-tim"
};

window.OnlineDB = (function () {
let db = null;
let isFirebaseReady = false;

try {
    if (
        typeof firebase !== "undefined" &&
        firebaseConfig.apiKey &&
        firebaseConfig.apiKey !== "YOUR_API_KEY"
    ) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        isFirebaseReady = true;
    }
} catch (err) {
    console.warn("Chuyển sang chế độ lưu trữ dự phòng cục bộ:", err);
}

function updateStatusBadge() {
    const badge = document.getElementById("db-status-badge");
    if (!badge) return;
    if (isFirebaseReady) {
        badge.textContent = "🟢 Trực tuyến (Firebase Cloud)";
        badge.style.background = "#e8f8f5";
        badge.style.color = "#16a085";
    } else {
        badge.textContent = "🟡 Trực tuyến (Chế độ Demo - Gắn Firebase URL để đồng bộ đa máy)";
        badge.style.background = "#fef9e7";
        badge.style.color = "#b7950b";
    }
}

// Mã hóa nhẹ mật khẩu (SHA-256 nếu trình duyệt hỗ trợ, hoặc fallback)
async function hashPassword(password) {
    if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + "_ninhthuan_salt");
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }
    return btoa(unescape(encodeURIComponent(password)));
}

// Xác thực hoặc tạo mới tài khoản người chơi
async function verifyOrCreateAccount(username, password) {
    const cleanUserKey = username.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const passHash = await hashPassword(password);

    if (isFirebaseReady && db) {
        const userRef = db.ref("users/" + cleanUserKey);
        const snapshot = await userRef.once("value");
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.passHash !== passHash) {
                return { ok: false, message: "Sai mật khẩu cho tài khoản này!" };
            }
            return { ok: true, username: userData.displayName || username };
        } else {
            await userRef.set({
                displayName: username,
                passHash: passHash,
                createdAt: Date.now()
            });
            return { ok: true, username: username, isNew: true };
        }
    } else {
        // Lưu danh sách tài khoản trong localStorage khi chạy thử nghiệm
        const users = JSON.parse(localStorage.getItem("hanh_tim_users") || "{}");
        if (users[cleanUserKey]) {
            if (users[cleanUserKey].passHash !== passHash) {
                return { ok: false, message: "Sai mật khẩu cho tài khoản này!" };
            }
            return { ok: true, username: users[cleanUserKey].displayName };
        } else {
            users[cleanUserKey] = {
                displayName: username,
                passHash: passHash,
                createdAt: Date.now()
            };
            localStorage.setItem("hanh_tim_users", JSON.stringify(users));
            return { ok: true, username: username, isNew: true };
        }
    }
}

// Lưu thành tích lên bảng xếp hạng (chỉ ghi đè nếu điểm mới cao hơn kỷ lục cũ của chính người đó)
async function submitScore(record) {
    const cleanUserKey = record.name.toLowerCase().replace(/[^a-z0-9_-]/g, "_");

    if (isFirebaseReady && db) {
        const scoreRef = db.ref("leaderboard/" + cleanUserKey);
        const snap = await scoreRef.once("value");
        const prev = snap.val();
        if (!prev || record.score > prev.score || (record.score === prev.score && record.wpm > prev.wpm)) {
            await scoreRef.set(record);
        }
    } else {
        let lb = JSON.parse(localStorage.getItem("hanh_tim_online_lb") || "[]");
        const existingIdx = lb.findIndex(item => item.name.toLowerCase() === record.name.toLowerCase());
        if (existingIdx >= 0) {
            const prev = lb[existingIdx];
            if (record.score > prev.score || (record.score === prev.score && record.wpm > prev.wpm)) {
                lb[existingIdx] = record;
            }
        } else {
            lb.push(record);
        }
        lb.sort((a, b) => b.score - a.score || b.wpm - a.wpm || b.accuracy - a.accuracy);
        localStorage.setItem("hanh_tim_online_lb", JSON.stringify(lb.slice(0, 20)));
    }
}

// Lắng nghe thay đổi bảng xếp hạng theo thời gian thực
function subscribeLeaderboard(callback) {
    updateStatusBadge();
    if (isFirebaseReady && db) {
        db.ref("leaderboard").on("value", (snapshot) => {
            const raw = snapshot.val();
            const list = raw ? Object.values(raw) : [];
            list.sort((a, b) => b.score - a.score || b.wpm - a.wpm || b.accuracy - a.accuracy);
            callback(list.slice(0, 10));
        });
    } else {
        const list = JSON.parse(localStorage.getItem("hanh_tim_online_lb") || "[]");
        list.sort((a, b) => b.score - a.score || b.wpm - a.wpm || b.accuracy - a.accuracy);
        callback(list.slice(0, 10));
    }
}

return {
    verifyOrCreateAccount,
    submitScore,
    subscribeLeaderboard
};
})();
"""

with open(os.path.join(base_dir, "js", "database.js"), "w", encoding="utf-8") as f:
f.write(database_js)

5. js/auth.js
auth_js = """// =========================================================
// MODULE AUTH: QUẢN LÝ ĐĂNG NHẬP & PHIÊN NGƯỜI CHƠI
// =========================================================

window.AuthManager = (function () {
let currentUser = null;

const authModal = document.getElementById("auth-modal");
const gameContainer = document.getElementById("game-container");
const authForm = document.getElementById("auth-form");
const authUser = document.getElementById("auth-user");
const authPass = document.getElementById("auth-pass");
const authError = document.getElementById("auth-error");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const currentUsernameEl = document.getElementById("current-username");

function enterGame(username) {
    currentUser = username;
    sessionStorage.setItem("hanh_tim_session_user", username);
    currentUsernameEl.textContent = username;
    authModal.classList.add("hidden");
    gameContainer.classList.remove("hidden");

    if (window.LeaderboardManager) {
        window.LeaderboardManager.init(username);
    }
    if (window.OnionGame) {
        window.OnionGame.prepareField();
    }
}

authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = authUser.value.trim();
    const pass = authPass.value;

    authError.textContent = "";

    if (user.length < 3) {
        authError.textContent = "Tên tài khoản phải có ít nhất 3 ký tự!";
        return;
    }
    if (pass.length < 4) {
        authError.textContent = "Mật khẩu phải có ít nhất 4 ký tự!";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Đang xác thực...";

    try {
        const res = await window.OnlineDB.verifyOrCreateAccount(user, pass);
        if (!res.ok) {
            authError.textContent = res.message;
        } else {
            enterGame(res.username);
        }
    } catch (err) {
        authError.textContent = "Lỗi kết nối máy chủ. Vui lòng thử lại!";
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Vào Ruộng Hành 🧅";
    }
});

logoutBtn.addEventListener("click", () => {
    if (window.OnionGame) {
        window.OnionGame.stopAndReset();
    }
    currentUser = null;
    sessionStorage.removeItem("hanh_tim_session_user");
    authPass.value = "";
    authError.textContent = "";
    gameContainer.classList.add("hidden");
    authModal.classList.remove("hidden");
});

// Tự động khôi phục phiên đăng nhập nếu vừa F5 trang
const savedUser = sessionStorage.getItem("hanh_tim_session_user");
if (savedUser) {
    enterGame(savedUser);
}

return {
    getCurrentUser: () => currentUser
};
})();
"""

with open(os.path.join(base_dir, "js", "auth.js"), "w", encoding="utf-8") as f:
f.write(auth_js)
