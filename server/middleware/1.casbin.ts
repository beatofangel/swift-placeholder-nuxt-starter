import casbin, { Enforcer } from 'casbin';
import { PrismaAdapter } from 'casbin-prisma-adapter';

let enforcer: Enforcer

declare module 'h3' {
  interface H3EventContext {
    casbin: Enforcer
  }
}

export default eventHandler(async (event) => {
  if (!enforcer) {
    const adapter = await PrismaAdapter.newAdapter();
    enforcer = await casbin.newEnforcer('./rbac_model.conf', adapter);
    console.log(await enforcer.getAllRoles())
    console.log(await enforcer.getAllSubjects())
  }
  event.context.casbin = enforcer
})
