# 🎰 777 ROYALE — Jackpot Minigame

Game quay số trúng thưởng 3-reel slot machine, thiết kế cho **Facebook Messenger WebView**, tích hợp **Supabase** để lưu trữ leads và kết quả.

## 🕹️ Gameplay

- Mỗi người chơi có **3 lượt quay** (không giới hạn thời gian)
- Quay 3 reel, mỗi reel hiển thị số **0–9**
- **TRÚNG:** 3 số trùng nhau → nhận quà
- **Jackpot 500K:** Trùng số **7**
- Mỗi SĐT chỉ chơi được **1 lần**

## 📁 Cấu trúc Files

```
├── login.html          # Màn hình đăng nhập (thu SĐT)
├── game.html           # Máy quay 3-reel slot machine
├── result.html         # Màn hình kết quả (win/lose)
├── DESIGN.md           # Design system: Neon Royale
├── webhook/
│   ├── server.js       # Express webhook server
│   ├── package.json
│   └── .env.example
├── nocodb/
│   └── schema.json     # Legacy schema reference (NocoDB cũ)
└── CLAUDE.md           # Claude Code guidance
```

## 🚀 Cài đặt & Chạy

### Chạy local (static HTML)
```bash
npx serve .
# Mở http://localhost:3000/login.html
```

### Webhook server (local dev)
```bash
cd webhook
cp .env.example .env
# Edit .env với Supabase credentials
npm install
npm start
```

## ⚙️ Cấu hình Supabase

1. Tạo project Supabase (hoặc dùng project có sẵn)
2. Tạo 2 bảng `leads` và `spin_results` (schema tương đương phần cũ)
3. Lấy `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Thêm các biến môi trường vào Vercel / server webhook

## 🔗 Supabase API Endpoints

```javascript
// Base URL + Headers
const SUPABASE_URL = 'https://<project-id>.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const headers = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

// Save lead
POST ${SUPABASE_URL}/rest/v1/leads
{ phone: "09xxxxxxx", created_at: "..." }

// Save spin result
POST ${SUPABASE_URL}/rest/v1/spin_results
{ lead_id, phone, reel1, reel2, reel3, is_win, prize_code }
```

## 🌐 Deploy lên Vercel

```bash
# 1. Push code lên GitHub
git init
git add .
git commit -m "feat: initial 777 royale game"
git remote add origin https://github.com/YOUR_USERNAME/777-royale.git
git push -u origin main

# 2. Deploy trên Vercel
# - Import repo từ GitHub
# - Set Environment Variables:
#   SUPABASE_URL = https://<project-id>.supabase.co
#   SUPABASE_ANON_KEY = your-anon-key
#   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
# - Deploy!
```

## 🔐 Facebook Messenger WebView Setup

1. Trên Meta for Developers, tạo Facebook App
2. Thêm **Messenger** product
3. Setup **WebView** via Send API hoặc URL Button
4. Nếu dùng webhook server, kiểm tra endpoint: `https://your-vercel-url.com/api/health`
5. Configure Page Subscription Messages

## 🎨 Design System

Tham khảo `DESIGN.md` cho:
- **Neon Royale** color palette (deep purple, gold, ruby, violet)
- Typography: Space Grotesk + Plus Jakarta Sans
- Glassmorphism components
- Spring animations
- Tailwind CSS config tokens

## 📦 Phần thưởng

| Số trùng | Phần thưởng | Tỷ lệ |
|---|---|---|
| 0–2 | Không trúng | 70% |
| 3 | 50K | 10% |
| 4–5, 8–9 | 100K | 15% |
| 6 | 200K | 4% |
| **7** | **🎉 JACKPOT 500K** | **1%** |

*Xác suất trúng Jackpot: ~0.1% mỗi lượt quay*
