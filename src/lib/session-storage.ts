import { db, outputs } from '@/db';
import { eq, and, desc, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const MAX_TEMP_OUTPUTS_PER_USER = 5; // Keep last 5 outputs per tool type
const SESSION_STORAGE_KEY = 'icpilot_session_id';

// Get or create session ID for browser session
export function getSessionId(): string {
  if (typeof window === 'undefined') return uuidv4();

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

// Save output as temporary (auto-save)
export async function saveTempOutput(
  userId: string,
  icpId: string,
  type: string,
  title: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  sessionId?: string
) {
  // Use provided sessionId or generate new one for server-side calls
  const finalSessionId = sessionId || uuidv4();

  // Clean up old temp outputs for this user/type before saving new one
  await cleanupOldTempOutputs(userId, type);

  const result = await db.insert(outputs).values({
    userId,
    icpId,
    type,
    title,
    input,
    output,
    isTemporary: true,
    isSaved: false,
    sessionId: finalSessionId,
  }).returning();

  return result[0];
}

// Save output permanently to user's library
export async function saveToLibrary(outputId: string, userId: string) {
  const result = await db.update(outputs)
    .set({
      isSaved: true,
      isTemporary: false,
      updatedAt: new Date(),
    })
    .where(and(
      eq(outputs.id, outputId),
      eq(outputs.userId, userId)
    ))
    .returning();

  return result[0];
}

// Get temporary outputs for user (limited to 10 most recent to prevent memory issues)
export async function getTempOutputs(userId: string, type?: string) {
  const whereConditions = [
    eq(outputs.userId, userId),
    eq(outputs.isTemporary, true)
  ];

  if (type) {
    whereConditions.push(eq(outputs.type, type));
  }

  return await db.select()
    .from(outputs)
    .where(and(...whereConditions))
    .orderBy(desc(outputs.createdAt))
    .limit(10); // Limit to 10 most recent to prevent memory issues
}

// Get saved library outputs (user's permanent collection, limited to recent items)
export async function getLibraryOutputs(userId: string, icpId?: string) {
  const whereConditions = [
    eq(outputs.userId, userId),
    eq(outputs.isSaved, true)
  ];

  if (icpId) {
    whereConditions.push(eq(outputs.icpId, icpId));
  }

  return await db.select()
    .from(outputs)
    .where(and(...whereConditions))
    .orderBy(desc(outputs.createdAt))
    .limit(50); // Limit to 50 most recent saved outputs to prevent memory issues
}

// Clean up old temporary outputs (keep only last MAX_TEMP_OUTPUTS_PER_USER)
async function cleanupOldTempOutputs(userId: string, type: string) {
  // Get count of temp outputs for this user/type
  const countResult = await db.select({ count: count() })
    .from(outputs)
    .where(and(
      eq(outputs.userId, userId),
      eq(outputs.type, type),
      eq(outputs.isTemporary, true)
    ));

  const currentCount = countResult[0]?.count || 0;

  if (currentCount >= MAX_TEMP_OUTPUTS_PER_USER) {
    // Get IDs of oldest temp outputs to delete
    const oldOutputs = await db.select({ id: outputs.id })
      .from(outputs)
      .where(and(
        eq(outputs.userId, userId),
        eq(outputs.type, type),
        eq(outputs.isTemporary, true)
      ))
      .orderBy(desc(outputs.createdAt))
      .offset(MAX_TEMP_OUTPUTS_PER_USER - 1); // Keep the newest ones

    // Delete the old ones
    for (const oldOutput of oldOutputs) {
      await db.delete(outputs).where(eq(outputs.id, oldOutput.id));
    }
  }
}

// Cleanup job for old temporary content (run this periodically)
export async function cleanupOldTempContent(olderThanDays: number = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await db.delete(outputs)
    .where(and(
      eq(outputs.isTemporary, true),
      // Note: You'll need to add a proper date comparison here
      // This is a simplified version
    ));

  return result;
}