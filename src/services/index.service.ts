import { Injectable } from "@nestjs/common";
import { AptosService } from "./aptos.service";
import { PrismaService } from "./prisma.service";
import { CourseBadgeResponseDto } from "src/dto/index.dto";

@Injectable()
export class IndexService {
    constructor(
        private readonly aptosService: AptosService,
        private readonly prismaService: PrismaService
    ) { }

    async courseBadge(userId: string): Promise<CourseBadgeResponseDto[]> {
        const courseBadgeUrls = await this.prismaService.course.findMany({
            select: {
                title: true,
                badge: true
            },
            where: {
                courseBuy: {
                    some: {
                        userId: userId,
                        isFinished: true,
                    }
                }
            }
        })
        return courseBadgeUrls.filter((item): item is { badge: string, title: string } => item.badge !== null).map(item => {
            return {
                badge: item.badge,
                courseName: item.title
            }
        })
    }
}