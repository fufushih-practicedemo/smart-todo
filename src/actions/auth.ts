"use server";

import { signInSchema, signUpSchema } from "@/lib/definitions";
import { googleOAuthClient } from "@/lib/googleOAuth";
import { lucia } from "@/lib/lucia";
import { db } from "@/lib/prisma";
import { generateCodeVerifier, generateState } from "arctic";
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export const signUp = async (values: z.infer<typeof signUpSchema>) => {
  try {
    const existingUser = await db.user.findUnique({
      where: {
        email: values.email
      }
    })
    if (existingUser) {
      return {
        error: 'User already exists',
        success: false
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(values.password, salt);

    const user = await db.user.create({
      data: {
        email: values.email,
        name: values.name,
        hashedPassword
      }
    })

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = await lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return { success: true }
  } catch (error) {
    return { error: "Something went wrong", success: false }
  }
}


export const signIn = async (values: z.infer<typeof signInSchema>) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email: values.email
      }
    });
    if (!user || !user.hashedPassword) {
      return { success: false, error: "Invalid Credentials!" };
    }

    const passwordMatch = await bcrypt.compare(values.password, user.hashedPassword);
    if (!passwordMatch) {
      return { success: false, error: "Invalid Credentials!" };
    }

    // successfully login
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = await lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
}

export const logOut = async () => {
  const sessionCookie = await lucia.createBlankSessionCookie()
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  return redirect('/auth')
}

export const getGoogleOAuthConsentUrl =async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    cookies().set('codeVerifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })
    cookies().set('state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })

    const authUrl = await googleOAuthClient.createAuthorizationURL(state, codeVerifier, {
      scopes: ['email', 'profile']
    })

    return {
      success: true,
      url: authUrl.toString()
    }

  } catch (error) {
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}
