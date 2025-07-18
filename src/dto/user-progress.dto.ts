import { ApiProperty } from '@nestjs/swagger';
import { ChapterDto } from './chapter.dto';

export class UserProgressDto {
  @ApiProperty({ description: '进度ID' })
  id: string;

  @ApiProperty({ description: '用户ID' })
  userId: string;

  @ApiProperty({ description: '课程ID' })
  courseId: string;

  @ApiProperty({ description: '章节ID' })
  chapterId: string;

  @ApiProperty({ description: '是否完成' })
  completed: boolean;

  @ApiProperty({ description: '完成时间', required: false })
  completedAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '章节信息', type: () => ChapterDto, required: false })
  chapter?: ChapterDto;
} 