import casbin, { Enforcer } from 'casbin';
import { PrismaAdapter } from 'casbin-prisma-adapter';

let enforcer: Enforcer
export const useCasbin = async () => {
  if (!enforcer) {
    const adapter = await PrismaAdapter.newAdapter();
    enforcer = await casbin.newEnforcer('./rbac_model.conf', adapter);
  }
  return enforcer
}
