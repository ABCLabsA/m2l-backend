import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompileDto {
  @ApiProperty({ 
    description: 'Move 代码', 
    example: 'module playground::hello {\n    public fun hello() {\n        // Your Move code here\n    }\n}' 
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class CompileResponse {
  success: boolean;
  output?: string;
  error?: string;
} 