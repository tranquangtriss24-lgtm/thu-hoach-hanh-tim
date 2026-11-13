game_js = """// =========================================================
// MODULE GAME: LOGIC NHỔ HÀNH TÍM THEO HÀNG (5 HÀNG x 10 CÂY)
// =========================================================

window.OnionGame = (function () {
// Kho từ vựng tiếng Việt gắn với đặc sản & đời sống Ninh Thuận
const WORD_BANK = [
"hành", "tím", "ninh", "thuận", "nắng", "gió", "cát", "biển", "phan", "rang",
"tháp", "chàm", "nho", "táo", "cừu", "ruộng", "luống", "nhổ", "củ", "tươi",
"ngon", "thơm", "cay", "nồng", "đất", "mùa", "vụ", "nông", "dân", "nón",
"lá", "khăn", "rằn", "mồ", "hôi", "chăm", "chỉ", "tưới", "nước", "giếng",
"sạch", "giống", "xanh", "mầm", "rễ", "vỏ", "lụa", "bội", "thu", "vui",
"khỏe", "nhanh", "tay", "mắt", "chuẩn", "xác", "đồng", "quê", "hương", "vịnh",
"vĩnh", "hy", "bàu", "trúc", "mỹ", "nghiệp", "dệt", "gốm", "năng", "suất"
];

const ROWS_PER_FIELD = 5;   // 5 hàng
const COLS_PER_ROW = 10;    // 10 cây mỗi hàng (tổng 50 cây / luống)
const GAME_DURATION = 120;  // 120 giây (2 phút)

let timeLeft = GAME_DURATION;
let timerInterval = null;
let isSessionActive = false;     // Đã bấm nút "Bắt đầu thu hoạch"
let isTimerRunning = false;      // Chỉ chạy sau khi gõ xong từ đầu tiên & bấm Space/Enter
let soundEnabled = true;

let fieldNumber = 1;
let currentRow = 0;
let currentCol = 0;
let harvestedCount = 0;
let brokenCount = 0;
let totalCorrectChars = 0;
let totalAttempts = 0;

let fieldWords = []; // Mảng 2 chiều [5][10]

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

// --- ÂM THANH WEB AUDIO API (KHÔNG CẦN FILE MP3 NGOÀI) ---
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

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
            // Tiếng nhổ bật củ hành vui tai
            osc.type = "sine";
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(760, now + 0.12);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.start(now);
            osc.stop(now + 0.14);
        } else if (type === "snap") {
            // Tiếng đứt cây hành
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(190, now);
            osc.frequency.exponentialRampToValueAtTime(75, now + 0.16);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
            osc.start(now);
            osc.stop(now + 0.17);
        }
    } catch (e) {
        // Bỏ qua nếu trình duyệt chặn autoplay audio
    }
}

soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? "🔊 Âm thanh: Bật" : "🔇 Âm thanh: Tắt";
});

// --- TẠO LUỐNG HÀNH 5 HÀNG × 10 CỘT ---
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
            rowArr.push(w);
        }
        fieldWords.push(rowArr);
    }
}

function renderGrid() {
    onionGridEl.innerHTML = "";
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
            cell.textContent = "🧅";
            rowDiv.appendChild(cell);
        }
        onionGridEl.appendChild(rowDiv);
    }
    updateCursorAndFarmer();
}

function getCellElement(r, c) {
    const rowEl = onionGridEl.children[r];
    if (!rowEl) return null;
    // Cột 0 là nhãn H1..H5, các ô hành bắt đầu từ index 1
    return rowEl.children[c + 1] || null;
}

function updateCursorAndFarmer() {
    // Cập nhật trạng thái hàng đang gõ
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

    rowDisplayEl.textContent = `L${fieldNumber} - H${currentRow + 1}/${ROWS_PER_FIELD}`;

    // Di chuyển nhân vật nông dân đến đúng cây hành hiện tại
    const activeCell = getCellElement(currentRow, currentCol);
    if (activeCell) {
        farmerEl.style.left = `${activeCell.offsetLeft + 2}px`;
        farmerEl.style.top = `${activeCell.offsetTop - 16}px`;
    }

    // Hiển thị từ hiện tại & từ kế tiếp trên hàng
    const currentWord = fieldWords[currentRow][currentCol];
    targetWordEl.textContent = currentWord;

    let nextW = "—";
    if (currentCol + 1 < COLS_PER_ROW) {
        nextW = fieldWords[currentRow][currentCol + 1];
    } else if (currentRow + 1 < ROWS_PER_FIELD) {
        nextW = `${fieldWords[currentRow + 1][0]} (xuống hàng ${currentRow + 2})`;
    } else {
        nextW = "Mở luống mới!";
    }
    nextWordEl.textContent = `Tiếp theo: ${nextW}`;
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

    timerEl.textContent = "02:00";
    scoreEl.textContent = "0";
    brokenEl.textContent = "0";
    wpmEl.textContent = "0";
    accuracyEl.textContent = "100%";
    wordInput.value = "";
    wordInput.disabled = true;
    wordInput.classList.remove("input-error");
    startBtn.disabled = false;
    resetBtn.disabled = true;
    hintEl.textContent = "⏳ Bấm 'Bắt đầu thu hoạch', gõ xong từ đầu tiên & nhấn Space/Enter để tính giờ!";

    generateFieldWords();
    renderGrid();
    targetWordEl.textContent = 'Bấm "Bắt đầu thu hoạch"';
}

// --- BẮT ĐẦU PHIÊN CHƠI (CHƯA CHẠY ĐỒNG HỒ) ---
function startSession() {
    prepareField();
    isSessionActive = true;
    isTimerRunning = false;

    wordInput.disabled = false;
    wordInput.focus();
    startBtn.disabled = true;
    resetBtn.disabled = false;

    const firstWord = fieldWords[0][0];
    targetWordEl.textContent = firstWord;
    hintEl.textContent = `✍️ Hãy gõ từ "${firstWord}" rồi bấm Space hoặc Enter để đồng hồ bắt đầu chạy!`;
}

function startCountdown() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    hintEl.textContent = "⏱️ Đang tính giờ! Nhổ nhanh theo từng hàng nào!";

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        updateLiveStats();

        if (timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

function updateLiveStats() {
    const elapsedSeconds = GAME_DURATION - timeLeft;
    const elapsedMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 1 / 60;
    // Chuẩn WPM quốc tế: 5 ký tự chuẩn = 1 từ (hoặc tính theo số từ đúng)
    const wpm = Math.round((totalCorrectChars / 5) / elapsedMinutes);
    wpmEl.textContent = wpm;

    const acc = totalAttempts > 0 ? Math.round((harvestedCount / totalAttempts) * 100) : 100;
    accuracyEl.textContent = `${acc}%`;
}

function processSubmittedWord(rawInput) {
    if (!isSessionActive) return;
    const typed = rawInput.trim();
    if (!typed) {
        wordInput.value = "";
        return;
    }

    // Kích hoạt đồng hồ ngay sau khi xác nhận xong từ đầu tiên
    if (!isTimerRunning) {
        startCountdown();
    }

    const expected = fieldWords[currentRow][currentCol];
    const cell = getCellElement(currentRow, currentCol);
    totalAttempts++;

    if (typed === expected) {
        // ĐÚNG TỪ -> NHỔ CỦ HÀNH LÊN
        harvestedCount++;
        totalCorrectChars += expected.length + 1;
        scoreEl.textContent = harvestedCount;
        playSound("pull");

        if (cell) {
            cell.classList.remove("active-cell");
            cell.classList.add("harvested");
            cell.textContent = "🧺";
        }
    } else {
        // SAI TỪ -> CÂY HÀNH BỊ ĐỨT NGANG GỐC
        brokenCount++;
        brokenEl.textContent = brokenCount;
        playSound("snap");

        if (cell) {
            cell.classList.remove("active-cell");
            cell.classList.add("broken");
            cell.textContent = "🥀";
        }
    }

    updateLiveStats();
    wordInput.value = "";
    wordInput.classList.remove("input-error");

    // Tiến sang cây kế tiếp trên cùng hàng
    currentCol++;
    if (currentCol >= COLS_PER_ROW) {
        // Hết 1 hàng -> xuống hàng tiếp theo
        currentCol = 0;
        currentRow++;

        if (currentRow >= ROWS_PER_FIELD) {
            // Thu hoạch xong toàn bộ 5 hàng (50 cây) -> Mở luống mới tiếp tục trong 2 phút
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

// Lắng nghe phím Space hoặc Enter
wordInput.addEventListener("keydown", (e) => {
    if (!isSessionActive) return;
    if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        processSubmittedWord(wordInput.value);
    }
});

// Hỗ trợ bộ gõ di động / IME khi nhập dấu cách
wordInput.addEventListener("input", () => {
    if (!isSessionActive) return;
    const val = wordInput.value;
    if (val.endsWith(" ")) {
        processSubmittedWord(val);
        return;
    }
    const expected = fieldWords[currentRow][currentCol];
    if (val && !expected.startsWith(val)) {
        wordInput.classList.add("input-error");
    } else {
        wordInput.classList.remove("input-error");
    }
});

async function finishGame() {
    isSessionActive = false;
    isTimerRunning = false;
    clearInterval(timerInterval);
    wordInput.disabled = true;
    startBtn.disabled = false;
    resetBtn.disabled = true;
    hintEl.textContent = "🏁 Hết thời gian thu hoạch!";

    const finalWpm = parseInt(wpmEl.textContent, 10) || 0;
    const finalAcc = totalAttempts > 0 ? Math.round((harvestedCount / totalAttempts) * 100) : 100;
    const user = window.AuthManager ? window.AuthManager.getCurrentUser() : "Nông dân";

    finalStatsEl.innerHTML = `
        <div>🧑‍🌾 Nông dân: <strong>${user}</strong></div>
        <div>🧅 Số củ hành nhổ được: <strong>${harvestedCount} củ</strong></div>
        <div>🥀 Số cây bị đứt: <strong>${brokenCount} cây</strong></div>
        <div>⚡ Tốc độ đánh máy: <strong>${finalWpm} WPM</strong></div>
        <div>🎯 Độ chính xác: <strong>${finalAcc}%</strong></div>
    `;
    resultModal.classList.remove("hidden");

    if (window.LeaderboardManager) {
        await window.LeaderboardManager.saveAndRefresh(harvestedCount, finalWpm, finalAcc);
    }
}

function stopAndReset() {
    prepareField();
}

startBtn.addEventListener("click", startSession);
resetBtn.addEventListener("click", startSession);
closeModalBtn.addEventListener("click", () => {
    resultModal.classList.add("hidden");
    prepareField();
});

window.addEventListener("resize", () => {
    if (fieldWords.length > 0) updateCursorAndFarmer();
});

return {
    prepareField,
    stopAndReset
};
})();
"""

with open(os.path.join(base_dir, "js", "game.js"), "w", encoding="utf-8") as f:
f.write(game_js)
