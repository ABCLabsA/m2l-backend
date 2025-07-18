import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { LoginDto, TokenInfo } from '../dto/auth.dto';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenInfo> {
    const { walletAddress } = loginDto;

    // 查找或创建用户
    let user = await this.prismaService.users.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await this.prismaService.users.create({
        data: {
          walletAddress,
          chainId: 1, // 默认链ID
          firstLogin: new Date(),
          lastLogin: new Date(),
          isInitialized: false,
        },
      });
    } else {
      // 更新最后登录时间
      user = await this.prismaService.users.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    }

    // 生成 JWT token
    const payload = { sub: user.id, walletAddress: user.walletAddress };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        chainId: user.chainId,
        firstLogin: user.firstLogin,
        isInitialized: user.isInitialized,
        profileId: user.profileId || undefined,
      },
    };
  }

  async logout(): Promise<void> {
    // JWT 是无状态的，实际的登出可以通过前端删除token实现
    // 这里可以加入黑名单逻辑如果需要的话
    return;
  }

  async getUserInfo(userId: string): Promise<UserDto> {
    const user = await this.prismaService.users.findUnique({
      where: { id: userId },
      include: {
        courseBuy: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      profileId: user.profileId || undefined,
    };
  }

  async validateUser(payload: any): Promise<User> {
    const user = await this.prismaService.users.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      ...user,
      profileId: user.profileId ?? undefined // 将 null 转换为 undefined
    };
  }
} 