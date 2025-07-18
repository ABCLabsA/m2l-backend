import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 检查点选项DTO
export class CheckpointOptionDto {
    @ApiProperty({ description: '选项ID' })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: '选项内容' })
    @IsString()
    @IsNotEmpty()
    option: string;

    @ApiProperty({ description: '是否为正确答案' })
    @IsBoolean()
    isCorrect: boolean;
}

// 检查点详情DTO
export class CheckpointDto {
    @ApiProperty({ description: '检查点ID' })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: '章节ID', required: false })
    @IsString()
    @IsOptional()
    chapterId?: string;

    @ApiProperty({ description: '检查点类型', enum: ['choice', 'fill', 'code'] })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: '问题内容' })
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty({ description: '答案' })
    @IsString()
    @IsNotEmpty()
    answer: string;

    @ApiProperty({ description: '选项列表', type: [CheckpointOptionDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CheckpointOptionDto)
    @IsOptional()
    options?: CheckpointOptionDto[];

    @ApiProperty({ description: '基础代码' })
    @IsString()
    @IsNotEmpty()
    baseCode: string;

    @ApiProperty({ description: '创建时间' })
    createdAt: Date;

    @ApiProperty({ description: '更新时间' })
    updatedAt: Date;
}

// 创建检查点DTO
export class CreateCheckpointDto {
    @ApiProperty({ description: '章节ID', required: false })
    @IsString()
    @IsOptional()
    chapterId?: string;

    @ApiProperty({ description: '检查点类型', enum: ['choice', 'fill', 'code'] })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: '问题内容' })
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty({ description: '答案' })
    @IsString()
    @IsNotEmpty()
    answer: string;

    @ApiProperty({ description: '选项列表', type: [String], required: false })
    @IsArray()
    @IsOptional()
    options?: string[];
}

// 更新检查点DTO
export class UpdateCheckpointDto {
    @ApiProperty({ description: '章节ID', required: false })
    @IsString()
    @IsOptional()
    chapterId?: string;

    @ApiProperty({ description: '检查点类型', required: false })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiProperty({ description: '问题内容', required: false })
    @IsString()
    @IsOptional()
    question?: string;

    @ApiProperty({ description: '答案', required: false })
    @IsString()
    @IsOptional()
    answer?: string;

    @ApiProperty({ description: '选项列表', required: false })
    @IsArray()
    @IsOptional()
    options?: string[];
}

// 提交检查点答案DTO
export class SubmitCheckpointAnswerDto {
    @ApiProperty({ description: '检查点ID' })
    @IsString()
    @IsNotEmpty()
    checkpointId: string;

    @ApiProperty({ description: '用户答案' })
    @IsString()
    @IsNotEmpty()
    answer: string;
}

// 检查点结果DTO
export class CheckpointResultDto {
    @ApiProperty({ description: '是否正确' })
    @IsBoolean()
    isCorrect: boolean;

    @ApiProperty({ description: '正确答案' })
    @IsString()
    correctAnswer: string;

    @ApiProperty({ description: '是否已通过此检查点' })
    @IsBoolean()
    hasPassed: boolean;
}

// 用户检查点通过记录DTO
export class UserCheckpointPassDto {
    @ApiProperty({ description: 'ID' })
    @IsString()
    id: string;

    @ApiProperty({ description: '用户ID' })
    @IsString()
    userId: string;

    @ApiProperty({ description: '检查点ID' })
    @IsString()
    checkpointId: string;

    @ApiProperty({ description: '是否通过' })
    @IsBoolean()
    passed: boolean;

    @ApiProperty({ description: '通过时间', required: false })
    @IsOptional()
    passedAt?: Date;

    @ApiProperty({ description: '创建时间' })
    createdAt: Date;

    @ApiProperty({ description: '更新时间' })
    updatedAt: Date;
}

// 用户检查点日志DTO
export class UserCheckpointLogDto {
    @ApiProperty({ description: 'ID' })
    @IsString()
    id: string;

    @ApiProperty({ description: '用户ID' })
    @IsString()
    userId: string;

    @ApiProperty({ description: '检查点ID' })
    @IsString()
    checkpointId: string;

    @ApiProperty({ description: '用户答案', required: false })
    @IsString()
    @IsOptional()
    answer?: string;

    @ApiProperty({ description: '是否正确' })
    @IsBoolean()
    isCorrect: boolean;

    @ApiProperty({ description: '创建时间' })
    createdAt: Date;
} 