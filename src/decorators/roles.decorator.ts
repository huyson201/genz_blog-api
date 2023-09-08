import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/types/schema';

export const Roles = (...args: Role[]) => SetMetadata('roles', args);
