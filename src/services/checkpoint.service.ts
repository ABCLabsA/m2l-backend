import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { MoveService } from "./move.service";

@Injectable()
export class CheckpointService {
  constructor(private readonly prismaService: PrismaService, private readonly moveService: MoveService) {}

  async getCheckpointList(chapterId: string) {
    const checkpoints = await this.prismaService.checkPoint.findMany({
      where: {
        chapterId: chapterId,
      }
    });
    return checkpoints;
  }

  async addLog(userId: string, checkpointId: string, content: string, isCorrect: boolean) {
    const log = await this.prismaService.userCheckPointLog.create({
      data: {
        userId: userId,
        checkPointId: checkpointId,
        answer: content,
        isCorrect: isCorrect,
      },
    });
    return log;
  }


  async checkUserPassCheckpoint(userId: string, chapterId: string): Promise<boolean> {
    const checkpoint = await this.prismaService.userCheckPointProgress.findFirst({
      where: {
        userId: userId,
        checkPoint: {
          chapterId: chapterId,
        },
        completed: true,
      },
    });
    console.log("checkpoint", checkpoint);
    return checkpoint ? true : false;
  }

  async userPassCheckpoint(userId: string, checkPointId: string) {
    // 先检查这个特定的检查点是否已经通过
    const existingProgress = await this.prismaService.userCheckPointProgress.findUnique({
      where: {
        userId_checkPointId: {
          userId: userId,
          checkPointId: checkPointId,
        },
      },
    });
    
    if (existingProgress && existingProgress.completed) {
      return;
    }
    
    // 使用upsert来避免唯一约束冲突，如果记录存在就更新，不存在就创建
    await this.prismaService.userCheckPointProgress.upsert({
      where: {
        userId_checkPointId: {
          userId: userId,
          checkPointId: checkPointId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId: userId,
        checkPointId: checkPointId,
        completed: true,
        completedAt: new Date(),
      },
    });
    return;
  }


  private async checkIsCorrect(checkpoint: any, content: string): Promise<{
    pass: boolean;
    output?: string;
  }> {
    // CODE判断逻辑
    if(checkpoint.type === "CODE") {
      // 如果有交互命令，则根据交互命令来判断
      if(checkpoint.interactiveCommand) {
        const commands = checkpoint.interactiveCommand.split(";");
        const result = await this.moveService.interactWithMoveProject({code: content}, commands);
        const expetcedOutputs = checkpoint.expectedOutput.split(";");
        const output = result.data?.success ? result.data?.output : result.data?.error;
        if(!output) {
          return {
            pass: false,
            output
          };
        }
        // output需要包含全部的expetcedOutputs，否则返回false
        for(let i = 0; i < expetcedOutputs.length; i++) {
          if(!output.includes(expetcedOutputs[i])) {
            return {
              pass: false,
              output: output,
            };
          }
        }
        return {
          pass: true,
          output: output,
        };
      } else {
        // 如归没有交互命令，则使用runTest来判断
        const result = await this.moveService.runTest({code: content});
        const expetcedOutputs = checkpoint.expectedOutput.split(";");
        const output = result.data?.success ? result.data?.output : result.data?.error;
        if(!output) {
          return {
            pass: false,
            output: output,
          };
        }
        // output需要包含全部的expetcedOutputs，否则返回false
        for(let i = 0; i < expetcedOutputs.length; i++) {
          if(!output.includes(expetcedOutputs[i])) {
            return {
              pass: false,
              output: output,
            };
          }
        }
        return {
          pass: true,
          output: result.data?.success ? output: result.data?.error,
        };
      }
    }
    else {
      // 选择题，直接判断答案是否正确
      return {
        pass: content === checkpoint.correctAnswer,
        output: content === checkpoint.correctAnswer ? content : undefined,
      };
    }
  }

  async userCommitCheckpoint(userId: string, checkPointId: string, content: string): Promise<UserCommitCheckpointResult> {
    // 首先，获取数据库中的checkpoint
    const checkpoint = await this.prismaService.checkPoint.findUnique({
      where: {
        id: checkPointId,
      },
    });
    if (!checkpoint) {
      throw new Error("Checkpoint not found");
    }

    // 检查是否已经通过
    const isPass = await this.checkUserPassCheckpoint(userId, checkpoint.chapterId);
    const {pass, output} = await this.checkIsCorrect(checkpoint, content);
    
    // 添加对用的log
    await this.addLog(userId, checkPointId, content, pass);
    if (pass) {
      await this.userPassCheckpoint(userId, checkPointId);
      return {
        isPass: isPass,
        isCorrect: pass,
        msg: this.generateCheckpointFeedback(pass, isPass),
        output: output,
      };
    }

    return {
      isPass: isPass,
      isCorrect: pass,
      msg: this.generateCheckpointFeedback(pass, isPass),
      output: output,
    };
  }
  generateCheckpointFeedback(isCorrect: boolean, isPass: boolean) {
    if(isCorrect && isPass) {
      return "你已经通过了该检查点，且答案正确";
    }
    if(!isCorrect && isPass) {
      return "你已经通过了该检查点，但答案不正确";
    }
    return "答案错误，请重新作答";
  }
}

interface UserCommitCheckpointResult {
  isPass: boolean;
  isCorrect: boolean;
  msg: string;
  output?: string;
}