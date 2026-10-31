1️⃣ One-Time EC2 Setup
🔹 Install Nginx

sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

🔹 Create App Directory
sudo mkdir -p /var/www/react-vite-app
sudo chown -R ubuntu:ubuntu /var/www/react-vite-app

2️⃣ Nginx Config for React + Vite (SPA)

Create config:

sudo nano /etc/nginx/sites-available/react-vite

✅ Nginx Configuration

server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/react-vite-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}


server {
    listen 80;
    server_name reactvite.sanjayarajapaksha.it.com;

    root /var/www/react-vite-app;
    index index.html;

    # Serve React Vite static files
    location / {
        try_files $uri /index.html;
    }

    # Optional: fallback for 404
    error_page 404 /index.html;
}

Enable:

sudo ln -s /etc/nginx/sites-available/react-vite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx


3️⃣ Update Vite Config (Important)

Edit vite.config.js:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})

4️⃣ Environment Variables (Production)

Create .env.production:

VITE_API_URL=https://api.yourdomain.com


Use in React:

import.meta.env.VITE_API_URL


5️⃣ GitHub Secrets (Required)

Go to GitHub → Repo → Settings → Secrets → Actions

| Name          | Value                     |
| ------------- | ------------------------- |
| `EC2_HOST`    | EC2 Public IP             |
| `EC2_USER`    | ubuntu                    |
| `EC2_SSH_KEY` | EC2 private key           |
| `EC2_PATH`    | `/var/www/react-vite-app` |


6️⃣ GitHub Actions CI/CD Pipeline

Create file:

📄 .github/workflows/react-vite-deploy.yml

name: Deploy React Vite App to EC2

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install Dependencies
        run: npm install

      - name: Build App
        run: npm run build

      - name: Deploy to EC2
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "dist/*"
          target: ${{ secrets.EC2_PATH }}
          strip_components: 1
