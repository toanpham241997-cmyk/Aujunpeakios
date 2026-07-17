# 🚀 Hướng Dẫn Deploy Lên Render - Đầy Đủ Chi Tiết

## Tổng Quan Kiến Trúc

```
render.com
├── 🗄️  PostgreSQL Database        (Render Managed Database)
├── 🖥️  API Server (Express)        (Web Service - Node.js)
├── 🌐  Frontend (React/Vite)       (Static Site)
└── 🤖  Discord Bot                 (Background Worker)
```

---

## Bước 1: Tạo Database PostgreSQL trên Render

1. Đăng nhập vào https://render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Điền thông tin:
   - **Name**: `aujunpeak-db`
   - **Database**: `aujunpeak`
   - **User**: `aujunpeak_user`
   - **Region**: `Singapore` (gần Việt Nam nhất)
   - **Plan**: `Free` (miễn phí, đủ cho dev)
4. Click **"Create Database"**
5. Chờ ~2 phút để database khởi động
6. Vào tab **"Info"** → Copy **"External Database URL"**
   - Dạng: `postgresql://user:password@host/database`
   - **Lưu lại URL này**, sẽ dùng ở các bước sau

---

## Bước 2: Deploy API Server (Express)

### 2.1. Chuẩn bị repository

Tạo repository GitHub chứa toàn bộ source code này.

### 2.2. Tạo API Server trên Render

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository của bạn
3. Cấu hình:
   - **Name**: `aujunpeak-api`
   - **Region**: `Singapore`
   - **Branch**: `main`
   - **Root Directory**: *(để trống - root của repo)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```
     npx pnpm@9 install && npx pnpm@9 --filter @workspace/db run push && npx pnpm@9 --filter @workspace/api-server run build
     ```
   - **Start Command**:
     ```
     npx pnpm@9 --filter @workspace/api-server run start
     ```
   - **Plan**: `Free`

### 2.3. Thêm Environment Variables cho API Server

Click **"Environment"** → **"Add Environment Variable"**, thêm từng biến:

| Key | Value | Mô tả |
|-----|-------|--------|
| `DATABASE_URL` | *(External URL từ Bước 1)* | Kết nối PostgreSQL |
| `BOT_API_SECRET` | *(tạo chuỗi ngẫu nhiên, vd: `abc123xyz456`)* | Xác thực bot |
| `NODE_ENV` | `production` | Môi trường |
| `PORT` | `10000` | Port server |
| `VITE_GOOGLE_CLIENT_ID` | *(Google OAuth Client ID, optional)* | Google Login |

**Tạo BOT_API_SECRET**: Có thể dùng https://passwordsgenerator.net/ hoặc chạy:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Click **"Create Web Service"**
5. Chờ ~5 phút để build và deploy
6. Sau khi xong, copy **URL của API service** (vd: `https://aujunpeak-api.onrender.com`)

---

## Bước 3: Deploy Frontend (Static Site)

### 3.1. Tạo Static Site trên Render

1. Click **"New +"** → **"Static Site"**
2. Connect cùng repository
3. Cấu hình:
   - **Name**: `aujunpeak-app`
   - **Branch**: `main`
   - **Root Directory**: *(để trống)*
   - **Build Command**:
     ```
     npx pnpm@9 install && npx pnpm@9 --filter @workspace/aujunpeak run build
     ```
   - **Publish Directory**: `artifacts/aujunpeak/dist/public`

### 3.2. Thêm Environment Variables cho Frontend

| Key | Value |
|-----|-------|
| `VITE_GOOGLE_CLIENT_ID` | *(Google OAuth Client ID, optional)* |
| `PORT` | `3000` |
| `BASE_PATH` | `/` |

### 3.3. Cấu hình Rewrites (SPA routing)

Vào tab **"Redirects/Rewrites"** → Thêm rule:
- **Source**: `/*`
- **Destination**: `/index.html`
- **Action**: `Rewrite`

### 3.4. Cấu hình Custom Headers (proxy API)

Vì frontend (static) và API (server) ở hai domain khác nhau, cần cấu hình:

**Option A: Cùng một domain (khuyến nghị)**

Tạo một **Web Service** thay vì Static Site:
- **Build Command**: `npm install -g pnpm && pnpm install && pnpm --filter @workspace/aujunpeak run build`
- **Start Command**: `npx serve artifacts/aujunpeak/dist/public -p $PORT`

Thêm package `serve`:
```bash
pnpm add -D serve --filter @workspace/aujunpeak
```

Hoặc sử dụng **Nginx** để serve static files.

**Option B: CORS (đơn giản hơn)**

