import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({ description: '章节ID' })
  @IsString()
  @IsNotEmpty()
  chapterId: string;

  @ApiProperty({ description: '课程ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;
} 