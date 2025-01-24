import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Role } from '@user/entities/role.enum';
import { RequestUserInterface } from '@auth/interface/requestUser.interface';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';

export const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin extends AccessTokenGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const req = context.switchToHttp().getRequest<RequestUserInterface>();
      const user = req.user;

      return user?.role.includes(role);
    }
  }

  return mixin(RoleGuardMixin);
};
