import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // 注册全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  // 启用 CORS - 为流式传输优化
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false,
  });
  
  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('Move to Learn API')
    .setDescription('Move to Learn 后端 API 文档')
    .setVersion('1.0')
    .addTag('auth', '认证相关接口')
    .addTag('courses', '课程相关接口')
    .addTag('chapters', '章节相关接口')
    .addTag('progress', '学习进度相关接口')
    .addTag('move', 'Move 编译相关接口')
    .addTag('contract', '合约相关接口')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // 暴露API JSON端点供客户端生成工具使用
  app.use('/api-json', (req, res) => {
    res.json(document);
  });
  
  const port = process.env.PORT ?? 8100;
  await app.listen(port);
  
  logger.log(`应用程序运行在: http://localhost:${port}`);
  logger.log(`Swagger 文档地址: http://localhost:${port}/api-docs`);
  
  // 全局未捕获异常处理
  process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的 Promise 拒绝:', reason);
  });
}
bootstrap();