Frontend gọi API qua URL đầy đủ. Cập nhật `artifacts/aujunpeak/src/lib/api.ts`:
```ts
const BASE = import.meta.env.VITE_API_URL || '/api';
```

Thêm vào `.env` của frontend:
```
VITE_API_URL=https://aujunpeak-api.onrender.com/api
```

---

## Bước 4: Deploy Discord Bot (Background Worker)

### 4.1. Tạo Background Worker trên Render

1. Click **"New +"** → **"Background Worker"**
2. Connect cùng repository
3. Cấu hình:
   - **Name**: `aujunpeak-bot`
   - **Branch**: `main`
   - **Root Directory**: `discord-bot`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: `Free`

### 4.2. Thêm Environment Variables cho Bot

| Key | Value | Mô tả |
|-----|-------|--------|
| `DISCORD_BOT_TOKEN` | *(lấy từ Discord Developer Portal)* | Token bot |
| `DISCORD_CLIENT_ID` | *(Application ID từ Discord)* | ID ứng dụng |
| `API_BASE_URL` | `https://aujunpeak-api.onrender.com/api` | URL API server |
| `BOT_API_SECRET` | *(giống với Bước 2)* | Secret xác thực |
| `DISCORD_GUILD_ID` | *(ID server Discord của bạn)* | Giới hạn server |
| `ALLOWED_ROLE_ID` | *(Role ID được phép dùng lệnh, optional)* | Phân quyền |

---

## Bước 5: Tạo Discord Bot

### 5.1. Tạo Application trên Discord Developer Portal

1. Vào https://discord.com/developers/applications
2. Click **"New Application"**
3. Đặt tên: `Aujunpeak Bot`
4. Vào tab **"Bot"**:
   - Click **"Add Bot"**
   - Dưới **"TOKEN"**: Click **"Reset Token"** → Copy token
   - Bật **"Server Members Intent"** và **"Message Content Intent"**
5. Vào tab **"OAuth2"** → **"URL Generator"**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`
   - Copy URL và mở để invite bot vào server Discord của bạn

### 5.2. Đăng ký Slash Commands

Sau khi bot đã được deploy trên Render (hoặc chạy local):
```bash
cd discord-bot
npm install
DISCORD_BOT_TOKEN=your_token DISCORD_CLIENT_ID=your_client_id DISCORD_GUILD_ID=your_guild_id node register-commands.js
```

---

## Bước 6: Kiểm tra và Test

### Test API Server
```bash
curl https://aujunpeak-api.onrender.com/api/healthz
# Kết quả: {"status":"ok"}
```

### Test tạo key qua Bot
Trong Discord server, gõ:
```
/createkey type:vip days:30 max_devices:2
```

### Test web app
Mở URL frontend → Nhập key vừa tạo → Đăng nhập

---

## Biến Môi Trường Tổng Hợp

### API Server (.env hoặc Render Environment)
```env
DATABASE_URL=postgresql://...
BOT_API_SECRET=your_secret_here
NODE_ENV=production
PORT=10000
```

### Frontend (Render Static Site Environment)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id (optional)
PORT=3000
BASE_PATH=/
```

### Discord Bot (Render Worker Environment)
```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
API_BASE_URL=https://aujunpeak-api.onrender.com/api
BOT_API_SECRET=your_secret_here
ALLOWED_ROLE_ID=role_id_for_admins (optional)
```

---

## Lưu Ý Quan Trọng

1. **Free Plan của Render**: Service sẽ ngủ sau 15 phút không có request. Lần đầu request sẽ chậm ~30 giây (cold start). Để fix, dùng UptimeRobot ping API mỗi 14 phút.

2. **Database trên Free Plan**: 90 ngày sẽ bị xóa nếu không nâng cấp. Backup dữ liệu thường xuyên.

3. **CORS**: Nếu frontend và API khác domain, cần thêm CORS config trong `artifacts/api-server/src/app.ts`:
   ```ts
   app.use(cors({ origin: ['https://your-frontend.onrender.com'] }));
   ```

4. **Environment trong Replit**: Để chạy locally trên Replit, thêm `DATABASE_URL` và `BOT_API_SECRET` vào Replit Secrets.

---

## Khắc Phục Sự Cố

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `DATABASE_URL must be set` | Thiếu env var | Thêm DATABASE_URL vào Render env |
| `Key không tồn tại` | Key chưa được tạo | Dùng `/createkey` trong Discord |
| Bot không respond | Token sai hoặc bot offline | Kiểm tra DISCORD_BOT_TOKEN |
| CORS error | Frontend/API khác domain | Thêm CORS config trong app.ts |
| `Column does not exist` | Schema chưa push | Chạy lại build command có `pnpm --filter @workspace/db run push` |
