import { Router, Request, Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db, loginHistoryTable } from "@workspace/db";

export const loginHistoryRouter = Router();

/** GET /api/login-history?key=xxx&limit=20 */
loginHistoryRouter.get("/", async (req: Request, res: Response) => {
  try {
    const key = req.query["key"] as string | undefined;
    const limit = Math.min(parseInt(req.query["limit"] as string) || 20, 100);

    if (!key) {
      return res.status(400).json({ error: "key parameter is required" });
    }

    const history = await db
      .select()
      .from(loginHistoryTable)
      .where(eq(loginHistoryTable.keyValue, key))
      .orderBy(desc(loginHistoryTable.createdAt))
      .limit(limit);

    return res.json(
      history.map((h) => ({
        ...h,
        createdAt: h.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error getting login history");
    return res.status(500).json({ error: "Internal server error" });
  }
});
