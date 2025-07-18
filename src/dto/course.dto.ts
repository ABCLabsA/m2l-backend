import { ApiProperty } from '@nestjs/swagger';
import { ChapterDto } from './chapter.dto';
import { BaseCourseDto } from './shared.dto';
import { UserCourseBuyDto } from './user-course-buy.dto';
import { UserProgressDto } from './user-progress.dto';

export class CourseDto extends BaseCourseDto {
  @ApiProperty({ description: '章节列表', type: [ChapterDto], required: false })
  chapters?: ChapterDto[];

  @ApiProperty({ description: '用户是否已购买', required: false })
  userBrought?: boolean;

  @ApiProperty({ description: '总章节数', required: false })
  totalChapterLength: number;

  @ApiProperty({ description: '已学习章节数', required: false })
  learnedChapterLength: number;
}

export class CourseDetailDto extends CourseDto {
  @ApiProperty({ description: '用户进度', required: false })
  userProgress?: UserProgressDto[];

  @ApiProperty({ description: '用户是否已经完成课程', required: false })
  isFinished?: boolean;
}

export class CourseCertificateDto {
  @ApiProperty({ description: '课程ID' })
  courseId: string;

  @ApiProperty({ description: '用户地址' })
  userAddress: string;
}