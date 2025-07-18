import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UserProgressDto } from "../dto/user-progress.dto";
import { CertificateIntegrationService, CertificateResult } from "./certificate-integration.service";

@Injectable()
export class UserProgressService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly certificateIntegrationService: CertificateIntegrationService,
  ) {}

  async getProgressByCourseAndUser(courseId: string, userId: string): Promise<UserProgressDto> {
    const progress = await this.prismaService.userProgress.findFirst({
      where: {
        courseId,
        userId,
      },
      include: {
        chapter: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('进度记录未找到');
    }

    return this.transformUserProgress(progress);
  }

  async updateProgress(chapterId: string, courseId: string, userId: string): Promise<UserProgressDto> {
    const existingProgress = await this.prismaService.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    let progress;
    if (existingProgress) {
      // 更新现有进度
      progress = await this.prismaService.userProgress.update({
        where: {
          id: existingProgress.id,
        },
        data: {
          completed: true,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          chapter: true,
        },
      });
    } else {
      // 创建新的进度记录
      progress = await this.prismaService.userProgress.create({
        data: {
          chapterId,
          courseId,
          userId,
          completed: true,
          completedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          chapter: true,
        },
      });
    }

    return this.transformUserProgress(progress);
  }

  async finishCourseProgress(chapterId: string, courseId: string, userId: string): Promise<UserProgressDto> {
    // 更新章节进度
    const progress = await this.updateProgress(chapterId, courseId, userId);

    // 完成课程购买记录
    await this.prismaService.userCourseBuy.updateMany({
      where: {
        courseId,
        userId,
      },
      data: {
        isFinished: true,
      },
    });

    return progress;
  }

  private transformUserProgress = (userProgress: any): UserProgressDto => {
    return {
      id: userProgress.id,
      userId: userProgress.userId,
      courseId: userProgress.courseId,
      chapterId: userProgress.chapterId,
      completed: userProgress.completed,
      completedAt: userProgress.completedAt || undefined,
      createdAt: userProgress.createdAt,
      updatedAt: userProgress.updatedAt,
      chapter: userProgress.chapter ? {
        id: userProgress.chapter.id,
        title: userProgress.chapter.title,
        description: userProgress.chapter.description,
        content: userProgress.chapter.content || undefined,
        order: userProgress.chapter.order,
        courseId: userProgress.chapter.courseId,
        nextChapterId: userProgress.chapter.nextChapterId || undefined,
        createdAt: userProgress.chapter.createdAt,
        updatedAt: userProgress.chapter.updatedAt,
        type: userProgress.chapter.type || undefined,
      } : undefined,
    };
  };
}