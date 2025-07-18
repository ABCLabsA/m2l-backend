import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '最后登录时间' })
  lastLogin: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '链ID' })
  chainId: number;

  @ApiProperty({ description: '首次登录时间' })
  firstLogin: Date;

  @ApiProperty({ description: '是否已初始化' })
  isInitialized: boolean;

  @ApiProperty({ description: '配置文件ID', required: false })
  profileId?: string;

  @ApiProperty({ description: '钱包地址' })
  walletAddress: string;

  @ApiProperty({ description: '购买的课程', required: false })
  courseBuy?: UserCourseBuyDto[];
}

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
} 