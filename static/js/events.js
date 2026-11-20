// =========================================================
// MODULE EVENTS: XÁC SUẤT RƠI VẬT PHẨM
// =========================================================

window.GameEvents = (function () {
    let normalStreak = parseInt(sessionStorage.getItem("hanh_normal_streak")) || 0;

// Ví dụ cấu hình trong file events.js của bạn:
    function rollOnionType() {
        const rand = Math.random() * 100;
        if (rand < 1) {
            return { 
                type: "diamond", 
                name: "Hành Kim Cương", 
                icon: `<img src="/static/images/onion_dimond.png" alt="Kim Cương" class="rare-onion-img">` 
            };
        } else if (rand < 1 + 4) {
            return { 
                type: "gold", 
                name: "Hành Vàng", 
                icon: `<img src="/static/images/onion_gold.png" alt="Vàng" class="rare-onion-img">` 
            };
        } else if (rand < 1 + 4 + 10) {
            return { 
                type: "silver", 
                name: "Hành Bạc", 
                icon: `<img src="/static/images/onion_silver.png" alt="Bạc" class="rare-onion-img">` 
            };
        } else {
            return { 
                type: "normal", 
                name: "Hành Tím",   
            };
        }
    }

    function saveStreak() {
        sessionStorage.setItem("hanh_normal_streak", normalStreak);
    }

    return {
        rollOnionType
    };
})();
