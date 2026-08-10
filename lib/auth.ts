import { getServerSession } from "next-auth/next"
import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { Session } from "next-auth"
import { getUserLogin } from "./githubApi"

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
          // No Actions API is called anywhere; `workflow` only granted a stolen
          // token the ability to push .github/workflows/* to the user's repos.
          scope: 'public_repo'
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
      // JWT sessions created before username was persisted otherwise remain
      // incomplete until they expire. Resolve the login once and store it back
      // into the encrypted JWT so existing users do not need to sign in again.
      const lastUsernameLookup = typeof token.usernameLookupAt === "number"
        ? token.usernameLookupAt
        : 0
      if (
        !token.username &&
        typeof token.accessToken === "string" &&
        Date.now() - lastUsernameLookup > 5 * 60 * 1000
      ) {
        token.usernameLookupAt = Date.now()
        try {
          token.username = await getUserLogin(token.accessToken)
        } catch (error) {
          console.error("Failed to restore GitHub username in session:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      if (session.user && typeof token.username === "string") {
        session.user.username = token.username
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
