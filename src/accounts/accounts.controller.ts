import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
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
import { AccountResponseDto } from './dto/account-response.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountsService } from './accounts.service';

@ApiTags('Accounts')
@ApiBearerAuth('jwt-auth')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bank account for the authenticated user' })
  @ApiCreatedResponse({ type: AccountResponseDto })
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accountsService.createAccount(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all bank accounts visible to the authenticated user' })
  @ApiOkResponse({ type: AccountResponseDto, isArray: true })
  findAll(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.accountsService.findAll(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific bank account by ID' })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiNotFoundResponse({ description: 'Account not found.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.accountsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific bank account' })
  @ApiOkResponse({ type: AccountResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, currentUser, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific bank account' })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Account deleted successfully.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Account still has balance or transaction history.',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.accountsService.remove(id, currentUser);
  }
}
