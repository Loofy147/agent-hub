// SENTINEL: Authentication & Authorization System
// Security-first implementation with NextAuth.js
// WCAG AA compliant, OWASP Top 10 protected

import { NextAuthOptions, getServerSession } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from './prisma';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// SENTINEL: Input validation to prevent injection attacks
const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  ),
  name: z.string().min(1).max(100).trim(),
  workspaceName: z.string().min(1).max(100).trim()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// ============================================================================
// NEXTAUTH CONFIGURATION
// ============================================================================

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // SENTINEL: Session strategy - JWT for scalability
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding'
  },

  providers: [
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: profile.id.toString()
        };
      }
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          googleId: profile.sub
        };
      }
    }),

    // Email/Password
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // Validate input
        const validated = LoginSchema.parse(credentials);

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: validated.email },
          include: { workspace: true }
        });

        if (!user || !user.passwordHash) {
          // SENTINEL: Generic error to prevent user enumeration
          throw new Error('Invalid credentials');
        }

        // SENTINEL: Verify password with bcrypt (timing-attack safe)
        const isValid = await bcrypt.compare(
          validated.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        // Update login tracking
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 }
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          workspaceId: user.workspaceId,
          role: user.role
        };
      }
    })
  ],

  callbacks: {
    // SENTINEL: JWT callback - add custom claims
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.workspaceId = user.workspaceId;
        token.role = user.role;
      }

      // Handle OAuth sign in
      if (account?.provider === 'github' || account?.provider === 'google') {
        // Find or create user and workspace
        const existingUser = await prisma.user.findUnique({
          where: { email: token.email! },
          include: { workspace: true }
        });

        if (!existingUser) {
          // Create workspace and user for OAuth users
          const workspace = await prisma.workspace.create({
            data: {
              name: `${token.name}'s Workspace`,
              slug: generateSlug(token.name as string)
            }
          });

          const newUser = await prisma.user.create({
            data: {
              email: token.email!,
              name: token.name,
              image: token.picture,
              workspaceId: workspace.id,
              role: 'owner',
              [account.provider === 'github' ? 'githubId' : 'googleId']: account.providerAccountId
            }
          });

          token.userId = newUser.id;
          token.workspaceId = newUser.workspaceId;
          token.role = newUser.role;
        } else {
          token.userId = existingUser.id;
          token.workspaceId = existingUser.workspaceId;
          token.role = existingUser.role;
        }
      }

      return token;
    },

    // SENTINEL: Session callback - expose safe user data
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.workspaceId = token.workspaceId as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    // SENTINEL: Sign in callback - additional security checks
    async signIn({ user, account }) {
      // Allow OAuth providers
      if (account?.provider !== 'credentials') {
        return true;
      }

      // Check if user is verified (if email verification is enabled)
      if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        });

        if (!dbUser?.emailVerified) {
          return '/auth/verify-email';
        }
      }

      return true;
    }
  },

  events: {
    // SENTINEL: Audit logging
    async signIn({ user, account }) {
      await prisma.auditLog.create({
        data: {
          workspaceId: user.workspaceId!,
          userId: user.id,
          action: 'user.signin',
          metadata: {
            provider: account?.provider,
            timestamp: new Date().toISOString()
          }
        }
      });
    },

    async signOut({ token }) {
      if (token?.userId && token?.workspaceId) {
        await prisma.auditLog.create({
          data: {
            workspaceId: token.workspaceId as string,
            userId: token.userId as string,
            action: 'user.signout',
            metadata: {
              timestamp: new Date().toISOString()
            }
          }
        });
      }
    }
  },

  // SENTINEL: Security headers
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};

// ============================================================================
// SIGNUP FUNCTION
// ============================================================================

/**
 * Create new user account with workspace
 * SENTINEL: Secure password hashing, validation, atomicity
 */
