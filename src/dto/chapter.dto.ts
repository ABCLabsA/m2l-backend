import { ApiProperty } from '@nestjs/swagger';
import { BaseCourseDto } from './shared.dto';
import { UserProgressDto } from './user-progress.dto';
import { CheckpointDto } from './checkpoint.dto';

export class ChapterDto {
  @ApiProperty({ description: '章节ID' })
  id: string;

  @ApiProperty({ description: '章节标题' })
  title: string;

  @ApiProperty({ description: '章节描述' })
  description: string;

  @ApiProperty({ description: '章节内容', required: false })
  content?: string;

  @ApiProperty({ description: '章节顺序' })
  order: number;

  @ApiProperty({ description: '课程ID' })
  courseId: string;

  @ApiProperty({ description: '所属课程', required: false })
  course?: BaseCourseDto;

  @ApiProperty({ description: '下一章节ID', required: false })
  nextChapterId?: string;

  @ApiProperty({ description: '下一章节', type: () => ChapterDto, required: false })
  nextChapter?: ChapterDto;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '章节类型', required: false })
  type?: string;

  @ApiProperty({ description: '用户进度', required: false })
  progress?: UserProgressDto;

  @ApiProperty({ description: '检查点', required: false })
  checkPoints?: CheckpointDto[];
} 