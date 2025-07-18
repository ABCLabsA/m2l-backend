import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto, TokenInfo } from '../dto/auth.dto';
import { ApiResponse, ApiResponseUtil } from '../common/interfaces/api-response.interface';
import { Public } from 'src/decorators/public.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: '用户登录', description: '通过钱包地址登录系统' })
  @ApiBody({ type: LoginDto })
  @SwaggerApiResponse({ status: 200, description: '登录成功', type: TokenInfo })
  @SwaggerApiResponse({ status: 400, description: '登录失败' })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<TokenInfo>> {
    try {
      const tokenInfo = await this.authService.login(loginDto);
      return ApiResponseUtil.success(tokenInfo);
    } catch (error) {
      return ApiResponseUtil.error(400, error.message);
    }
  }

} 