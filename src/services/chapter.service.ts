import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ChapterDto } from '../dto/chapter.dto';
import { CheckpointDto } from 'src/dto/checkpoint.dto';

@Injectable()
export class ChapterService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllChapters(): Promise<ChapterDto[]> {
    const chapters = await this.prismaService.chapter.findMany({
      include: {
        course: true,
        nextChapter: true,
        userProgress: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    return chapters.map(this.transformChapter);
  }

  async getChapter(id: string): Promise<ChapterDto | null> {
    const chapter = await this.prismaService.chapter.findUnique({ 
      where: { id },
      include: {
        course: true,
        nextChapter: true,
        checkPoints: true,
        userProgress: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    return chapter ? this.transformChapter(chapter) : null;
  }

  async ableToAccessChapter(chapterId: string, userId: string): Promise<boolean> {
    const chapter = await this.prismaService.chapter.findUnique({
      where: { id: chapterId }
    });

    if (!chapter) {
      return false;
    }

    // 如果是第一章，直接允许访问
    if (chapter.order === 1) {
      return true;
    }

    // 检查用户是否完成了前一章
    const previousChapterProgress = await this.prismaService.userProgress.findFirst({
      where: {
        userId,
        courseId: chapter.courseId,
        chapter: {
          order: chapter.order - 1
        },
        completed: true
      }
    });

    if(!previousChapterProgress) {
      return false;
    }

    // 检查用户是否完成了前一章的检查点
    const previousChapterCheckpoints = await this.prismaService.userCheckPointProgress.findMany({
      where: {
        checkPoint: {
          chapterId: previousChapterProgress.chapterId
        },
        userId: userId,
        completed: true
      }
    });

    return !!previousChapterCheckpoints;
  }

  private transformChapter = (chapter: any): ChapterDto => {
    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      content: chapter.content || undefined,
      order: chapter.order,
      courseId: chapter.courseId,
      course: chapter.course ? {
        id: chapter.course.id,
        title: chapter.course.title,
        description: chapter.course.description,
        image: chapter.course.image || undefined,
        createdAt: chapter.course.createdAt,
        updatedAt: chapter.course.updatedAt,
        price: Number(chapter.course.price),
        finishReward: Number(chapter.course.finishReward),
        typeId: chapter.course.typeId || undefined
      } : undefined,
      nextChapterId: chapter.nextChapterId || undefined,
      nextChapter: chapter.nextChapter ? this.transformChapter(chapter.nextChapter) : undefined,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      type: chapter.type || undefined,
      progress: chapter.userProgress?.[0] ? {
        id: chapter.userProgress[0].id,
        userId: chapter.userProgress[0].userId,
        courseId: chapter.userProgress[0].courseId,
        chapterId: chapter.userProgress[0].chapterId,
        completed: chapter.userProgress[0].completed,
        completedAt: chapter.userProgress[0].completedAt || undefined,
        createdAt: chapter.userProgress[0].createdAt,
        updatedAt: chapter.userProgress[0].updatedAt
      } : undefined,
      checkPoints: chapter.checkPoints ? chapter.checkPoints.map(this.transformCheckPoint) : undefined
    };
  };

  private transformCheckPoint = (checkPoint: any): CheckpointDto => {
    return {
      id: checkPoint.id,
      chapterId: checkPoint.chapterId, 
      type: checkPoint.type,
      question: checkPoint.question,
      answer: checkPoint.answer,
      options: checkPoint.options,
      baseCode: checkPoint.baseCode,
      createdAt: checkPoint.createdAt,
      updatedAt: checkPoint.updatedAt
    };
  };
}