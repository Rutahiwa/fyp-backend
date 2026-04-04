import { db } from "../db";
import { auditLogs } from "../db/schema";

export interface AuditLogDto {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAction(data: AuditLogDto) {
  try {
    // Fire and forget, don't wait for it
    db.insert(auditLogs).values(data).execute().catch((err) => {
      console.error("Failed to insert audit log async:", err);
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}
