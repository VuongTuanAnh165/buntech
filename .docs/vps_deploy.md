# Hướng Dẫn Deploy Dự Án BúnTech lên VPS & Cấu Hình CI/CD

> [!NOTE]
> Tài liệu này hướng dẫn chi tiết cách đưa dự án BúnTech (Backend: AdonisJS, Frontend: Nuxt.js) lên một máy chủ ảo (VPS) chạy hệ điều hành **Ubuntu 22.04 / 24.04**, và cấu hình **GitHub Actions** để tự động hoá việc deploy (CI/CD).

Quy trình này chia làm 2 giai đoạn chính:
1. **Làm thủ công 1 lần duy nhất**: Cài đặt môi trường trên VPS.
2. **Tự động hoá**: Thiết lập GitHub Actions để các lần sau chỉ cần `git push` là code tự lên server.

---

## Giai đoạn 1: Thiết lập Máy chủ (VPS)

Sau khi thuê VPS, bạn sẽ có địa chỉ IP và mật khẩu của người dùng `root`. Hãy mở Terminal (trên Mac/Linux) hoặc PowerShell (trên Windows) và kết nối vào VPS:

```bash
ssh root@<IP_CỦA_VPS>
```

### Bước 1: Cài đặt Node.js và PM2
Ứng dụng của bạn chạy bằng Node.js. Chạy lần lượt các lệnh sau để cài Node.js (phiên bản 20 hoặc 22) và PM2 (Trình quản lý tiến trình, giúp ứng dụng chạy ngầm và tự khởi động lại nếu bị lỗi):

```bash
# Cài đặt Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra phiên bản
node -v
npm -v

# Cài đặt PM2 toàn cục
sudo npm install -g pm2
```

### Bước 2: Cài đặt Cơ sở dữ liệu MySQL & Redis
Hệ thống BúnTech dùng MySQL để lưu trữ và Redis cho Cache/Session/Queue.

```bash
# Cài đặt MySQL và Redis
sudo apt-get update
sudo apt-get install -y mysql-server redis-server

# Khởi động và cho phép chạy cùng hệ thống
sudo systemctl enable mysql
sudo systemctl enable redis-server
sudo systemctl start mysql
sudo systemctl start redis-server
```

> [!IMPORTANT]
> Cài đặt mật khẩu cho MySQL:
> Chạy lệnh `sudo mysql` và gõ:
> `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'mat_khau_cua_ban';`
> Sau đó gõ `FLUSH PRIVILEGES;` và `exit`.
> Hãy nhớ tạo database có tên `buntech` bằng lệnh: `CREATE DATABASE buntech;`

### Bước 3: Cài đặt Nginx
Nginx đóng vai trò là "Cửa bảo vệ" (Reverse Proxy). Khi người dùng gõ domain `buntech.vn`, Nginx sẽ nhận request ở cổng 80 (HTTP)/443 (HTTPS) và chuyển tiếp nó vào cổng của Nuxt (ví dụ 3000) hoặc AdonisJS (ví dụ 3333).

```bash
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Bước 4: Tạo thư mục dự án và file cấu hình `.env`
Code sẽ được đẩy từ GitHub về đây. Chúng ta tạo thư mục chứa dự án:

```bash
sudo mkdir -p /var/www/buntech
sudo chown -R $USER:$USER /var/www/buntech
cd /var/www/buntech
```

Tạo thủ công file `.env` cho BE và FE, vì những file này chứa key bảo mật, **tuyệt đối không đẩy lên GitHub**.

**Tạo `.env` cho Backend:**
```bash
mkdir BE && nano BE/.env
```
Copy nội dung `.env` môi trường thật của bạn vào (Đổi `NODE_ENV=production`, sửa DB_PASSWORD khớp với VPS). Lưu lại (Ctrl+O, Enter, Ctrl+X).

**Tạo `.env` cho Frontend:**
```bash
mkdir FE && nano FE/.env
```
Copy nội dung cấu hình Firebase, URL API thật vào.

---

## Giai đoạn 2: Cấu hình CI/CD (GitHub Actions)

Mục tiêu: Khi bạn gõ lệnh đẩy code lên nhánh `main`, GitHub sẽ kết nối tự động với VPS, tải code mới về, chạy lệnh build, và restart ứng dụng.

### Bước 1: Tạo cặp khóa SSH để GitHub truy cập vào VPS
Trên VPS của bạn, chạy lệnh sau để tạo chìa khoá (để mặc định, cứ ấn Enter):
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions"
```
Thêm khoá công khai (public key) vào danh sách khoá được cấp phép của VPS:
```bash
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```
Xem và **copy toàn bộ nội dung** của khoá riêng tư (private key):
```bash
cat ~/.ssh/id_rsa
```
*(Đoạn mã này bắt đầu bằng `-----BEGIN OPENSSH PRIVATE KEY-----`)*

