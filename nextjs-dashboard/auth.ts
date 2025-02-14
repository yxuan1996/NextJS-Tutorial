import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // "Credentials" Provider allows login with email and password
    Credentials({
      // Built in function to handle authentication logic. Expects a credential input and outputs a User object or null.
      async authorize(credentials) {
        // Validate inputs using zod
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

          // Check if user exists in User database
          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            const user = await getUser(email);
            if (!user) return null;
            // Use Bcrypt to compare salted passwords
            const passwordsMatch = await bcrypt.compare(password, user.password);
 
            if (passwordsMatch) return user;
          }
   
          console.log("Invalid Credentials")
          return null;
      },
    }),
  ],
});