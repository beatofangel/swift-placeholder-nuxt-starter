import casbin, { Enforcer } from 'casbin';
import { PrismaAdapter } from 'casbin-prisma-adapter';

enum CasbinInitStatus {
  UNINITIALIZED,
  INITIALIZING,
  INITIALIZED
}

let enforcer: Enforcer
let casbinStatus: CasbinInitStatus = CasbinInitStatus.UNINITIALIZED

export const useCasbin = async () => {
  if (!enforcer && casbinStatus === CasbinInitStatus.UNINITIALIZED) {
    console.debug('casbin: initializing... ')
    casbinStatus = CasbinInitStatus.INITIALIZING
    const adapter = await PrismaAdapter.newAdapter();
    enforcer = await casbin.newEnforcer('./rbac_model.conf', adapter);
    casbinStatus = CasbinInitStatus.INITIALIZED
    console.debug('casbin: initialized. ')
  }
  return enforcer
}
