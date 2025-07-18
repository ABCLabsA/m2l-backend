import { Injectable } from '@nestjs/common';
import { CompileDto, CompileResponse } from 'src/dto/move.dto';
import { ApiResponse, ApiResponseUtil } from 'src/common/interfaces/api-response.interface';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface MoveCommandInput{
  command: string;
  args?: string[];
  timeout: number;
}

@Injectable()
export class MoveService {
  constructor() { }

  private async createProjectAndRunCommand(code: CompileDto, inputs: MoveCommandInput[]): Promise<ApiResponse<CompileResponse>> {
    // 创建临时目录
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aptos-playground-'));
    try {
      // 检查代码是否为空
      if (!code.code || code.code.trim() === '') {
        return ApiResponseUtil.error(
          400,
          '代码不能为空',
          {
            success: false,
            error: '请提供代码'
          }
        );
      }

      // 检查 Aptos CLI
      const hasAptosCli = await this.checkAptosCli();
      if (!hasAptosCli) {
        return ApiResponseUtil.error(
          500,
          '未检测到 Aptos CLI。请确保已安装 Aptos 并添加到系统 PATH 中。\n\n安装步骤：\n1. 访问 https://aptos.dev/tools/aptos-cli/install-cli/\n2. 按照说明安装 Aptos CLI\n3. 确保 aptos 命令可在终端中运行',
          {
            success: false,
            error: '未检测到 Aptos CLI。请确保已安装 Aptos 并添加到系统 PATH 中。\n\n安装步骤：\n1. 访问 https://aptos.dev/tools/aptos-cli/install-cli/\n2. 按照说明安装 Aptos CLI\n3. 确保 aptos 命令可在终端中运行'
          }
        );
      }
      try {
        // 初始化 Move 项目
        const initResult = await this.runCommand('aptos', ['move', 'init', '--name', 'playground'], tempDir, 30000);
        if (!initResult.success) {
          return ApiResponseUtil.error(
            500,
            `初始化 Move 项目失败: ${initResult.output}`,
            {
              success: false,
              error: '初始化 Move 项目失败'
            }
          );
        }

        // 创建 sources 目录并写入源代码
        const sourcesDir = path.join(tempDir, 'sources');
        if (!fs.existsSync(sourcesDir)) {
          fs.mkdirSync(sourcesDir, { recursive: true });
        }
        const sourceFile = path.join(sourcesDir, 'hello.move');
        fs.writeFileSync(sourceFile, code.code);

      } catch (error) {
        return ApiResponseUtil.error(
          500,
          `创建项目失败: ${error.message}`,
          {
            success: false,
            error: '创建项目失败'
          }
        );
      }
      const compileResult = {
        success: true,
        output: '',
        error: ''
      }

      // 执行编译命令
      for (const input of inputs) {
        const { command, args } = this.parseCommand(input);
        const commandResult = await this.runCommand(command, args, tempDir, input.timeout);
        console.log("commandResult", input, commandResult);
        if (!commandResult.success) {
          compileResult.success = false;
          compileResult.error = commandResult.output;
          break;
        } else {
          compileResult.output = compileResult.output ? compileResult.output + "\n" + commandResult.output : commandResult.output;
        }
      }
      return ApiResponseUtil.success({
        success: compileResult.success,
        output: compileResult.success ? compileResult.output : undefined,
        error: !compileResult.success ? compileResult.error : undefined
      });
    } finally {
      // 清理临时文件
      this.deleteRecursively(tempDir);
    }
  }


async interactWithMoveProject(code: CompileDto, commands: string[]) {
  return this.createProjectAndRunCommand(code, commands.map(command => ({
    command: command,
    timeout: 30000
  })))
}

  async compile(code: CompileDto): Promise<ApiResponse<CompileResponse>> {
    return this.createProjectAndRunCommand(code, [{
      command: 'aptos move compile',
      timeout: 30000
    }])
  }

  async runTest(code: CompileDto): Promise<ApiResponse<CompileResponse>> {
    return this.createProjectAndRunCommand(code, [{
      command: 'aptos move test',
      timeout: 30000
    }])
  }

  async compileWithString(code: CompileDto): Promise<ApiResponse<CompileResponse>> {
    return this.createProjectAndRunCommand(code, [{
      command: 'aptos move compile',
      timeout: 30000
    }])
  }

  async runTestWithString(code: CompileDto): Promise<ApiResponse<CompileResponse>> {
    return this.createProjectAndRunCommand(code, [{
      command: 'aptos move test',
      timeout: 30000
    }])
  }

  async runCustomCommand(code: CompileDto, commandString: string, timeout: number = 30000): Promise<ApiResponse<CompileResponse>> {
    return this.createProjectAndRunCommand(code, [{
      command: commandString,
      timeout: timeout
    }])
  }

  private parseCommand(input: MoveCommandInput): { command: string; args: string[] } {
    if (input.args) {
      // 使用原有的分离式格式
      return { command: input.command, args: input.args };
    } else {
      // 解析单字符串命令
      const parts = input.command.trim().split(/\s+/);
      const command = parts[0];
      const args = parts.slice(1);
      return { command, args };
    }
  }

  private async checkAptosCli(): Promise<boolean> {
    try {
      const result = await this.runCommand('aptos', ['--version'], process.cwd(), 10000);
      return result.success;
    } catch (error) {
      return false;
    }
  }
  private runCommand(command: string, args: string[], cwd: string, timeout: number = 30000): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        cwd,
        stdio: 'pipe'
      });

      let output = '';
      let timeoutId: NodeJS.Timeout;

      // 设置超时
      timeoutId = setTimeout(() => {
        process.kill();
        resolve({
          success: false,
          output: '命令执行超时'
        });
      }, timeout);

      // 收集输出
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        output += data.toString();
      });

      // 处理进程结束
      process.on('close', (code) => {
        clearTimeout(timeoutId);
        resolve({
          success: code === 0,
          output: output.trim()
        });
      });

      // 处理错误
      process.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          output: error.message
        });
      });
    });
  }


  private deleteRecursively(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`清理临时目录失败: ${error.message}`);
    }
  }
}