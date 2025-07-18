import { ApiProperty } from '@nestjs/swagger';

export class CourseTypeDto {
  @ApiProperty({ description: '类型ID' })
  id: string;

  @ApiProperty({ description: '类型名称' })
  name: string;

  @ApiProperty({ description: '类型描述', required: false })
  description?: string;
}

export class BaseCourseDto {
  @ApiProperty({ description: '课程ID' })
  id: string;

  @ApiProperty({ description: '课程标题' })
  title: string;

  @ApiProperty({ description: '课程描述' })
  description: string;

  @ApiProperty({ description: '课程图片', required: false })
  image?: string;

  @ApiProperty({ description: '课程徽章图片', required: false })
  badge?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '课程价格' })
  price: number;

  @ApiProperty({ description: '完成奖励' })
  finishReward: number;

  @ApiProperty({ description: '课程类型ID', required: false })
  typeId?: string;

  @ApiProperty({ description: '课程类型', required: false })
  type?: CourseTypeDto;

  @ApiProperty({ description: '课程长度', required: false })
  courseLength?: number;

  @ApiProperty({ description: '用户进度长度', required: false })
  userProgressLength?: number;

  @ApiProperty({ description: '用户是否已购买', required: false })
  isBought?: boolean;

  @ApiProperty({ description: '证书是否已发放', required: false })
  certificateIssued?: boolean;
} 