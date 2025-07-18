import { Injectable } from '@nestjs/common';
import { Account, AccountAuthenticator, Aptos, AptosConfig, CommittedTransactionResponse, Ed25519PrivateKey, MultiAgentTransaction, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";
import { PrismaService } from './prisma.service';
import { generateSnowflake } from '@burakbey/snowflake';
import { SignRequestDto } from 'src/dto/course-completion.dto';

@Injectable()
export class AptosService {

  private readonly adminPrivateKey: string;

  private readonly snowflake;
  constructor(private readonly prismaService: PrismaService) {
    this.snowflake = generateSnowflake({
      epoch: new Date('2020-01-01T00:00:00.000Z').getTime(),
      machineIdBitAmount: 10,
      sequenceNumberBitAmount: 12
    })
    this.snowflake.setMachineId(1);
    this.adminPrivateKey = process.env.APTOS_ADMIN_PRIVATE_KEY || '';
  }


  /**
   * 格式化 Aptos 地址为 64 字符长度
   * @param address 原始地址
   * @returns 格式化后的地址
   */
  private formatAptosAddress(address: string): string {
    if (!address) return '';

    // 移除 0x 前缀（如果存在）
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;

    // 填充到 64 字符并添加 0x 前缀
    return '0x' + cleanAddress.padStart(64, '0');
  }

  generateNonce(): string {
    return this.snowflake.generate().toString();
  }

  generatePublicKey(body: SignRequestDto, nonce: string): number[] {
    // 根据合约的verify_admin_signature函数，只对course_id进行签名
    const message = this.stringToBytes(`${body.courseId}_${nonce}`);

    // 使用私钥签名
    const privateKey = new Ed25519PrivateKey(
        PrivateKey.formatPrivateKey(this.adminPrivateKey, PrivateKeyVariants.Ed25519)
    );
    const signature = privateKey.sign(message);

    // 返回签名字节数组（number[]而不是string[]）
    return Array.from(signature.toUint8Array());
  }
  // 辅助函数
  private addressToBytes(address: string): Uint8Array {
    // 移除 0x 前缀并转换为字节数组
    const hex = address.startsWith('0x') ? address.slice(2) : address;
    return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  }

  private stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  private u64ToBytes(num: number): Uint8Array {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(num), true);
    return new Uint8Array(buffer);
  }
} 