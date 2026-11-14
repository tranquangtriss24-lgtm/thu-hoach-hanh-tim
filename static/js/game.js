// =========================================================
// MODULE GAME: LOGIC NHỔ HÀNH TÍM THEO HÀNG (5 HÀNG x 10 CÂY)
// =========================================================

// =========================================================
// MODULE GAME: LOGIC NHỔ HÀNH TÍM THEO HÀNG (5 HÀNG x 10 CÂY)
// =========================================================

window.OnionGame = (function () {
    // 1. Khởi tạo mảng từ dự phòng (phòng khi chưa kết nối được mạng hoặc đang chạy offline)
    let WORD_BANK = [
        "hành", "tím", "ninh", "thuận", "nắng", "gió", "cát", "biển", "phan", "rang",
        "tháp", "chàm", "nho", "táo", "cừu", "ruộng", "luống", "nhổ", "củ", "tươi",
        "ngon", "thơm", "cay", "nồng", "đất", "mùa", "vụ", "nông", "dân", "nón","lúa", "gạo", "cày", "bừa", "cuốc", "xẻng", "liềm", "hái", "gặt", "gieo",
"cấy", "trồng", "tưới", "bón", "ruộng", "vườn", "đồng", "nương", "rẫy", "trâu",
"bò", "gà", "vịt", "lợn", "thóc", "rơm", "rạ", "mùa", "ngô", "khoai",
"sắn", "đậu", "đỗ", "lạc", "vừng", "mè", "mía", "chè", "cau", "trầu",
"bưởi", "cam", "quýt", "chanh", "ổi", "xoài", "mít", "nhãn", "vải", "chuối",
"dừa", "rau", "cải", "bầu", "bí", "mướp", "cà", "ớt", "hành", "tỏi",
"gừng", "nghệ", "sả", "heo", "ngan", "ngỗng", "dê", "cừu", "cá", "tôm",
"cua", "ốc", "ếch", "ong", "tằm", "tơ", "ao", "chuồng", "trại", "bờ",
"mương", "giếng", "gầu", "thúng", "mủng", "nia", "sàng", "giần", "cối", "chày","nước", "quê", "đất", "biển", "đảo", "núi", "sông", "rừng", "cờ", "sao",
"sen", "tre", "trúc", "nón", "phở", "bún", "nem", "chả", "tết", "làng",
"xã", "tỉnh", "miền", "bắc", "trung", "nam", "vua", "dân", "hội", "đình",
"chùa", "miếu", "đền", "tháp", "thành", "phố", "phường", "quận", "huyện", "thôn",
"xóm", "bản", "buôn", "ấp", "cầu", "đò", "thuyền", "ghe", "bến", "cảng",
"vịnh", "đèo", "suối", "thác", "hồ", "đầm", "cồn", "bãi", "hang", "động",
"trống", "chiêng", "cồng", "đàn", "sáo", "nhị", "tranh", "chèo", "tuồng", "rối",
"múa", "hát", "thơ", "văn", "sử", "chữ", "tiếng", "giọng", "áo", "yếm",
"khăn", "guốc", "dép", "bánh", "chưng", "giò", "mắm", "muối", "trà", "rượu","nhà", "cửa", "ông", "bà", "cha", "mẹ", "bố", "má", "con", "cháu",
"anh", "chị", "em", "cô", "dì", "chú", "bác", "cậu", "mợ", "thím",
"dượng", "vợ", "chồng", "dâu", "rể", "tổ", "họ", "ruột", "thân", "yêu",
"thương", "quý", "nuôi", "dạy", "chăm", "cơm", "bếp", "giường", "mái", "ấm",
"cụ", "kỵ", "chắt", "chút", "chít", "thầy", "u", "bầm", "tía", "ba",
"mế", "trưởng", "thứ", "út", "cả", "trai", "gái", "nội", "ngoại", "tộc",
"chi", "phái", "đời", "kiếp", "giỗ", "cúng", "thờ", "hương", "khói", "bàn",
"ghế", "tủ", "chiếu", "chăn", "màn", "gối", "đệm", "nồi", "niêu", "xoong",
"chảo", "bát", "đũa", "thìa", "muỗng", "đĩa", "chén", "ly", "cốc", "bình",
"mâm", "canh", "thịt", "trứng", "sữa", "cháo", "nôi", "võng", "ru", "bế",
"ẵm", "dắt", "nâng", "đỡ", "lo", "nghĩ", "nhớ", "mong", "đợi", "chờ",
"về", "sum", "họp", "đoàn", "tụ", "vui", "cười", "hiếu", "thảo", "hòa"
    ];

    // 2. Hàm tải danh sách từ tiếng Việt từ nguồn trực tuyến (JSON)
    async function fetchOnlineDictionary() {
        try {
            // Bạn có thể thay thế link bên dưới bằng một link file JSON công khai chứa danh sách từ tiếng Việt của bạn trên GitHub
            const res = await fetch('https://github.com/tranquangtriss24-lgtm/thu-hoach-hanh-tim/blob/main/vietnamese_words.json');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    WORD_BANK = data;
                    console.log(`Đã tải thành công ${WORD_BANK.length} từ từ internet!`);
                }
            }
        } catch (e) {
            console.log("Sử dụng từ điển dự phòng cục bộ do lỗi kết nối:", e);
        }
    }

    // Gọi hàm tải từ ngay khi module được nạp
    fetchOnlineDictionary();

    const ROWS_PER_FIELD = 5;
    const COLS_PER_ROW = 10;
    const GAME_DURATION = 120;
    // ... (các phần code logic bên dưới giữ nguyên như cũ)

    let timeLeft = GAME_DURATION;
    let timerInterval = null;
    let isSessionActive = false;
    let isTimerRunning = false;
    let soundEnabled = true;

    let fieldNumber = 1;
    let currentRow = 0;
    let currentCol = 0;
    let harvestedCount = 0;
    let brokenCount = 0;
    let totalCorrectChars = 0;
    let totalAttempts = 0;
    let fieldWords = [];

    let sessionDiamond = 0;
    let sessionGold = 0;
    let sessionSilver = 0;

    // DOM Elements
    const timerEl = document.getElementById("timer");
    const scoreEl = document.getElementById("score");
    const brokenEl = document.getElementById("broken-count");
    const wpmEl = document.getElementById("wpm");
    const accuracyEl = document.getElementById("accuracy");
    const rowDisplayEl = document.getElementById("current-row-display");
    const targetWordEl = document.getElementById("target-word-display");
    const nextWordEl = document.getElementById("next-word-display");
    const wordInput = document.getElementById("word-input");
    const hintEl = document.getElementById("timer-status-hint");
    const onionGridEl = document.getElementById("onion-grid");
    const farmerEl = document.getElementById("farmer");
    const startBtn = document.getElementById("start-btn");
    const resetBtn = document.getElementById("reset-btn");
    const soundToggleBtn = document.getElementById("sound-toggle-btn");
    const resultModal = document.getElementById("result-modal");
    const finalStatsEl = document.getElementById("final-stats");
    const closeModalBtn = document.getElementById("close-modal-btn");

    // --- ÂM THANH WEB AUDIO API ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    
    function startSession() {
        // --- TẮT NHẠC NỀN KHI BẮT ĐẦU VÀO TRẬN CHƠI ---
        const bgMusic = document.getElementById("bg-music");
        if (bgMusic) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }
        // ---------------------------------------------

        prepareField();
        isSessionActive = true;
        isTimerRunning = false;
        // ... các code phía dưới giữ nguyên ...
    }

    function playSound(type) {
        if (!soundEnabled) return;
        try {
            if (!audioCtx) audioCtx = new AudioCtx();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;
            if (type === "pull") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(760, now + 0.12);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                osc.start(now);
                osc.stop(now + 0.14);
            } else if (type === "snap") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(190, now);
                osc.frequency.exponentialRampToValueAtTime(75, now + 0.16);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
                osc.start(now);
                osc.stop(now + 0.17);
            }
        } catch (e) {}
    }

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            soundToggleBtn.textContent = soundEnabled ? "🔊 Âm thanh: Bật" : "🔇 Âm thanh: Tắt";
            
            const bgMusic = document.getElementById("bg-music");
            if (bgMusic) {
                if (soundEnabled) {
                    bgMusic.muted = false;
                    bgMusic.play().catch(e => console.log("Không phát được nhạc:", e));
                } else {
                    bgMusic.muted = true;
                    bgMusic.pause();
                }
            }
        });
    }

    function generateFieldWords() {
        fieldWords = [];
        let lastWord = "";
        for (let r = 0; r < ROWS_PER_FIELD; r++) {
            const rowArr = [];
            for (let c = 0; c < COLS_PER_ROW; c++) {
                let w = "";
                do {
                    w = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
                } while (w === lastWord);
                lastWord = w;

                // Random độ hiếm gắn liền với từ này
                const onionData = window.GameEvents ? window.GameEvents.rollOnionType() : { type: "normal", name: "Hành Tím", icon: "🧅" };
                
                rowArr.push({
                    word: w,
                    type: onionData.type,
                    icon: onionData.icon
                });
            }
            fieldWords.push(rowArr);
        }
    }

    function renderGrid() {
        if (!onionGridEl) return;
        onionGridEl.innerHTML = "";
        
        sessionDiamond = 0;
        sessionGold = 0;
        sessionSilver = 0;

        for (let r = 0; r < ROWS_PER_FIELD; r++) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "onion-row";
            if (r === currentRow) rowDiv.classList.add("active-row");

            const label = document.createElement("div");
            label.className = "row-label";
            label.textContent = `H${r + 1}`;
            rowDiv.appendChild(label);

            for (let c = 0; c < COLS_PER_ROW; c++) {
                const cell = document.createElement("div");
                cell.className = "onion-cell";
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Lấy thông tin độ hiếm từ mảng fieldWords đã tạo sẵn
                const item = fieldWords[r][c];
                cell.dataset.rarity = item.type;
                cell.textContent = "🧅"; // Trên ruộng luôn hiện củ hành tím trước khi nhổ

                rowDiv.appendChild(cell);
            }
            onionGridEl.appendChild(rowDiv);
        }
        updateCursorAndFarmer();
    }
    
    function getCellElement(r, c) {
        if (!onionGridEl || !onionGridEl.children[r]) return null;
        return onionGridEl.children[r].children[c + 1] || null;
    }

    function updateCursorAndFarmer() {
        for (let r = 0; r < ROWS_PER_FIELD; r++) {
            const rowEl = onionGridEl.children[r];
            if (!rowEl) continue;
            rowEl.classList.toggle("active-row", r === currentRow);
            for (let c = 0; c < COLS_PER_ROW; c++) {
                const cell = getCellElement(r, c);
                if (cell) {
                    cell.classList.toggle("active-cell", r === currentRow && c === currentCol);
                }
            }
        }

        if (rowDisplayEl) rowDisplayEl.textContent = `L${fieldNumber} - H${currentRow + 1}/${ROWS_PER_FIELD}`;

        const activeCell = getCellElement(currentRow, currentCol);
        if (activeCell && farmerEl) {
            farmerEl.style.left = `${activeCell.offsetLeft + 2}px`;
            farmerEl.style.top = `${activeCell.offsetTop - 16}px`;
        }

        if (fieldWords[currentRow] && fieldWords[currentRow][currentCol]) {
            const currentItem = fieldWords[currentRow][currentCol];
            
            // Chỉ hiện icon khi có icon và không phải hành thường
            if (currentItem.icon && currentItem.type !== "normal") {
                targetWordEl.innerHTML = `${currentItem.word} <span class="text-2xl">${currentItem.icon}</span>`;
            } else {
                targetWordEl.textContent = currentItem.word;
            }

            let nextW = "—";
            if (currentCol + 1 < COLS_PER_ROW) {
                const nextItem = fieldWords[currentRow][currentCol + 1];
                nextW = (nextItem.icon && nextItem.type !== "normal") ? `${nextItem.word} ${nextItem.icon}` : nextItem.word;
            } else if (currentRow + 1 < ROWS_PER_FIELD) {
                const nextItem = fieldWords[currentRow + 1][0];
                const nextIconStr = (nextItem.icon && nextItem.type !== "normal") ? ` ${nextItem.icon}` : "";
                nextW = `${nextItem.word}${nextIconStr} (xuống hàng ${currentRow + 2})`;
            } else {
                nextW = "Mở luống mới!";
            }
            if (nextWordEl) nextWordEl.textContent = `Tiếp theo: ${nextW}`;
        }
    }

    function prepareField() {
        clearInterval(timerInterval);
        isSessionActive = false;
        isTimerRunning = false;
        timeLeft = GAME_DURATION;
        fieldNumber = 1;
        currentRow = 0;
        currentCol = 0;
        harvestedCount = 0;
        brokenCount = 0;
        totalCorrectChars = 0;
        totalAttempts = 0;
        

        if (timerEl) timerEl.textContent = "02:00";
        if (scoreEl) scoreEl.textContent = "0";
        if (brokenEl) brokenEl.textContent = "0";
        if (wpmEl) wpmEl.textContent = "0";
        if (accuracyEl) accuracyEl.textContent = "100%";
        if (wordInput) {
            wordInput.value = "";
            wordInput.disabled = true;
            wordInput.classList.remove("input-error");
        }
        if (startBtn) startBtn.disabled = false;
        if (resetBtn) resetBtn.disabled = true;
        if (hintEl) hintEl.textContent = "⏳ Bấm 'Bắt đầu thu hoạch', gõ xong từ đầu tiên & nhấn Space/Enter để tính giờ!";

        generateFieldWords();
        renderGrid();
        if (targetWordEl) targetWordEl.textContent = 'Bấm "Bắt đầu thu hoạch"';
    }

    function startSession() {
        prepareField();
        isSessionActive = true;
        isTimerRunning = false;

        if (wordInput) {
            wordInput.disabled = false;
            wordInput.focus();
        }
        if (startBtn) startBtn.disabled = true;
        if (resetBtn) resetBtn.disabled = false;

        // Lấy object từ đầu tiên
        const firstItem = fieldWords[0][0];
        if (targetWordEl) targetWordEl.innerHTML = `${firstItem.word} 
        <span class="text-2xl">${firstItem.icon}</span>`;

        if (hintEl) hintEl.textContent = `✍️ Hãy gõ từ "${firstItem.word}" rồi bấm Space hoặc Enter để đồng hồ bắt đầu chạy!`;
    }

    function startCountdown() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        if (hintEl) hintEl.textContent = "⏱️ Đang tính giờ! Nhổ nhanh theo từng hàng nào!";

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            if (timerEl) timerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

            updateLiveStats();

            if (timeLeft <= 0) {
                finishGame();
            }
        }, 1000);
    }

    function updateLiveStats() {
        const elapsedSeconds = GAME_DURATION - timeLeft;
        const elapsedMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 1 / 60;
        const wpm = Math.round((totalCorrectChars / 5) / elapsedMinutes);
        if (wpmEl) wpmEl.textContent = wpm;

        const acc = totalAttempts > 0 ? Math.round((harvestedCount / totalAttempts) * 100) : 100;
        if (accuracyEl) accuracyEl.textContent = `${acc}%`;
    }

   function processSubmittedWord(rawInput) {
        if (!isSessionActive) return;
        const typed = rawInput.trim();
        if (!typed) {
            if (wordInput) wordInput.value = "";
            return;
        }

        if (!isTimerRunning) {
            startCountdown();
        }

        // Lấy object từ hiện tại (gồm word, type, icon)
        const expectedItem = fieldWords[currentRow][currentCol];
        const cell = getCellElement(currentRow, currentCol);
        totalAttempts++;

        if (typed === expectedItem.word) {
            harvestedCount++;
            totalCorrectChars += expectedItem.word.length + 1;
            if (scoreEl) scoreEl.textContent = harvestedCount;
            playSound("pull");

            if (cell) {
                const rarity = cell.dataset.rarity;
                if (rarity === "diamond") sessionDiamond++;
                else if (rarity === "gold") sessionGold++;
                else if (rarity === "silver") sessionSilver++;

                cell.classList.remove("active-cell");
                cell.classList.add("harvested");
                
                // ĐOẠN NÀY ĐÂY: Nếu là vật phẩm quý hiếm thì hiện icon (💎, 🥇, 🥈), 
                // còn nếu là hành thường thì hiện giỏ (🧺)
                cell.textContent = rarity !== "normal" ? expectedItem.icon : "🧺";
            }
        
        } else {
            brokenCount++;
            if (brokenEl) brokenEl.textContent = brokenCount;
            playSound("snap");

            if (cell) {
                cell.classList.remove("active-cell");
                cell.classList.add("broken");
                cell.textContent = "🥀";
            }
        }

        updateLiveStats();
        if (wordInput) {
            wordInput.value = "";
            wordInput.classList.remove("input-error");
        }

        currentCol++;
        if (currentCol >= COLS_PER_ROW) {
            currentCol = 0;
            currentRow++;

            if (currentRow >= ROWS_PER_FIELD) {
                fieldNumber++;
                currentRow = 0;
                currentCol = 0;
                generateFieldWords();
                renderGrid();
                return;
            }
        }

        updateCursorAndFarmer();
    }

    if (wordInput) {
        wordInput.addEventListener("keydown", (e) => {
            if (!isSessionActive) return;
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                processSubmittedWord(wordInput.value);
            }
        });

        wordInput.addEventListener("input", () => {
            if (!isSessionActive) return;
            const val = wordInput.value;
            if (val.endsWith(" ")) {
                processSubmittedWord(val);
                return;
            }
            const expectedItem = fieldWords[currentRow][currentCol];
            if (val && expectedItem && !expectedItem.word.startsWith(val)) {
                wordInput.classList.add("input-error");
            } else {
                wordInput.classList.remove("input-error");
            }
        });
    }

    async function finishGame() {
        isSessionActive = false;
        isTimerRunning = false;
        clearInterval(timerInterval);
        if (wordInput) wordInput.disabled = true;
        if (startBtn) startBtn.disabled = false;
        if (resetBtn) resetBtn.disabled = true;
        if (hintEl) hintEl.textContent = "🏁 Hết thời gian thu hoạch!";

        const bgMusic = document.getElementById("bg-music");
        if (bgMusic) {
            bgMusic.play().catch(e => console.log(e));
        }

        const finalWpm = parseInt(wpmEl ? wpmEl.textContent : "0", 10) || 0;
        const finalAcc = totalAttempts > 0 ? Math.round((harvestedCount / totalAttempts) * 100) : 100;
        const user = window.AuthManager ? window.AuthManager.getCurrentUser() : "Nông dân";

        if (finalStatsEl) {
            finalStatsEl.innerHTML = `
                <div>🧑‍🌾 Nông dân: <strong>${user}</strong></div>
                <div>🧅 Số củ hành nhổ được: <strong>${harvestedCount} củ</strong></div>
                <div>🥀 Số cây bị đứt: <strong>${brokenCount} cây</strong></div>
                <div>⚡ Tốc độ đánh máy: <strong>${finalWpm} WPM</strong></div>
                <div>🎯 Độ chính xác: <strong>${finalAcc}%</strong></div>
            `;
        }
        if (resultModal) resultModal.classList.remove("hidden");

        if (window.LeaderboardManager) {
            await window.LeaderboardManager.saveAndRefresh(harvestedCount, finalWpm, finalAcc, sessionDiamond, sessionGold, sessionSilver);
        }
    }

    function stopAndReset() {
        prepareField();
    }

    if (startBtn) startBtn.addEventListener("click", startSession);
    if (resetBtn) resetBtn.addEventListener("click", startSession);
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            if (resultModal) resultModal.classList.add("hidden");
            prepareField();
            
            const bgMusic = document.getElementById("bg-music");
            if (bgMusic) bgMusic.play().catch(e => {});
        });
    }

    window.addEventListener("resize", () => {
        if (fieldWords.length > 0) updateCursorAndFarmer();
    });

    return {
        prepareField,
        stopAndReset
    };
})();