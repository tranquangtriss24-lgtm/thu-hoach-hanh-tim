// =========================================================
// MODULE EVENTS: XÁC SUẤT RƠI VẬT PHẨM
// =========================================================

window.GameEvents = (function () {
    let normalStreak = parseInt(sessionStorage.getItem("hanh_normal_streak")) || 0;

    function rollOnionType() {
        normalStreak++;

        const diamondChance = 1; 
        const goldChance = 4;    
        const silverChance = 10;  

        const rand = Math.random() * 100;
        let cumulative = 0;

        if (rand < (cumulative += diamondChance)) {
            normalStreak = 0;
            saveStreak();
            return { type: "diamond", name: "Hành Kim Cương", icon: "💎" };
        }
        if (rand < (cumulative += goldChance)) {
            normalStreak = 0;
            saveStreak();
            return { type: "gold", name: "Hành Vàng", icon: "🥇" };
        }
        if (rand < (cumulative += silverChance)) {
            normalStreak = 0;
            saveStreak();
            return { type: "silver", name: "Hành Bạc", icon: "🥈" };
        }

        saveStreak();
        // Hành thường để icon rỗng ("") để tuyệt đối không hiện củ hành 🧅 lên chữ cần nhập
        return { type: "normal", name: "Hành Tím", icon: "" };
    }

    function saveStreak() {
        sessionStorage.setItem("hanh_normal_streak", normalStreak);
    }

    return {
        rollOnionType
    };
})();