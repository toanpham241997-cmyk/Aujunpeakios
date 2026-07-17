import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, appSettingsTable } from "@workspace/db";

export const settingsRouter = Router();

function requireBotAuth(req: Request, res: Response, next: Function) {
  const secret = process.env["BOT_API_SECRET"];
  if (!secret) return next();
  const header = req.headers["x-bot-secret"];
  if (header !== secret) return res.status(401).json({ error: "Unauthorized" });
  next();
}

const FREE_KEY_LINK_KEY = "free_key_link";

/** GET /api/settings/free-key-link */
settingsRouter.get("/free-key-link", async (req: Request, res: Response) => {
  try {
    const [setting] = await db
      .select()
      .from(appSettingsTable)
      .where(eq(appSettingsTable.key, FREE_KEY_LINK_KEY));

    return res.json({ link: setting?.value || "" });
  } catch (err) {
    req.log.error({ err }, "Error getting free key link");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/settings/free-key-link - set (bot auth) */
settingsRouter.put("/free-key-link", requireBotAuth, async (req: Request, res: Response) => {
  try {
    const { link } = req.body as { link: string };
    if (!link) return res.status(400).json({ error: "link is required" });

    await db
      .insert(appSettingsTable)
      .values({ key: FREE_KEY_LINK_KEY, value: link, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSettingsTable.key,
        set: { value: link, updatedAt: new Date() },
      });

    return res.json({ link });
  } catch (err) {
    req.log.error({ err }, "Error setting free key link");
    return res.status(500).json({ error: "Internal server error" });
  }
});
