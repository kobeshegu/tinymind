import { getServerSession } from "next-auth/next"
import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { Session } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    expires: string
  }
}

export async function getSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions) as Session | null
  if (!session) {
    return null
  }
  return session
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'public_repo workflow'
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && account.access_token) {
        token.accessToken = account.access_token
      }
      // The GitHub login lives on `profile`, not `account`. Reading it from
      // `account` yielded undefined, which is why the header and footer each
      // had to fetch it over the network on every page load.
      if (profile) {
        token.username = (profile as { login?: string }).login
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      if (session.user) {
        session.user.username = token.username as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}