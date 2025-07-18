import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { JsonValue } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);

  constructor(private readonly prisma: PrismaService) { }
  private readonly dailyLimit = 10;
  private readonly OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    timeout: 60000, // 60秒超时
  });

  async checkDailyLimit(userId: string) {
    this.logger.log(`检查用户 ${userId} 的每日限制`);

    try {
      const count = await this.prisma.aiAgentUsageLog.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      this.logger.log(`用户 ${userId} 今日使用次数: ${count}/${this.dailyLimit}`);
      return count < this.dailyLimit;
    } catch (error) {
      this.logger.error(`检查用户 ${userId} 每日限制时发生错误:`, error?.stack || error);
      throw new Error(`检查每日限制失败: ${error?.message || '未知错误'}`);
    }
  }

  async getDailyUsage(userId: string) {
    try {
      const todayUsage = await this.prisma.aiAgentUsageLog.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      const result = {
        todayUsage,
        dailyLimit: this.dailyLimit,
        canUse: todayUsage < this.dailyLimit,
      };

      this.logger.log(`获取用户 ${userId} 使用情况: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`获取用户 ${userId} 使用情况时发生错误:`, error?.stack || error);
      throw new Error(`获取使用情况失败: ${error?.message || '未知错误'}`);
    }
  }

  async getUserUsageLogs(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      this.logger.log(`获取用户 ${userId} 使用日志, 页码: ${page}, 限制: ${limit}`);

      const [logs, total] = await Promise.all([
        this.prisma.aiAgentUsageLog.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.aiAgentUsageLog.count({
          where: { userId },
        })
      ]);

      const result = {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      this.logger.log(`成功获取用户 ${userId} 使用日志，共 ${total} 条记录`);
      return result;
    } catch (error) {
      this.logger.error(`获取用户 ${userId} 使用日志时发生错误:`, error?.stack || error);
      throw new Error(`获取使用日志失败: ${error?.message || '未知错误'}`);
    }
  }

  private async createUserLog({
    userId,
    userQuery,
    apiResponse,
    requestType,
    tokenUsed,
    duration,
    sessionId,
  }: {
    userId: string;
    userQuery: JsonValue;
    apiResponse: JsonValue;
    requestType?: string;
    tokenUsed?: number;
    duration?: number;
    sessionId?: string;
  }) {
    try {
      const log = await this.prisma.aiAgentUsageLog.create({
        data: {
          userId,
          userQuery: userQuery ?? Prisma.JsonNull,
          apiResponse: apiResponse ?? Prisma.JsonNull,
          requestType,
          tokenUsed,
          duration,
          sessionId,
        },
      });

      this.logger.log(`成功记录用户 ${userId} 的使用日志，会话ID: ${sessionId}`);
      return log;
    } catch (error) {
      this.logger.error(`创建用户 ${userId} 使用日志时发生错误:`, error?.stack || error);
      throw new Error(`记录使用日志失败: ${error?.message || '未知错误'}`);
    }
  }

  // 新增：处理聊天完成的核心方法
  private async *streamChatCompletion(userId: string, messages: ChatCompletionMessageParam[], type: string) {
    const sessionId = randomUUID();
    const startTime = Date.now();
    let fullResponse = '';

    try {
      this.logger.log(`开始为用户 ${userId} 创建OpenAI流式请求，会话ID: ${sessionId}, 类型: ${type}`);

      // 创建OpenAI流
      const response = await this.OpenAI.chat.completions.create({
        model: "ark-deepseek-v3-250324",
        messages: messages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      });

      this.logger.log(`用户 ${userId} 的OpenAI流式请求创建成功，会话ID: ${sessionId}`);

      // 逐个yield内容块
      for await (const chunk of response) {
        const deltaContent = chunk.choices?.[0]?.delta?.content;

        if (deltaContent) {
          fullResponse += deltaContent;
          yield deltaContent;
        }
      }

      this.logger.log(`用户 ${userId} 的OpenAI流式请求完成，会话ID: ${sessionId}，响应长度: ${fullResponse.length}`);

      // 异步记录日志
      this.createUserLog({
        userId,
        sessionId,
        userQuery: JSON.stringify(messages),
        apiResponse: { content: fullResponse },
        requestType: 'streaming_chat',
        tokenUsed: fullResponse.length,
        duration: Date.now() - startTime,
      }).catch(error => {
        this.logger.error(`异步记录日志失败，用户: ${userId}, 会话ID: ${sessionId}:`, error?.stack || error);
      });

    } catch (error) {
      this.logger.error(`用户 ${userId} 流式聊天完成时发生错误，会话ID: ${sessionId}:`, error?.stack || error);
      
      // 记录失败的请求
      try {
        await this.createUserLog({
          userId,
          sessionId,
          userQuery: JSON.stringify(messages),
          apiResponse: { error: error?.message || '流式请求失败' },
          requestType: `streaming_chat_error_${type}`,
          duration: Date.now() - startTime,
        });
      } catch (logError) {
        this.logger.error(`记录错误日志失败，用户: ${userId}, 会话ID: ${sessionId}:`, logError?.stack || logError);
      }
      
      throw new Error(`AI流式请求失败: ${error?.message || '未知错误'}`);
    }
  }

  // 新增：非流式聊天完成方法
  private async chatCompletion(userId: string, messages: ChatCompletionMessageParam[], type: string) {
    const sessionId = randomUUID();
    const startTime = Date.now();

    try {
      this.logger.log(`开始为用户 ${userId} 创建OpenAI非流式请求，会话ID: ${sessionId}, 类型: ${type}`);

      // 创建OpenAI非流式请求
      const response = await this.OpenAI.chat.completions.create({
        model: "ark-deepseek-v3-250324",
        messages: messages,
        stream: false,
        max_tokens: 2000,
        temperature: 0.7,
      });

      this.logger.log(`用户 ${userId} 的OpenAI非流式请求完成，会话ID: ${sessionId}`);

      const fullResponse = response.choices[0]?.message?.content || '';
      
      this.logger.log(`用户 ${userId} 的响应完成，会话ID: ${sessionId}，响应长度: ${fullResponse.length}`);

      // 异步记录日志
      this.createUserLog({
        userId,
        sessionId,
        userQuery: JSON.stringify(messages),
        apiResponse: { content: fullResponse },
        requestType: type,
        tokenUsed: response.usage?.total_tokens || fullResponse.length,
        duration: Date.now() - startTime,
      }).catch(error => {
        this.logger.error(`异步记录日志失败，用户: ${userId}, 会话ID: ${sessionId}:`, error?.stack || error);
      });

      return fullResponse;

    } catch (error) {
      this.logger.error(`用户 ${userId} 非流式聊天完成时发生错误，会话ID: ${sessionId}:`, error?.stack || error);
      
      // 记录失败的请求
      try {
        await this.createUserLog({
          userId,
          sessionId,
          userQuery: JSON.stringify(messages),
          apiResponse: { error: error?.message || '非流式请求失败' },
          requestType: `chat_error_${type}`,
          duration: Date.now() - startTime,
        });
      } catch (logError) {
        this.logger.error(`记录错误日志失败，用户: ${userId}, 会话ID: ${sessionId}:`, logError?.stack || logError);
      }
      
      throw new Error(`AI请求失败: ${error?.message || '未知错误'}`);
    }
  }

  // 重构后的流式处理方法
  async *createStreamingSession(userId: string, question: string, type: string) {
    this.logger.log(`用户 ${userId} 开始创建流式会话，问题: ${question.substring(0, 100)}${question.length > 100 ? '...' : ''}`);

    try {
      // 1. check daily limit
      const isDailyLimit = await this.checkDailyLimit(userId);
      if (!isDailyLimit) {
        this.logger.warn(`用户 ${userId} 已达到每日限制`);
        throw new Error('每日使用次数已达上限');
      }

      // 2. 构建messages格式
      const messages: ChatCompletionMessageParam[] = [{ role: "user", content: question }];

      // 3. 调用核心流式处理方法
      yield* this.streamChatCompletion(userId, messages, type);
    } catch (error) {
      this.logger.error(`用户 ${userId} 创建流式会话失败:`, error?.stack || error);
      throw error;
    }
  }

  // 兼容性方法 - 保持旧接口
  createSession(userId: string, question: string) {
    // 这个方法现在返回generator
    return this.createStreamingSession(userId, question, 'CHAT');
  }

  async *assistantQuestion(userId: string, question: string) {
    this.logger.log(`用户 ${userId} 开始助理问题会话，问题: ${question.substring(0, 100)}${question.length > 100 ? '...' : ''}`);

    try {
      // 1. check daily limit
      const isDailyLimit = await this.checkDailyLimit(userId);
      if (!isDailyLimit) {
        this.logger.warn(`用户 ${userId} 已达到每日限制（助理问题）`);
        throw new Error('每日使用次数已达上限');
      }
      
      const message: ChatCompletionMessageParam[] = [{
        role: 'system',
        content: '你接下来需要为用户的部分题目基于关键性提示，基于用于足以解决问题但是不至于直接给出答案，用户会给出你对应的问题'
      }, {
        role: 'user',
        content: '请你基于为足够的提示，问题为：'+question
      }]
      
      // 3. 调用核心流式处理方法
      yield* this.streamChatCompletion(userId, message, 'ASSISTANT_QUESTION');
    } catch (error) {
      this.logger.error(`用户 ${userId} 助理问题会话失败:`, error?.stack || error);
      throw error;
    }
  }

  async *assistantError(userId: string, question: string, errorMsg: string) {
    this.logger.log(`用户 ${userId} 开始助理错误诊断会话，问题: ${question.substring(0, 50)}${question.length > 50 ? '...' : ''}, 错误: ${errorMsg.substring(0, 50)}${errorMsg.length > 50 ? '...' : ''}`);

    try {
      // 1. check daily limit
      const isDailyLimit = await this.checkDailyLimit(userId);
      if (!isDailyLimit) {
        this.logger.warn(`用户 ${userId} 已达到每日限制（助理错误诊断）`);
        throw new Error('每日使用次数已达上限');
      }
      
      const message: ChatCompletionMessageParam[] = [{
        role: 'system',
        content: '你接下来需要为用户的错误提供诊断，给予用户指导帮助，整理思路，基于用于足以解决报错和问题但是不至于直接给出答案，用户会给出你对应的问题'
      }, {
        role: 'user',
        content: '请你基于为足够的提示，问题为：'+question + '，错误为：'+errorMsg
      }]
      
      // 3. 调用核心流式处理方法
      yield* this.streamChatCompletion(userId, message, 'ASSISTANT_ERROR');
    } catch (error) {
      this.logger.error(`用户 ${userId} 助理错误诊断会话失败:`, error?.stack || error);
      throw error;
    }
  }

  // 完成流处理后记录日志（保持兼容性）
  async logStreamCompletion(logData: {
    userId: string;
    sessionId: string;
    userQuery: JsonValue;
    startTime: number;
    fullResponse: string;
    totalTokens?: number;
  }) {
    const { userId, sessionId, userQuery, startTime, fullResponse, totalTokens } = logData;
    const duration = Date.now() - startTime;

    this.logger.log(`开始记录用户 ${userId} 流式完成日志，会话ID: ${sessionId}`);

    try {
      await this.createUserLog({
        userId,
        sessionId,
        userQuery,
        apiResponse: { content: fullResponse },
        requestType: 'chat_completion',
        tokenUsed: totalTokens || undefined,
        duration,
      });
      this.logger.log(`成功记录用户 ${userId} 流式完成日志，会话ID: ${sessionId}`);
    } catch (logError) {
      this.logger.error(`记录用户 ${userId} 流式完成日志失败，会话ID: ${sessionId}:`, logError?.stack || logError);
      throw new Error(`记录流式完成日志失败: ${logError?.message || '未知错误'}`);
    }
  }

  // 非流式方法
  async createSessionNonStreaming(userId: string, question: string) {
    this.logger.log(`用户 ${userId} 开始创建非流式会话，问题: ${question.substring(0, 100)}${question.length > 100 ? '...' : ''}`);

    try {
      // 1. check daily limit
      const isDailyLimit = await this.checkDailyLimit(userId);
      if (!isDailyLimit) {
        this.logger.warn(`用户 ${userId} 已达到每日限制（非流式）`);
        throw new Error('每日使用次数已达上限');
      }

      // 2. 构建messages格式
      const messages: ChatCompletionMessageParam[] = [{
        role: 'system',
        content: '你接下来需要为用户回答编程知识教育领域的内容，请根据用户的问题给出详细的回答。但是如果用户的问题不是编程知识教育领域的内容，请直接告诉用户，我们只提供编程知识教育领域的回答。'
      },{ role: "user", content: question }];

      // 3. 调用核心非流式处理方法
      const result = await this.chatCompletion(userId, messages, 'CHAT');
      this.logger.log(`用户 ${userId} 非流式会话完成`);
      return result;
    } catch (error) {
      this.logger.error(`用户 ${userId} 创建非流式会话失败:`, error?.stack || error);
      throw error;
    }
  }

  async assistantQuestionNonStreaming(userId: string, question: string) {
    this.logger.log(`用户 ${userId} 开始助理问题非流式会话，问题: ${question.substring(0, 100)}${question.length > 100 ? '...' : ''}`);

    try {
      // 1. check daily limit
      const isDailyLimit = await this.checkDailyLimit(userId);
      if (!isDailyLimit) {
        this.logger.warn(`用户 ${userId} 已达到每日限制（助理问题非流式）`);
        throw new Error('每日使用次数已达上限');
      }
      
      const message: ChatCompletionMessageParam[] = [{
        role: 'system',
        content: '你接下来需要为用户的部分题目基于关键性提示，基于用于足以解决问题但是不至于直接给出答案，用户会给出你对应的问题'
      }, {
        role: 'user',
        content: '请你基于为足够的提示，问题为：'+question
      }]
      
      // 3. 调用核心非流式处理方法
      const result = await this.chatCompletion(userId, message, 'ASSISTANT_QUESTION');
      this.logger.log(`用户 ${userId} 助理问题非流式会话完成`);
      return result;
    } catch (error) {
      this.logger.error(`用户 ${userId} 助理问题非流式会话失败:`, error?.stack || error);
      throw error;
    }
  }

  async assistantErrorNonStreaming(userId: string, question: string, errorMsg: string) {
    this.logger.log(`用户 ${userId} 开始助理错误诊断非流式会话，问题: ${question.substring(0, 50)}${question.length > 50 ? '...' : ''}, 错误: ${errorMsg.substring(0, 50)}${errorMsg.length > 50 ? '...' : ''}`);

    try {
      // 1. check daily limit
      const isDailyLimit = await this.checkDailyLimit(userId);
      if (!isDailyLimit) {
        this.logger.warn(`用户 ${userId} 已达到每日限制（助理错误诊断非流式）`);
        throw new Error('每日使用次数已达上限');
      }
      
      const message: ChatCompletionMessageParam[] = [{
        role: 'system',
        content: '你接下来需要为用户的错误提供诊断，给予用户指导帮助，整理思路，基于用于足以解决报错和问题但是不至于直接给出答案，用户会给出你对应的问题'
      }, {
        role: 'user',
        content: '请你基于为足够的提示，问题为：'+question + '，错误为：'+errorMsg
      }]
      
      // 3. 调用核心非流式处理方法
      const result = await this.chatCompletion(userId, message, 'ASSISTANT_ERROR');
      this.logger.log(`用户 ${userId} 助理错误诊断非流式会话完成`);
      return result;
    } catch (error) {
      this.logger.error(`用户 ${userId} 助理错误诊断非流式会话失败:`, error?.stack || error);
      throw error;
    }
  }
}