### Bước 2: Khai báo Secrets trên GitHub
Vào trang Repository BúnTech của bạn trên GitHub -> Chọn thẻ **Settings** -> Mục Security ở menu trái chọn **Secrets and variables** -> **Actions** -> Bấm **New repository secret**.
Bạn cần tạo các Secret sau:
- `HOST`: Địa chỉ IP của VPS.
- `USERNAME`: `root` (hoặc tên user bạn dùng ssh vào VPS).
- `SSH_PRIVATE_KEY`: Dán toàn bộ nội dung khoá riêng tư vừa copy ở Bước 1 vào đây.

### Bước 3: Viết luồng công việc (Workflow) CI/CD
Trong mã nguồn trên máy tính của bạn, tạo một thư mục `.github/workflows` và tạo file `deploy.yml`.

> [!TIP]
> Bạn có thể tạo file `deploy.yml` này ngay trong mã nguồn của bạn. Khi commit nó lên, GitHub sẽ tự động nhận diện và chạy.

```yaml
name: Deploy to VPS Production

on:
  push:
    branches:
      - main # Chỉ chạy khi push code vào nhánh main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Kiểm tra mã nguồn
        uses: actions/checkout@v3

      - name: Deploy qua SSH lên VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/buntech
            
            # Cập nhật mã nguồn mới nhất từ GitHub
            # Lưu ý: VPS cần được clone repo GitHub về trước ở lần đầu tiên
            git pull origin main

            # ----------------------------------
            # 1. BUILD VÀ DEPLOY BACKEND (AdonisJS)
            # ----------------------------------
            cd BE
            npm ci
            node ace build
            cd build
            npm ci --omit=dev
            
            # Chạy Migration để update Database (nếu có bảng mới)
            node ace migration:run --force
            
            # Restart ứng dụng backend bằng PM2
            # Lần đầu tiên bạn cần chạy: pm2 start server.js --name buntech-api
            pm2 restart buntech-api || pm2 start server.js --name buntech-api
            
            # ----------------------------------
            # 2. BUILD VÀ DEPLOY FRONTEND (Nuxt)
            # ----------------------------------
            cd ../../FE
            npm ci
            npm run build
            
            # Restart ứng dụng Nuxt SSR bằng PM2
            # Lần đầu tiên bạn cần chạy: pm2 start .output/server/index.mjs --name buntech-web
            pm2 restart buntech-web || pm2 start .output/server/index.mjs --name buntech-web
```

> [!CAUTION]
> Lần đầu tiên chạy Action này, trong thư mục `/var/www/buntech` trên VPS chưa có liên kết `git`. Bạn cần tự clone repo về 1 lần đầu tiên trên VPS:
> `cd /var/www && git clone <link-repo-github> buntech` (Nếu là repo private, bạn cần tạo Personal Access Token trên GitHub để clone).
> Từ lần thứ 2 trở đi, GitHub Action sẽ tự chạy lệnh `git pull origin main` thành công.

---

## Giai đoạn 3: Cấu hình Nginx và SSL
Khi code đã được khởi chạy bằng PM2 trên VPS (API chạy ở cổng `3333`, Web chạy ở cổng `3000`), chúng ta cài đặt Nginx để cấu hình tên miền.

Tại VPS, tạo file cấu hình Nginx:
```bash
sudo nano /etc/nginx/sites-available/buntech
```

Copy nội dung dưới đây (thay `api.buntech.vn` và `buntech.vn` bằng tên miền thật của bạn):
```nginx
# Cấu hình cho Backend (AdonisJS)
server {
    listen 80;
    server_name api.buntech.vn;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Cấu hình cho Frontend (Nuxt.js)
server {
    listen 80;
    server_name buntech.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt file cấu hình và khởi động lại Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/buntech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Cài đặt SSL Miễn phí (HTTPS)
Đừng quên trỏ Record A của tên miền về IP của VPS trên trình quản lý tên miền (như Cloudflare hoặc mắt bão).
Sau đó chạy Certbot để lấy chứng chỉ SSL tự động:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d buntech.vn -d api.buntech.vn
```
Certbot sẽ tự động sửa file Nginx và chuyển toàn bộ HTTP sang HTTPS cho bạn.

---

## Tổng kết Quy Trình Tự Động Hóa Từ Giờ Trở Đi

Một khi bạn đã thiết lập xong các bước trên, vòng đời lập trình của bạn sẽ nhàn hạ như sau:
1. Sửa lỗi, lập trình tính năng mới trên máy tính cá nhân.
2. Commit code.
3. Chạy `git push origin main`.
4. GitHub Actions tự động nhảy vào làm nhiệm vụ kết nối VPS, kéo code mới nhất, build lại FE/BE và khởi động lại ứng dụng.
5. Người dùng trải nghiệm tính năng mới trên Production.
