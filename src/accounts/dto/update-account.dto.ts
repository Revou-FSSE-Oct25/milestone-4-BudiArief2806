import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';

// PartialType membuat semua field dari CreateAccountDto menjadi opsional
// sehingga cocok untuk kebutuhan update sebagian data account.
export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
