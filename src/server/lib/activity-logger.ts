import { activities } from '../db/schema';
import type { Database } from '../db';

export type ActivityType = 'order' | 'store' | 'customer' | 'payment' | 'invoice';
export type ActivityAction = 'created' | 'updated' | 'deleted' | 'status_changed';

interface LogActivityParams {
    db: Database;
    organizationId: string;
    type: ActivityType;
    action: ActivityAction;
    entityId: number;
    title: string;
    description?: string;
    status?: string;
    userId?: string;
}

/**
 * Logs a significant event to the activities table
 */
export async function logActivity({
    db,
    organizationId,
    type,
    action,
    entityId,
    title,
    description,
    status,
    userId
}: LogActivityParams) {
    try {
        await db.insert(activities).values({
            organizationId,
            type,
            action,
            entityId,
            title,
            description,
            status,
            userId,
        });
    } catch (error) {
        // We log the error but don't fail the main request if logging fails
        console.error(`Failed to log activity: ${title}`, error);
    }
}
