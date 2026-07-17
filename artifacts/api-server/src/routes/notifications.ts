import { Router, Request, Response } from "express";
import { eq, or, desc } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { randomUUID } from "crypto";

export const notificationsRouter = Router();

function requireBotAuth(req: Request, res: Response, next: Function) {
  const secret = process.env["BOT_API_SECRET"];
  if (!secret) return next();
  const header = req.headers["x-bot-secret"];
  if (header !== secret) return res.status(401).json({ error: "Unauthorized" });
  next();
}

/** GET /api/notifications?key=xxx */
notificationsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const key = req.query["key"] as string | undefined;

    const notifications = key
      ? await db
          .select()
          .from(notificationsTable)
          .where(or(eq(notificationsTable.target, key), eq(notificationsTable.target, "all")))
          .orderBy(desc(notificationsTable.createdAt))
          .limit(50)
      : await db
          .select()
          .from(notificationsTable)
          .where(eq(notificationsTable.target, "all"))
          .orderBy(desc(notificationsTable.createdAt))
          .limit(50);

    return res.json(
      notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error getting notifications");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /api/notifications - create (bot auth) */
notificationsRouter.post("/", requireBotAuth, async (req: Request, res: Response) => {
  try {
    const { target, title, body } = req.body as {
      target: string;
      title: string;
      body: string;
    };

    if (!target || !title || !body) {
      return res.status(400).json({ error: "target, title, body are required" });
    }

    const [notif] = await db
      .insert(notificationsTable)
      .values({
        id: randomUUID(),
        target,
        title,
        body,
        read: false,
      })
      .returning();

    return res.status(201).json({
      ...notif,
      createdAt: notif.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating notification");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /api/notifications/:id - delete (bot auth) */
notificationsRouter.delete("/:id", requireBotAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(notificationsTable).where(eq(notificationsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting notification");
    return res.status(500).json({ error: "Internal server error" });
  }
});
