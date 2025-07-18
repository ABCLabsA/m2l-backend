import { AccountAuthenticator, MultiAgentTransaction } from '@aptos-labs/ts-sdk';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CourseCertificateResponseDto {
  @ApiProperty({ description: '准备好的交易数据' })
  transactionPrepared: MultiAgentTransaction;

  @ApiProperty({ description: '管理员签名数据' })
  adminSigned: AccountAuthenticator;
} 


export class CourseCertificateRequestDto {
  @ApiProperty({ description: '课程ID' })
  @IsString({ message: 'courseId 必须是字符串' })
  @IsNotEmpty({ message: 'courseId 不能为空' })
  courseId: string;

  @ApiProperty({ description: '用户地址' })
  @IsString({ message: 'userAddress 必须是字符串' })
  @IsNotEmpty({ message: 'userAddress 不能为空' })
  userAddress: string;
}

export class SignRequestDto {
  @ApiProperty({ description: '用户地址' })
  @IsString({ message: 'userAddress 必须是字符串' })
  @IsNotEmpty({ message: 'userAddress 不能为空' })
  userAddress: string;

  @ApiProperty({ description: '课程ID' })
  @IsString({ message: 'courseId 必须是字符串' })
  @IsNotEmpty({ message: 'courseId 不能为空' })
  courseId: string;

  @ApiProperty({ description: '积分' })
  @IsNotEmpty({ message: 'points 不能为空' })
  points: number;
}

export class AdminSignTransactionDto {
  @ApiProperty({ description: '管理员签名数据' })
  @IsString({ message: 'userAddress 必须是字符串' })
  @IsNotEmpty({ message: 'userAddress 不能为空' })
  transaction: MultiAgentTransaction;
}

export class AdminSignResponseDto {
  @ApiProperty({ description: 'nonce' })
  nonce: string;

  @ApiProperty({ description: 'publicKey' })
  publicKey: number[];
} 

export class UpatdeCertificateDto {
  @ApiProperty({ description: 'courseId' })
  @IsString({ message: 'courseId 必须是字符串' })
  @IsNotEmpty({ message: 'courseId 不能为空' })
  courseId: string;
}
