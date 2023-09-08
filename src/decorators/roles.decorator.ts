import { SetMetadata } from '@nestjs/common';
import { Role } from '../types/schema';

export const Roles = (...args: Role[]) => SetMetadata('roles', args);
