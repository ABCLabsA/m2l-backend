import { Injectable } from '@nestjs/common';
import { AptosService } from './aptos.service';

export interface CertificateResult {
  success: boolean;
  message: string;
  transactionHash: string;
}

@Injectable()
export class CertificateIntegrationService {
  constructor(private readonly aptosService: AptosService) {}

} 