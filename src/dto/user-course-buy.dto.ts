import { ApiProperty } from '@nestjs/swagger';
import { BaseCourseDto } from './shared.dto';

export class UserCourseBuyDto {
  @ApiProperty({ description: '购买记录ID' })
  id: string;

  @ApiProperty({ description: '课程ID' })
  courseId: string;

  @ApiProperty({ description: '用户ID' })
  userId: string;

  @ApiProperty({ description: '购买时间' })
  createAt: Date;

  @ApiProperty({ description: '是否完成' })
  isFinished: boolean;

  @ApiProperty({ description: '课程信息', required: false })
  course?: BaseCourseDto;
} 