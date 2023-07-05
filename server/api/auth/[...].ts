import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import { NuxtAuthHandler } from '#auth'
import bcrypt from 'bcrypt'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { DefaultAdapter } from 'next-auth/adapters'

export default NuxtAuthHandler({
  // TODO: SET A STRONG SECRET, SEE https://sidebase.io/nuxt-auth/configuration/nuxt-auth-handler#secret
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login'
  },
  session: {
    // use jwt session instead of database when custom adapter used
    strategy: "jwt"
  },
  adapter: PrismaAdapter(usePrisma()) as DefaultAdapter,
  // TODO: ADD YOUR OWN AUTHENTICATION PROVIDER HERE, READ THE DOCS FOR MORE: https://sidebase.io/nuxt-auth
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GithubProvider.default({
      httpOptions: {
        timeout: 30000,
      },
      clientId: process.env.GITHUB_CLIENT_ID || 'enter-your-client-id-here',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'enter-your-client-secret-here' // TODO: Replace this with an env var like "process.env.GITHUB_CLIENT_SECRET". The secret should never end up in your github repository
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      // name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      // credentials: {
      //   username: { label: 'Username', type: 'text', placeholder: '(hint: jsmith)' },
      //   password: { label: 'Password', type: 'password', placeholder: '(hint: hunter2)' }
      // },
      async authorize (credentials: any) {
        const user = await usePrisma().user.findFirst({
          select: {
            id: true,
            // username: true,
            // password: true,
            name: true,
            email: true,
            image: true,
            accounts: {
              select: {
                access_token: true
              },
              where: {
                type: 'credentials'
              }
            }
          },
          where: {
            email: credentials?.username
          }
        })

        if (user && user.accounts.length > 0 && user.accounts[0].access_token && user.email) {
          if (await bcrypt.compare(credentials?.password, user.accounts[0].access_token)) {
            return user
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    // Callback when the JWT is created / updated, see https://next-auth.js.org/configuration/callbacks#jwt-callback
    jwt: async ({token, account, user, trigger}) => {
      console.log('jwt callback for', account, trigger)
      const enforcer = await useCasbin()
      if (account && user) {
        if (trigger === 'signUp') { // user create
          const DEFAULT_ROLE = 'role_user'
          const gp = [user.id, DEFAULT_ROLE]
          enforcer.addGroupingPolicy(...gp).then(result => {
            console.log('addGroupingPolicy:', gp, result ? 'success' : 'failed')
          })
        }
        // token.jwt = account.access_token
        // token.roles = [ DEFAULT_ROLE ]
        token.id = user.id
      }

      return Promise.resolve(token);
    },
    // Callback whenever session is checked, see https://next-auth.js.org/configuration/callbacks#session-callback
    session: async ({session, token}) => {
      (session as any).uid = token.id;

      return Promise.resolve(session);
    },
    redirect: async ({ url, baseUrl }) => {
      console.log(`redirect url:${url} baseUrl:${baseUrl}`)
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
})
