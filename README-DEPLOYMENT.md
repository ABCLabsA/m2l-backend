# Move to Learn 后端部署指南

## 概述

本指南介绍如何使用 Docker 部署 Move to Learn 后端服务。

## 系统要求

- Docker 20.10+
- Docker Compose 2.0+
- 服务器内存: 至少 2GB
- 硬盘空间: 至少 10GB

## 快速部署

### 1. 克隆项目到服务器

```bash
git clone <your-repo-url> move-to-learn-backend
cd move-to-learn-backend
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量（重要！）
vim .env
```

**必须修改的环境变量：**
- `POSTGRES_PASSWORD`: 数据库密码，使用强密码
- `JWT_SECRET`: JWT密钥，至少32位字符的随机字符串

### 3. 执行部署

```bash
# 给部署脚本执行权限
chmod +x scripts/deploy.sh

# 运行部署脚本
./scripts/deploy.sh
```

### 4. 验证部署

部署成功后，访问以下地址验证：
- API文档: http://your-server:8000/api-docs
- 健康检查: http://your-server:8000/api

## Nginx 反向代理配置

在你的 Nginx 配置中添加以下配置：

```nginx
# /etc/nginx/sites-available/move-to-learn-backend
server {
    listen 80;
    server_name your-api-domain.com;  # 替换为你的域名

    # 反向代理到后端
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers (如果需要)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    }

    # 处理 OPTIONS 请求
    location ~* \.(eot|otf|ttf|woff|woff2)$ {
        add_header Access-Control-Allow-Origin *;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/move-to-learn-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f postgres

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 停止服务并删除数据
docker-compose down -v

# 重新构建并启动
docker-compose up -d --build

# 进入容器调试
docker-compose exec app sh
docker-compose exec postgres psql -U movetolearn_user -d movetolearn
```

## 数据库管理

### 连接数据库
```bash
docker-compose exec postgres psql -U movetolearn_user -d movetolearn
```

### 备份数据库
```bash
docker-compose exec postgres pg_dump -U movetolearn_user movetolearn > backup.sql
```

### 恢复数据库
```bash
docker-compose exec -T postgres psql -U movetolearn_user movetolearn < backup.sql
```

### 运行 Prisma 迁移
```bash
# 进入应用容器
docker-compose exec app sh

# 运行迁移
npx prisma migrate deploy

# 重置数据库（危险操作）
npx prisma migrate reset --force
```

## 监控和日志

### 查看资源使用情况
```bash
docker stats
```

### 日志文件位置
- 应用日志: `./logs/` 目录
- Docker 日志: `docker-compose logs`

### 健康检查
```bash
# 检查API健康状态
curl http://localhost:8000/api-docs

# 检查数据库连接
docker-compose exec postgres pg_isready -U movetolearn_user -d movetolearn
```

## 故障排除

### 常见问题

1. **端口占用**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :8000
   # 杀死占用进程
   sudo kill -9 <PID>
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库容器状态
   docker-compose ps postgres
   # 查看数据库日志
   docker-compose logs postgres
   ```

3. **应用启动失败**
   ```bash
   # 查看应用日志
   docker-compose logs app
   # 重新构建镜像
   docker-compose build --no-cache app
   ```

4. **内存不足**
   ```bash
   # 检查系统资源
   free -h
   df -h
   # 清理Docker资源
   docker system prune -a
   ```

### 性能优化

1. **启用 Node.js 集群模式**（在生产环境中）
2. **配置 Nginx 缓存**
3. **使用 CDN** 加速静态资源
4. **数据库索引优化**

## 安全建议

1. **定期更新密码** (`POSTGRES_PASSWORD`, `JWT_SECRET`)
2. **使用 HTTPS** (配置 SSL 证书)
3. **配置防火墙** (只开放必要端口)
4. **定期备份数据库**
5. **监控日志** (异常访问和错误)

## 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新部署
./scripts/deploy.sh
```

如果有数据库结构变更：
```bash
# 进入应用容器运行迁移
docker-compose exec app npx prisma migrate deploy
``` 