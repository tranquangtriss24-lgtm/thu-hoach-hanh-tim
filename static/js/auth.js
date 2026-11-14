// =========================================================
// MODULE AUTH: QUẢN LÝ ĐĂNG NHẬP & ĐĂNG KÝ TÀI KHOẢN
// =========================================================

window.AuthManager = (function () {
    let currentUser = null;

    const authModal = document.getElementById("auth-modal");
    const gameContainer = document.getElementById("game-container");
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const authUser = document.getElementById("auth-user");
    const authPass = document.getElementById("auth-pass");
    const authError = document.getElementById("auth-error");
    const logoutBtn = document.getElementById("logout-btn");
    const currentUsernameEl = document.getElementById("current-username");

    function enterGame(username) {
        currentUser = username;
        sessionStorage.setItem("hanh_tim_session_user", username);
        if (currentUsernameEl) currentUsernameEl.textContent = username;
        if (authModal) authModal.classList.add("hidden");
        if (gameContainer) gameContainer.classList.remove("hidden");

        if (window.LeaderboardManager) {
            window.LeaderboardManager.init(username);
        }
        if (window.OnionGame) {
            window.OnionGame.prepareField();
        }
    }

    function setButtonsDisabled(disabled) {
        if (loginBtn) loginBtn.disabled = disabled;
        if (registerBtn) registerBtn.disabled = disabled;
    }

    async function handleAuth(mode) {
        const user = authUser ? authUser.value.trim() : "";
        const pass = authPass ? authPass.value.trim() : "";

        if (authError) authError.textContent = "";

        if (user.length < 2) {
            if (authError) authError.textContent = "Tên tài khoản phải có ít nhất 2 ký tự!";
            return;
        }
        if (pass.length < 6) {
            if (authError) authError.textContent = "Mật khẩu phải có độ dài lớn hơn hoặc bằng 6 ký tự!";
            return;
        }

        setButtonsDisabled(true);

        try {
            if (window.OnlineDB && typeof window.OnlineDB.verifyOrCreateAccount === "function") {
                const res = await window.OnlineDB.verifyOrCreateAccount(user, pass, mode);
                if (!res.ok) {
                    if (authError) authError.textContent = res.message || "Thao tác thất bại!";
                } else {
                    enterGame(res.username);
                }
            } else {
                if (authError) authError.textContent = "Chưa kết nối được với máy chủ dữ liệu!";
            }
        } catch (err) {
            console.error(err);
            if (authError) authError.textContent = "Lỗi kết nối máy chủ Python!";
        } finally {
            setButtonsDisabled(false);
        }
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleAuth("login");
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleAuth("register");
        });
    }

    if (authPass) {
        authPass.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAuth("login");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (window.OnionGame) {
                window.OnionGame.stopAndReset();
            }
            currentUser = null;
            sessionStorage.removeItem("hanh_tim_session_user");
            if (authPass) authPass.value = "";
            if (authError) authError.textContent = "";
            if (gameContainer) gameContainer.classList.add("hidden");
            if (authModal) authModal.classList.remove("hidden");
        });
    }

    const savedUser = sessionStorage.getItem("hanh_tim_session_user");
    if (savedUser) {
        enterGame(savedUser);
    }
    
    // Khi vừa mở trang, cố gắng phát nhạc nền ở màn hình đăng nhập
    const bgMusic = document.getElementById("bg-music");
    if (bgMusic) {
        bgMusic.volume = 0.4; // Chỉnh âm lượng vừa phải (40%)
        // Trình duyệt chặn autoplay nếu chưa tương tác, nên ta bắt sự kiện click đầu tiên trên màn hình để bật nhạc
        document.addEventListener("click", () => {
            if (bgMusic.paused && authModal && !authModal.classList.contains("hidden")) {
                bgMusic.play().catch(e => console.log("Autoplay bị chặn:", e));
            }
        }, { once: true });
    }

    return {
        getCurrentUser: () => currentUser
    };
    
})();