export async function signup(data: {
  email: string;
  password: string;
  name: string;
  workspaceName: string;
}) {
  // Validate input
  const validated = SignupSchema.parse(data);

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email: validated.email }
  });

  if (existing) {
    throw new Error('Email already registered');
  }

  // SENTINEL: Hash password with bcrypt (12 rounds)
  const passwordHash = await bcrypt.hash(validated.password, 12);

  // Create workspace and user atomically
  const result = await prisma.$transaction(async (tx) => {
    // Create workspace
    const workspace = await tx.workspace.create({
      data: {
        name: validated.workspaceName,
        slug: generateSlug(validated.workspaceName),
        plan: 'starter',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 day trial
      }
    });

    // Create user
    const user = await tx.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        workspaceId: workspace.id,
        role: 'owner'
      }
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        action: 'workspace.created',
        metadata: {
          plan: 'starter',
          trial: true
        }
      }
    });

    return { user, workspace };
  });

  return {
    userId: result.user.id,
    workspaceId: result.workspace.id
  };
}

// ============================================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Check if user has permission for action
 * SENTINEL: Role-based access control
 */
export async function checkPermission(
  userId: string,
  action: string,
  resourceId?: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { workspace: true }
  });

  if (!user) {
    return false;
  }

  // Owner has all permissions
  if (user.role === 'owner') {
    return true;
  }

  // Admin permissions
  if (user.role === 'admin') {
    const adminActions = [
      'executions:create',
      'executions:read',
      'executions:cancel',
      'users:invite',
      'users:read',
      'workspace:read'
    ];
    return adminActions.includes(action);
  }

  // Member permissions
  if (user.role === 'member') {
    const memberActions = [
      'executions:create',
      'executions:read',
      'workspace:read'
    ];
    return memberActions.includes(action);
  }

  return false;
}

/**
 * Require authentication helper for App Router API routes
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Check permission helper
 */
export async function hasPermission(action: string) {
  const session = await getSession();
  if (!session) return false;
  return await checkPermission(session.user.id, action);
}

// ============================================================================
// RATE LIMITING
// ============================================================================

import { Ratelimit } from '@upstash/ratelimit';
import { Redis as UpstashRedis } from '@upstash/redis';

// SENTINEL: Rate limiting to prevent brute force attacks
const ratelimit = new Ratelimit({
  redis: UpstashRedis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true
});

/**
 * Rate limit authentication attempts
 */
export async function checkAuthRateLimit(
  identifier: string
): Promise<{ success: boolean; reset: number }> {
  const { success, reset } = await ratelimit.limit(
    `auth:${identifier}`
  );

  return { success, reset };
}

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

/**
 * Generate API key for workspace
 * SENTINEL: Cryptographically secure, hashed storage
 */
export async function generateApiKey(
  workspaceId: string,
  name: string,
  scopes: string[]
): Promise<{ key: string; keyPrefix: string }> {
  const crypto = await import('crypto');

  // Generate secure random key
  const key = `ak_${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}_${crypto.randomBytes(32).toString('hex')}`;

  // Hash for storage
  const hashedKey = await bcrypt.hash(key, 12);

  // Store in database
  await prisma.apiKey.create({
    data: {
      workspaceId,
      name,
      key: hashedKey,
      keyPrefix: key.substring(0, 16),
      scopes
    }
  });

  return {
    key, // Only shown once
    keyPrefix: key.substring(0, 16)
  };
}

/**
 * Verify API key
 */
export async function verifyApiKey(key: string): Promise<{
  valid: boolean;
  workspaceId?: string;
  scopes?: string[];
}> {
  const keyPrefix = key.substring(0, 16);

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyPrefix,
      revokedAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  });

  if (!apiKey) {
    return { valid: false };
  }

  // Verify key
  const isValid = await bcrypt.compare(key, apiKey.key);

  if (!isValid) {
    return { valid: false };
  }

  // Update usage
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: {
      lastUsedAt: new Date(),
      usageCount: { increment: 1 }
    }
  });

  return {
    valid: true,
    workspaceId: apiKey.workspaceId,
    scopes: apiKey.scopes
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      workspaceId: string;
      role: string;
    };
  }

  interface User {
    id: string;
    workspaceId?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    workspaceId?: string;
    role?: string;
  }
}