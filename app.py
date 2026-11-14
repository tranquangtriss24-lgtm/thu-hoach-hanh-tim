import sqlite3
import hashlib
import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder=".", static_url_path="")
DB_PATH = "nongdan_ninhthuan.db"


# 1. Khởi tạo cơ sở dữ liệu SQLite (bảng users và bảng leaderboard có chứa kho báu)
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Bảng tài khoản người dùng
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            pass_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    # Bảng xếp hạng thành tích & kho báu quí hiếm
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leaderboard (
            username TEXT PRIMARY KEY,
            harvested INTEGER NOT NULL DEFAULT 0,
            wpm INTEGER NOT NULL DEFAULT 0,
            accuracy INTEGER NOT NULL DEFAULT 100,
            diamond INTEGER NOT NULL DEFAULT 0,
            gold INTEGER NOT NULL DEFAULT 0,
            silver INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def hash_password(password: str) -> str:
    salt = "ninhthuan_hanh_tim_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


# Phục vụ giao diện web chính
@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")


# 2. API Đăng ký hoặc Đăng nhập tài khoản
@app.route("/api/auth", methods=["POST"])
def auth_user():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()
    mode = str(data.get("mode", "login")).strip()

    if len(username) < 2:
        return jsonify({"ok": False, "message": "Tên tài khoản phải từ 2 ký tự trở lên!"}), 400
    if len(password) < 6:
        return jsonify({"ok": False, "message": "Mật khẩu phải có ít nhất 6 ký tự!"}), 400

    pass_hash = hash_password(password)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT username, pass_hash FROM users WHERE LOWER(username) = LOWER(?)", (username,))
    row = cursor.fetchone()

    if mode == "register":
        if row:
            conn.close()
            return jsonify({"ok": False, "message": "Tên tài khoản này đã có người đăng ký!"}), 409
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            "INSERT INTO users (username, pass_hash, created_at) VALUES (?, ?, ?)",
            (username, pass_hash, now)
        )
        conn.commit()
        conn.close()
        return jsonify({"ok": True, "username": username, "isNew": True})
    else:
        if not row:
            conn.close()
            return jsonify({"ok": False, "message": "Tài khoản không tồn tại. Vui lòng bấm Đăng Ký Mới!"}), 404
        db_username, db_hash = row
        conn.close()
        if db_hash != pass_hash:
            return jsonify({"ok": False, "message": "Sai mật khẩu cho tài khoản này!"}), 401
        return jsonify({"ok": True, "username": db_username, "isNew": False})


# 3. API Lưu điểm số & Kho báu vào Database (Cộng dồn vật phẩm quí hiếm)
@app.route("/api/score", methods=["POST"])
def save_score():
    data = request.get_json(silent=True) or {}
    username = str(data.get("name", "")).strip()
    harvested = int(data.get("harvested", 0))
    wpm = int(data.get("wpm", 0))
    accuracy = int(data.get("accuracy", 100))
    diamond = int(data.get("diamond", 0))
    gold = int(data.get("gold", 0))
    silver = int(data.get("silver", 0))

    if not username:
        return jsonify({"ok": False, "message": "Thiếu tên tài khoản"}), 400

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Cập nhật thành tích (ghi đè nếu điểm cao hơn) và cộng dồn kho báu quí hiếm
    cursor.execute("""
        INSERT INTO leaderboard (username, harvested, wpm, accuracy, diamond, gold, silver, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
            harvested = CASE WHEN excluded.harvested > leaderboard.harvested 
                             THEN excluded.harvested ELSE leaderboard.harvested END,
            wpm = CASE WHEN excluded.harvested >= leaderboard.harvested AND excluded.wpm > leaderboard.wpm 
                       THEN excluded.wpm ELSE leaderboard.wpm END,
            accuracy = CASE WHEN excluded.harvested >= leaderboard.harvested 
                            THEN excluded.accuracy ELSE leaderboard.accuracy END,
            diamond = leaderboard.diamond + excluded.diamond,
            gold = leaderboard.gold + excluded.gold,
            silver = leaderboard.silver + excluded.silver,
            updated_at = excluded.updated_at
    """, (username, harvested, wpm, accuracy, diamond, gold, silver, now))
    
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


# 4. API Lấy Top 10 Bảng Xếp Hạng & Kho Báu từ Database 
@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT username, harvested, wpm, accuracy, diamond, gold, silver
        FROM leaderboard
        ORDER BY harvested DESC, wpm DESC, accuracy DESC
        LIMIT 10
    """)
    rows = cursor.fetchall()
    conn.close()

    result = [
        {
            "name": r[0], 
            "harvested": r[1], 
            "wpm": r[2], 
            "accuracy": r[3],
            "diamond": r[4],
            "gold": r[5],
            "silver": r[6]
        }
        for r in rows
    ]
    return jsonify(result)


if __name__ == "__main__":
    init_db()
    # Nếu trước đó đã chạy file db cũ không có cột kho báu, bạn có thể xóa file nongdan_ninhthuan.db đi để code tự tạo mới sạch sẽ
    print("🚀 Server đang chạy tại: http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)