#!/bin/bash

# 简单的打包上传部署脚本

set -e

# 配置变量
SERVER_HOST="accc.space"
SERVER_USER="root"
DEPLOY_PATH="/var/www/move-to-learn-backend"

echo "🚀 开始打包上传部署..."

# 1. 本地构建
echo "🔨 本地构建项目..."
pnpm install
pnpm run build

# 2. 创建部署包
echo "📦 创建部署包..."
mkdir -p deploy-temp
cp -r dist deploy-temp/
cp -r prisma deploy-temp/
cp package.json deploy-temp/
cp pnpm-lock.yaml deploy-temp/
cp ecosystem.config.js deploy-temp/
cp env.example deploy-temp/
mkdir -p deploy-temp/logs

# 3. 打包
echo "🗜️ 压缩文件..."
tar -czf deploy.tar.gz -C deploy-temp .

# 4. 上传到服务器
echo "📤 上传到服务器..."
scp deploy.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

# 5. 在服务器上部署
echo "🚀 在服务器上部署..."
ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
set -e

DEPLOY_PATH="/var/www/move-to-learn-backend"

# 创建部署目录
mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

# 备份现有文件（如果存在）
if [ -f ".env" ]; then
    cp .env .env.backup
fi

# 解压新文件
tar -xzf /tmp/deploy.tar.gz

# 恢复环境变量文件
if [ -f ".env.backup" ]; then
    mv .env.backup .env
else
    echo "⚠️  请配置环境变量文件:"
    echo "   cp env.example .env && vim .env"
fi

# 安装依赖
if ! command -v node &> /dev/null; then
    echo "📦 安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pnpm &> /dev/null; then
    echo "📦 安装pnpm..."
    npm install -g pnpm
fi

if ! command -v pm2 &> /dev/null; then
    echo "📦 安装PM2..."
    npm install -g pm2
fi

# 安装生产依赖
echo "📦 安装生产依赖..."
pnpm install --prod

# 检查环境变量配置

# 生成Prisma客户端
npx prisma generate

# 停止现有进程
echo "🛑 停止现有进程..."
pm2 delete move-to-learn-backend 2>/dev/null || true

# 启动应用
echo "🚀 启动应用..."
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup | grep -E '^sudo' | bash || true

echo "✅ 部署完成！"
pm2 status

ENDSSH

# 6. 清理临时文件
echo "🧹 清理临时文件..."
rm -rf deploy-temp deploy.tar.gz
ssh $SERVER_USER@$SERVER_HOST "rm -f /tmp/deploy.tar.gz"

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 服务信息:"
echo "   - 服务器: $SERVER_HOST"
echo "   - 部署路径: $DEPLOY_PATH"
echo "   - API地址: http://$SERVER_HOST:8000"
echo "   - Swagger文档: http://$SERVER_HOST:8000/api-docs"
echo ""
echo "💡 管理命令:"
echo "   ssh $SERVER_USER@$SERVER_HOST"
echo "   pm2 status"
echo "   pm2 logs move-to-learn-backend"
echo "   pm2 restart move-to-learn-backend" 