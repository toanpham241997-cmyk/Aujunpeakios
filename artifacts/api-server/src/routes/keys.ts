import { Router, Request, Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db, keysTable, loginHistoryTable } from "@workspace/db";
import { randomUUID } from "crypto";
import { z } from "zod/v4";

export const keysRouter = Router();

/** Bot auth middleware */
function requireBotAuth(req: Request, res: Response, next: Function) {
  const secret = process.env["BOT_API_SECRET"];
  if (!secret) {
    // If no secret configured, allow (dev mode)
    return next();
  }
  const header = req.headers["x-bot-secret"];
  if (header !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/** POST /api/keys/verify */
keysRouter.post("/verify", async (req: Request, res: Response) => {
  try {
    const { keyValue, deviceId, userAgent, ipAddress } = req.body as {
      keyValue: string;
      deviceId: string;
      userAgent?: string;
      ipAddress?: string;
    };

    if (!keyValue?.trim() || !deviceId?.trim()) {
      return res.status(400).json({ error: "keyValue and deviceId are required" });
    }

    const ip = ipAddress || (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || null;

    const [key] = await db.select().from(keysTable).where(eq(keysTable.keyValue, keyValue.trim()));

    if (!key) {
      return res.status(404).json({ error: "Key không tồn tại. Kiểm tra lại key của bạn." });
    }

    if (key.isLocked) {
      return res.status(403).json({ error: "Key đã bị khóa. Liên hệ admin để được hỗ trợ." });
    }

    // Check expiry
    if (key.expiryDate) {
      const expiry = new Date(key.expiryDate);
      if (expiry < new Date()) {
        return res.status(410).json({ error: "Key đã hết hạn. Vui lòng gia hạn key." });
      }
    }

    // Check device limit - find existing devices
    const existingHistory = await db
      .select({ deviceId: loginHistoryTable.deviceId })
      .from(loginHistoryTable)
      .where(eq(loginHistoryTable.keyId, key.id));

    const uniqueDevices = new Set(existingHistory.map((h) => h.deviceId));
    const isNewDevice = !uniqueDevices.has(deviceId);

    if (isNewDevice && uniqueDevices.size >= key.maxDevices) {
      return res.status(429).json({
        error: `Key này chỉ cho phép ${key.maxDevices} thiết bị. Đã đạt giới hạn.`,
      });
    }

    // Record login history
    await db.insert(loginHistoryTable).values({
      id: randomUUID(),
      keyId: key.id,
      keyValue: key.keyValue,
      deviceId,
      userAgent: userAgent || null,
      ipAddress: ip || null,
      action: "Login",
    });

    // Update device count
    if (isNewDevice) {
      await db
        .update(keysTable)
        .set({ deviceCount: uniqueDevices.size + 1, updatedAt: new Date() })
        .where(eq(keysTable.id, key.id));
    }

    return res.json({
      key: {
        ...key,
        createdAt: key.createdAt.toISOString(),
        updatedAt: key.updatedAt.toISOString(),
      },
      isNewDevice,
    });
  } catch (err) {
    req.log.error({ err }, "Error verifying key");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** GET /api/keys - list all (bot auth) */
keysRouter.get("/", requireBotAuth, async (req: Request, res: Response) => {
  try {
    const type = req.query["type"] as string | undefined;
    const page = parseInt(req.query["page"] as string) || 1;
    const limit = Math.min(parseInt(req.query["limit"] as string) || 50, 200);

    let query = db.select().from(keysTable).orderBy(desc(keysTable.createdAt)).limit(limit).offset((page - 1) * limit);

    const keys = await (type
      ? db.select().from(keysTable).where(eq(keysTable.type, type)).orderBy(desc(keysTable.createdAt)).limit(limit).offset((page - 1) * limit)
      : query);

    return res.json(
      keys.map((k) => ({
        ...k,
        createdAt: k.createdAt.toISOString(),
        updatedAt: k.updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing keys");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /api/keys - create key (bot auth) */
keysRouter.post("/", requireBotAuth, async (req: Request, res: Response) => {
  try {
    const { keyValue, type, expiryDate, maxDevices, notes } = req.body as {
      keyValue?: string;
      type: string;
      expiryDate?: string | null;
      maxDevices?: number;
      notes?: string | null;
    };

    // Generate key value if not provided
    const finalKeyValue = keyValue?.trim() || generateKey(type);

    const [existing] = await db.select().from(keysTable).where(eq(keysTable.keyValue, finalKeyValue));
    if (existing) {
      return res.status(400).json({ error: "Key đã tồn tại" });
    }

    const [newKey] = await db
      .insert(keysTable)
      .values({
        id: randomUUID(),
        keyValue: finalKeyValue,
        type: type || "free",
        expiryDate: expiryDate || null,
        maxDevices: maxDevices || 1,
        deviceCount: 0,
        isLocked: false,
        notes: notes || null,
      })
      .returning();

    return res.status(201).json({
      ...newKey,
      createdAt: newKey.createdAt.toISOString(),
      updatedAt: newKey.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating key");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/keys/:id - update key (bot auth) */
keysRouter.put("/:id", requireBotAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, expiryDate, maxDevices, notes, isLocked } = req.body as {
      type?: string;
      expiryDate?: string | null;
      maxDevices?: number;
      notes?: string | null;
      isLocked?: boolean;
    };

    const [existing] = await db.select().from(keysTable).where(eq(keysTable.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Key không tồn tại" });
    }

    const updateData: Partial<typeof keysTable.$inferInsert> = { updatedAt: new Date() };
    if (type !== undefined) updateData.type = type;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
    if (maxDevices !== undefined) updateData.maxDevices = maxDevices;
    if (notes !== undefined) updateData.notes = notes;
    if (isLocked !== undefined) updateData.isLocked = isLocked;

    const [updated] = await db.update(keysTable).set(updateData).where(eq(keysTable.id, id)).returning();

    return res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating key");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /api/keys/:id - delete key (bot auth) */
keysRouter.delete("/:id", requireBotAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [existing] = await db.select().from(keysTable).where(eq(keysTable.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Key không tồn tại" });
    }

    // Delete login history first
    await db.delete(loginHistoryTable).where(eq(loginHistoryTable.keyId, id));
    await db.delete(keysTable).where(eq(keysTable.id, id));

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting key");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /api/keys/:id/lock - lock key (bot auth) */
keysRouter.post("/:id/lock", requireBotAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [updated] = await db
      .update(keysTable)
      .set({ isLocked: true, updatedAt: new Date() })
      .where(eq(keysTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Key không tồn tại" });

    return res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error locking key");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /api/keys/:id/unlock - unlock key (bot auth) */
keysRouter.post("/:id/unlock", requireBotAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [updated] = await db
      .update(keysTable)
      .set({ isLocked: false, updatedAt: new Date() })
      .where(eq(keysTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Key không tồn tại" });

    return res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error unlocking key");
    return res.status(500).json({ error: "Internal server error" });
  }
});

function generateKey(type: string): string {
  const prefix = type === "vip" ? "VIP" : type === "custom" ? "CUSTOM" : "FREE";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) suffix += "-";
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${suffix}`;
}
