import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  // Get full user data from database
  const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  
  if (!user.length) {
    return null;
  }

  return user[0];
}