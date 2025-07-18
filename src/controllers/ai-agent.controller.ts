import { Body, Controller, Post, Logger } from "@nestjs/common";
import { AiAgentService } from "src/services/ai-agent.service";
import { CurrentUser } from "src/decorators/user.decorator";
import { ApiResponseUtil } from "src/common/interfaces/api-response.interface";
import { AssistantQuestionDto, AssistantErrorDto } from "src/dto/ai-agent-usage.dto";

@Controller('/api/ai-agent')
export class AiAgentController {
  private readonly logger = new Logger(AiAgentController.name);
  
  constructor(private readonly aiAgentService: AiAgentService) {}


  @Post('session')
  async createSession(
    @CurrentUser("userId") userId: string, 
    @Body() body: { question: string }
  ) {
    this.logger.log(`用户 ${userId} 开始AI非流式会话请求`);
    
    try {
      // 调用非流式方法获取完整响应
      const response = await this.aiAgentService.createSessionNonStreaming(userId, body.question);
      
      this.logger.log(`用户 ${userId} AI会话请求成功完成`);
      
      return ApiResponseUtil.success({
        content: response,
        timestamp: Date.now()
      });

    } catch (error) {
      this.logger.error(`用户 ${userId} AI会话请求失败:`, error?.stack || error);
      
      if (error.message?.includes('每日使用次数已达上限') || error.message === 'Daily limit exceeded') {
        return ApiResponseUtil.error(429, '您今日的AI助手使用次数已达上限，请明天再试');
      }
      
      return ApiResponseUtil.error(500, error.message || '处理AI请求时发生错误');
    }
  }

  @Post('assistant-question')
  async assistantQuestion(
    @CurrentUser("userId") userId: string, 
    @Body() body: AssistantQuestionDto
  ) {
    this.logger.log(`用户 ${userId} 开始AI助理问题非流式请求`);
    
    try {
      // 调用非流式方法获取完整响应
      const response = await this.aiAgentService.assistantQuestionNonStreaming(userId, body.question);
      
      this.logger.log(`用户 ${userId} AI助理问题请求成功完成`);
      
      return ApiResponseUtil.success({
        content: response,
        timestamp: Date.now()
      });

    } catch (error) {
      this.logger.error(`用户 ${userId} AI助理问题请求失败:`, error?.stack || error);
      
      if (error.message?.includes('每日使用次数已达上限') || error.message === 'Daily limit exceeded') {
        return ApiResponseUtil.error(429, '您今日的AI助手使用次数已达上限，请明天再试');
      }
      
      return ApiResponseUtil.error(500, error.message || '处理AI助手问题时发生错误');
    }
  }

  @Post('assistant-error')
  async assistantError(
    @CurrentUser("userId") userId: string, 
    @Body() body: AssistantErrorDto
  ) {
    this.logger.log(`用户 ${userId} 开始AI助理错误诊断非流式请求`);
    
    try {
      // 调用非流式方法获取完整响应
      const response = await this.aiAgentService.assistantErrorNonStreaming(userId, body.question, body.errorMsg);
      
      this.logger.log(`用户 ${userId} AI助理错误诊断请求成功完成`);
      
      return ApiResponseUtil.success({
        content: response,
        timestamp: Date.now()
      });

    } catch (error) {
      this.logger.error(`用户 ${userId} AI助理错误诊断请求失败:`, error?.stack || error);
      
      if (error.message?.includes('每日使用次数已达上限') || error.message === 'Daily limit exceeded') {
        return ApiResponseUtil.error(429, '您今日的AI助手使用次数已达上限，请明天再试');
      }
      
      return ApiResponseUtil.error(500, error.message || '处理AI助手错误诊断时发生错误');
    }
  }

}