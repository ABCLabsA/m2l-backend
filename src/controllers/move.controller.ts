import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBody } from '@nestjs/swagger';
import { MoveService } from '../services/move.service';

import { ApiResponse } from '../common/interfaces/api-response.interface';
import { CompileDto, CompileResponse } from '../dto/move.dto';

@ApiTags('move')
@Controller('api/move')
export class MoveController {
  constructor(private readonly moveService: MoveService) {}

  @Post('compile')
  @ApiOperation({ summary: '编译 Move 代码', description: '编译用户提交的 Move 代码' })
  @ApiBody({ type: CompileDto })
  @SwaggerApiResponse({ status: 200, description: '编译完成（成功或失败）', type: CompileResponse })
  @SwaggerApiResponse({ status: 400, description: '请求参数错误' })
  @SwaggerApiResponse({ status: 500, description: '服务器内部错误' })
  async compile(@Body() compileDto: CompileDto): Promise<CompileResponse> {
    return this.moveService.compile(compileDto);
  }
} 