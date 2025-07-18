module.exports = {
  apps: [
    {
      name: 'move-to-learn-backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8100
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8100
      },
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 进程管理
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // 启动配置
      min_uptime: '10s',
      max_restarts: 10,
      
      // 其他配置
      merge_logs: true,
      time: true
    }
  ]
}; 