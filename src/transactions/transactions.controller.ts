import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { DepositDto } from './dto/deposit.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransferDto } from './dto/transfer.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth('jwt-auth')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit money into a specific account' })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  deposit(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: DepositDto,
  ) {
    return this.transactionsService.deposit(currentUser, dto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw money from a specific account' })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  @ApiBadRequestResponse({ description: 'Insufficient balance or invalid amount.' })
  withdraw(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: WithdrawDto,
  ) {
    return this.transactionsService.withdraw(currentUser, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer money between two accounts' })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid transfer request, unsupported currency, or insufficient balance.',
  })
  transfer(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: TransferDto,
  ) {
    return this.transactionsService.transfer(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions visible to the authenticated user' })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  findAll(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.transactionsService.findAll(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific transaction by ID' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction not found.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.transactionsService.findOne(id, currentUser);
  }
}
