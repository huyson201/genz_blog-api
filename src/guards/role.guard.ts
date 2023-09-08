import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from 'src/types/schema';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  matchRole(roles: Role[], userRole: Role) {
    return roles.some((role) => role === userRole);
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles) return true;
    const request = context.switchToHttp().getRequest() as Request;
    const user = request.user;
    return this.matchRole(roles, user.role);
  }
}
