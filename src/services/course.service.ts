import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CourseDetailDto, CourseDto } from '../dto/course.dto';
import { ChapterDto } from '../dto/chapter.dto';
import { CourseTypeDto } from '../dto/shared.dto';
import { UserCourseBuyDto } from '../dto/user-course-buy.dto';
import { UserProgressDto } from 'src/dto/user-progress.dto';
import { UserCourseBuy } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private readonly prismaService: PrismaService) { }

  async checkCourseExist(id: string): Promise<boolean> {
    const course = await this.prismaService.course.findUnique({
      where: { id }
    });
    return course !== null;
  }

  async checkCourseFinished(courseId: string, userId: string): Promise<boolean> {
    const course = await this.prismaService.course.findUnique({
      where: { id: courseId },
      include: {
        courseBuy: {
          where: {
            userId: userId
          }
        }
      }
    });
    if (!course) {
      return false;
    }
    return course.courseBuy.find((buy) => buy.userId === userId)?.isFinished || false;
  }

  async getCourseList(typeId?: string, userId?: string): Promise<CourseDto[]> {
    const courses = await this.prismaService.course.findMany({
      where: {
        typeId: (typeId ? typeId : undefined)
      },
      include: {
        type: true,
        courseBuy: {
          where: {
            userId: userId
          }
        },
      }
    });
    return courses.map((course) => this.transformCourse(course, userId));
  }

  async getCourseDetail(id: string, userId?: string): Promise<CourseDetailDto | null> {
    const course = await this.prismaService.course.findUnique({
      where: { id },
      include: {
        type: true,
        
        courseBuy: {
          where: {
            userId: userId
          }
        },
        chapters: {
          orderBy: {
            order: 'asc'
          },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            courseId: true,
            nextChapterId: true,
            createdAt: true,
            updatedAt: true,
            type: true,
            userProgress: {
              where: {
                userId: userId
              }
            },
          }
        }
      }
    });
    return this.transformCourseDetail(course, userId);
  }

  async buyCourse(userId: string, courseId: string) {
    return this.prismaService.userCourseBuy.create({
      data: {
        userId,
        courseId,
        createAt: new Date(),
        isFinished: false,
        certificateGet: false,
      },
    });
  }

  async getPrivateCourseList(userId: string): Promise<CourseDto[]> {
    const courses = await this.prismaService.course.findMany({
      where: {
        courseBuy: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        type: true,
        courseBuy: {
          where: {
            userId: userId
          }
        },
        chapters: {
          orderBy: {
            order: 'asc'
          },
          include: {
            userProgress: {
              where: {
                userId: userId
              }
            }
          }
        }
      },
    });
    const res = courses.map((course) => this.transformCourse(course, userId));
    console.dir(res, { depth: null });
    return res;
  }

  async getCourseTypeList(): Promise<CourseTypeDto[]> {
    const courseTypes = await this.prismaService.courseType.findMany();
    return courseTypes.map(this.transformCourseType);
  }

  async getCourseType(id: string) {
    return this.prismaService.courseType.findUnique({ where: { id } });
  }

  async checkCertificateIssued(courseId: string, userId: string): Promise<boolean> {
    const course = await this.prismaService.userCourseBuy.findUnique({ where: { id: courseId, userId: userId } });
    return course?.certificateGet || false;
  }


  async updateIssuedCertificateStatus(courseId: string, userId: string) {
    return this.prismaService.userCourseBuy.update({
      where: { userId_courseId: { userId: userId, courseId: courseId } },
      data: { certificateGet: true }
    });
  }

  private transformCourse = (course: any, userId?: string): CourseDto => {
    const isBought = userId && course.courseBuy ? course.courseBuy.some((buy: any) => buy.userId === userId) : false;
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      image: course.image || undefined,
      badge: course.badge || undefined,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      price: Number(course.price),
      finishReward: Number(course.finishReward),
      typeId: course.typeId || undefined,
      type: course.type ? this.transformCourseType(course.type) : undefined,
      chapters: course.chapters ? course.chapters.map(this.transformChapter) : undefined,
      totalChapterLength: course.chapters ? course.chapters.length : undefined,
      learnedChapterLength: course.chapters ? course.chapters.filter((chapter) => chapter.userProgress && chapter.userProgress.length > 0).length : undefined,
      certificateIssued: course.courseBuy.find((buy) => buy.userId === userId)?.certificateGet|| false,
      userBrought: isBought,
    };
  };

  private transformCourseDetail = (course: any, userId?: string): CourseDetailDto => {
    return {
      ...this.transformCourse(course, userId),
      userProgress: course.chapters ? course.chapters.map((chapter) => this.transformUserProgress(chapter.userProgress)) : undefined,
      isFinished: course.courseBuy.isFinished,
    };
  };

  private transformCourseType = (courseType: any): CourseTypeDto => {
    return {
      id: courseType.id,
      name: courseType.name,
      description: courseType.description || undefined,
    };
  };

  private transformChapter = (chapter: any): ChapterDto => {
    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      content: chapter.content || undefined,
      order: chapter.order,
      courseId: chapter.courseId,
      nextChapterId: chapter.nextChapterId || undefined,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      type: chapter.type || undefined,
      progress: chapter.userProgress && chapter.userProgress.length > 0 ? this.transformUserProgress(chapter.userProgress[0]) : undefined,
    };
  };
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
    };
  }


  private transformUserCourseBuy = (userCourseBuy: UserCourseBuy[], userId?: string): UserCourseBuyDto => {
    const res = userCourseBuy.find((buy) => buy.userId === userId);
    if (!res) {
      return {
        id: '',
        courseId: '',
        userId: '',
        createAt: new Date(),
        isFinished: false,
      };
    }
    return {
      id: res.id,
      courseId: res.courseId,
      userId: res.userId,
      createAt: res.createAt,
      isFinished: res.isFinished
    };
  };
}