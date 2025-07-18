#!/bin/bash

# 代码同步到服务器脚本

set -e

# 配置变量
SERVER_HOST="accc.space"
SERVER_USER="root"  # 根据你的服务器用户修改
DEPLOY_PATH="/var/www/move-to-learn-backend"

echo "📤 同步代码到服务器: $SERVER_HOST"

# 检查SSH连接
echo "🔍 检查SSH连接..."
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo 'SSH连接成功'" 2>/dev/null; then
    echo "❌ 无法连接到服务器 $SERVER_HOST"
    echo "请检查SSH配置"
    exit 1
fi

# 创建远程目录
echo "📁 创建远程目录..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $DEPLOY_PATH"

# 同步代码（排除不必要的文件）
echo "🔄 同步代码..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'logs' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'Thumbs.db' \
    . $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/

echo "✅ 代码同步完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 连接到服务器:"
echo "   ssh $SERVER_USER@$SERVER_HOST"
echo ""
echo "2. 进入项目目录:"
echo "   cd $DEPLOY_PATH"
echo ""
echo "3. 配置环境变量:"
echo "   cp env.example .env"
echo "   vim .env"
echo ""
echo "4. 运行部署脚本:"
echo "   chmod +x scripts/*.sh"
echo "   ./scripts/deploy-traditional.sh" 