import 'server-only';

import { Lucia } from 'lucia';
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { db } from './prisma';
import { cookies } from 'next/headers';
import { cache } from 'react';

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

export const getUser = cache(async () => {
  const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value || null
  if (!sessionId) {
    return null
  }
  const { session, user } = await lucia.validateSession(sessionId)
  try {
    if (session && session.fresh) {
      // refreshing their session cookie
      const cookieStore = await cookies();
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    if (!session) {
      const cookieStore = await cookies();
      const sessionCookie = lucia.createBlankSessionCookie();
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
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
})
