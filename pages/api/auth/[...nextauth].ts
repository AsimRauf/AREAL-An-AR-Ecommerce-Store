import NextAuth, { DefaultSession, DefaultUser, NextAuthOptions, User, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '../../../config/db'
import { User as DbUser } from '../../../models/User'
import bcrypt from 'bcryptjs'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { awsConfig } from '../../../config/aws'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
      image: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    role: string
    image?: string | null  // Make image optional and allow null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    image: string
  }
}

const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  },
})

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
          await connectDB()
          const user = await DbUser.findOne({ email: credentials?.email })
          if (!user) throw new Error('Invalid credentials')

          const isValid = await bcrypt.compare(credentials?.password || '', user.password)
          if (!isValid) throw new Error('Invalid credentials')

          let signedImageUrl: string | null = null
          if (user.profileImage) {
            const key = user.profileImage.split('/').pop()
            if (key) {
              const command = new GetObjectCommand({
                Bucket: awsConfig.bucketName,
                Key: `profile-images/${key}`
              })
              signedImageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
            }
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: signedImageUrl || undefined,  // Convert null to undefined if no image
            role: user.role
          }
        } catch (error) {
          return null
        }
      }    })
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
        session.user.image = token.image
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
    maxAge: 30 * 24 * 60 * 60,
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
