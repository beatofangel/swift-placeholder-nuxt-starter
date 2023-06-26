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
    const testTrue = await enforcer.enforce('admin', '/', 'all')
    console.log(`admin can${ testTrue ? ' ' : ' not '}access '/' with permission 'all'.`)
    const testFalse = await enforcer.enforce('admin', '/noperm', 'all')
    console.log(`admin can${ testFalse ? ' ' : ' not'} access '/noperm' with permission 'all'.`)
  }
  event.context.casbin = enforcer
})
