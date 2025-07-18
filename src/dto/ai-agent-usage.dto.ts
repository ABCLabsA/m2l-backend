import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsObject } from 'class-validator';

export class CreateAiAgentSessionDto {
  @ApiProperty({ description: '用户问题' })
  @IsString()
  @IsNotEmpty()
  question: string;
}

export class AiAgentUsageLogDto {
  @ApiProperty({ description: '使用记录ID' })
  id: string;

  @ApiProperty({ description: '用户ID' })
  userId: string;

  @ApiProperty({ description: '会话ID', required: false })
  sessionId?: string;

  @ApiProperty({ description: '用户查询（JSON格式）' })
  userQuery: any;

  @ApiProperty({ description: 'API响应（JSON格式）' })
  apiResponse: any;

  @ApiProperty({ description: '请求类型', required: false })
  requestType?: string;

  @ApiProperty({ description: '使用的token数量', required: false })
  tokenUsed?: number;

  @ApiProperty({ description: '响应时间（毫秒）', required: false })
  duration?: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

export class AiAgentDailyUsageDto {
  @ApiProperty({ description: '今日使用次数' })
  todayUsage: number;

  @ApiProperty({ description: '每日限制' })
  dailyLimit: number;

  @ApiProperty({ description: '是否可以继续使用' })
  canUse: boolean;
}

export class AssistantQuestionDto {
  @ApiProperty({ description: '用户问题', example: '如何在JavaScript中声明变量？' })
  @IsString()
  @IsNotEmpty()
  question: string;
}

export class AssistantErrorDto {
  @ApiProperty({ description: '用户问题', example: '我的代码为什么报错？' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: '错误信息', example: 'ReferenceError: x is not defined' })
  @IsString()
  @IsNotEmpty()
  errorMsg: string;
} 