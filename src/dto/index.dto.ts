import { ApiProperty } from "@nestjs/swagger"

export class CourseBadgeResponseDto {
    @ApiProperty({ description: '徽章图片' })
    badge: string
    @ApiProperty({ description: '课程名称' })
    courseName: string
}