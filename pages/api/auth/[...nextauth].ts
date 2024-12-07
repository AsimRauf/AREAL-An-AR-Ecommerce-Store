import NextAuth, { DefaultSession, DefaultUser, NextAuthOptions, User, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '../../../config/db'
import { User as DbUser } from '../../../models/User'
import bcrypt from 'bcryptjs'
import { getEnvironmentSignedUrl } from '../../../utils/url-generator'

// Type extensions
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
      image: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    role: string
    image: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    image: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        try {
          console.log('Auth Environment:', process.env.NODE_ENV)
          await connectDB()
          
          const user = await DbUser.findOne({ email: credentials?.email })
          if (!user) throw new Error('Invalid credentials')

          const isValid = await bcrypt.compare(credentials?.password || '', user.password)
          if (!isValid) throw new Error('Invalid credentials')

          let signedImageUrl: string | null = null
          if (user.profileImage) {
            const cleanKey = user.profileImage.replace(
              'https://tanvircommerce-product-data.s3.ap-south-1.amazonaws.com/',
              ''
            )
            console.log('Generating URL for profile image:', cleanKey)
            signedImageUrl = await getEnvironmentSignedUrl(cleanKey)
            console.log('Generated URL length:', signedImageUrl?.length)
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: signedImageUrl,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        
        if (token.image) {
          try {
            // Clean the image URL and generate new signed URL
            const cleanKey = token.image.replace(/^https?:\/\/[^\/]+\//, '')
            const signedUrl = await getEnvironmentSignedUrl(cleanKey)
            session.user.image = signedUrl || token.image
          } catch (error) {
            console.error('Failed to sign profile image URL:', error)
            session.user.image = null
          }
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
    signOut: '/'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
