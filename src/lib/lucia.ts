import { Lucia } from 'lucia';
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { db } from './prisma';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = "auth-cookie";
const adapter = new PrismaAdapter(db.session, db.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: SESSION_COOKIE_NAME,
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production"
    }
  }
})

export const getUser = async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value || null
  if (!sessionId) {
    return null
  }
  const { session, user } = await lucia.validateSession(sessionId)
  try {
    if (session && session.fresh) {
      // refreshing their session cookie
      const sessionCookie = await lucia.createSessionCookie(session.id)
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }
    if (!session) {
      const sessionCookie = await lucia.createBlankSessionCookie()
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }

  } catch {
    return null
  }
  const dbUser = await db.user.findUnique({
    where: {
      id: user?.id
    },
    select: {
      name: true,
      email: true,
      picture: true
    }
  })

  if (!dbUser) return null;

  return dbUser;
}
