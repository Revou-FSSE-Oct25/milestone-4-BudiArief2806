import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/metadata.constants';

// Menandai route agar dilewati oleh JwtAuthGuard.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
