import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class LoginDto {
  @ApiProperty({ 
    description: '钱包地址', 
    example: '0x1234567890abcdef1234567890abcdef12345678' 
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

export class TokenInfo {
  @ApiProperty({ description: 'JWT token' })
  token: string;

  @ApiProperty({ description: '用户信息', type: UserDto })
  user: UserDto;
} 