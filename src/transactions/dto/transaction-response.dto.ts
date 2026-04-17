import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from '@prisma/client';

// DTO ini menjelaskan bentuk riwayat transaksi yang dikirim ke client.
export class TransactionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'TXN-1712345678901-AB12CD' })
  reference: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.TRANSFER })
  transactionType: TransactionType;

  @ApiProperty({ enum: TransactionStatus, example: TransactionStatus.COMPLETED })
  status: TransactionStatus;

  @ApiProperty({ example: 125000 })
  amount: number;

  // adminFee dipakai terutama pada transfer agar user tahu total biaya tambahan.
  @ApiProperty({ example: 2000 })
  adminFee: number;

  @ApiProperty({ example: 'Bayar kebutuhan bulanan', nullable: true })
  description: string | null;

  // performedById menunjukkan user yang memicu transaksi ini.
  @ApiProperty({ example: 1 })
  performedById: number;

  @ApiProperty({ example: 1, nullable: true })
  sourceAccountId: number | null;

  @ApiProperty({ example: 2, nullable: true })
  destinationAccountId: number | null;

  @ApiProperty({ example: '102345678901', nullable: true })
  sourceAccountNumber: string | null;

  @ApiProperty({ example: '109876543210', nullable: true })
  destinationAccountNumber: string | null;

  // Timestamp membantu membaca urutan histori transaksi.
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
