#!/bin/bash

# 远程服务器部署脚本

set -e

# 配置变量
SERVER_HOST="accc.space"
SERVER_USER="root"  # 根据你的服务器用户修改
DEPLOY_PATH="/var/www/move-to-learn-backend"
REPO_URL="https://github.com/your-username/move-to-learn-js-backend.git"  # 替换为你的仓库地址

echo "🚀 开始部署到远程服务器: $SERVER_HOST"

# 检查SSH连接
echo "🔍 检查SSH连接..."
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo 'SSH连接成功'" 2>/dev/null; then
    echo "❌ 无法连接到服务器 $SERVER_HOST"
    echo "请检查:"
    echo "1. 服务器地址是否正确"
    echo "2. SSH密钥是否配置"
    echo "3. 网络连接是否正常"
    exit 1
fi

# 在服务器上执行部署
ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
set -e

echo "📋 服务器信息:"
echo "   - 主机名: $(hostname)"
echo "   - 操作系统: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "   - 当前用户: $(whoami)"
echo ""

# 设置部署路径
DEPLOY_PATH="/var/www/move-to-learn-backend"

# 创建部署目录
echo "📁 创建部署目录..."
mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

# 检查是否已有代码
if [ -d ".git" ]; then
    echo "🔄 更新代码..."
    git pull origin main
else
    echo "📥 克隆代码..."
    # 如果目录不为空，先清空
    if [ "$(ls -A .)" ]; then
        echo "⚠️  目录不为空，清空现有文件..."
        rm -rf * .[^.]*
    fi
    # 这里需要替换为实际的仓库地址
    echo "请手动上传代码到服务器，或者配置Git仓库"
    echo "如果代码已上传，请忽略此消息"
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "📦 安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 检查pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 安装pnpm..."
    npm install -g pnpm
fi

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装PM2..."
    npm install -g pm2
fi

echo "✅ 环境检查完成"
echo "   - Node.js: $(node -v)"
echo "   - pnpm: $(pnpm -v)"
echo "   - PM2: $(pm2 -v)"

ENDSSH

echo ""
echo "🎉 远程环境准备完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 将代码上传到服务器: $DEPLOY_PATH"
echo "2. 在服务器上配置环境变量:"
echo "   ssh $SERVER_USER@$SERVER_HOST"
echo "   cd $DEPLOY_PATH"
echo "   cp env.example .env"
echo "   vim .env  # 配置数据库连接等"
echo "3. 运行部署脚本:"
echo "   ./scripts/deploy-traditional.sh"
echo ""
echo "💡 或者使用rsync同步代码:"
echo "   rsync -avz --exclude node_modules --exclude .git . $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/" 