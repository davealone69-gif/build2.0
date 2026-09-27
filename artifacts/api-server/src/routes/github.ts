import { Router, type IRouter, type Response } from "express";
import { z } from "zod";
import { dispatchWorkflow, listRepositories, listRuns, listWorkflows, pushFile } from "../lib/github";

const router: IRouter = Router();
const routeParams = z.object({ owner: z.string().min(1), repo: z.string().min(1) });

function sendError(res: Response, error: unknown) {
  res.status(502).json({ error: error instanceof Error ? error.message : "GitHub request failed" });
}

router.get("/forge/github/repos", async (_req, res) => {
  try {
    res.json({ connected: true, repositories: await listRepositories() });
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/forge/github/repos/:owner/:repo/workflows", async (req, res) => {
  const params = routeParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid repository" }); return; }
  try { res.json({ workflows: await listWorkflows(params.data.owner, params.data.repo) }); } catch (error) { sendError(res, error); }
});

router.get("/forge/github/repos/:owner/:repo/runs", async (req, res) => {
  const params = routeParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid repository" }); return; }
  try { res.json({ runs: await listRuns(params.data.owner, params.data.repo) }); } catch (error) { sendError(res, error); }
});

router.post("/forge/github/repos/:owner/:repo/push", async (req, res) => {
  const params = routeParams.safeParse(req.params);
  const body = z.object({
    path: z.string().min(1),
    content: z.string(),
    message: z.string().min(1).max(200),
    branch: z.string().min(1),
    sha: z.string().optional(),
  }).safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid GitHub push request" }); return; }
  try {
    const result = await pushFile(params.data.owner, params.data.repo, body.data);
    res.json({ ok: true, message: "File pushed to GitHub", url: result.url });
  } catch (error) { sendError(res, error); }
});

router.post("/forge/github/repos/:owner/:repo/dispatch", async (req, res) => {
  const params = routeParams.safeParse(req.params);
  const body = z.object({ workflowId: z.string().min(1), ref: z.string().min(1), inputs: z.record(z.string(), z.string()).optional() }).safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid workflow dispatch request" }); return; }
  try {
    const result = await dispatchWorkflow(params.data.owner, params.data.repo, body.data);
    res.status(202).json({ ok: true, message: "GitHub Actions workflow started", url: result.url });
  } catch (error) { sendError(res, error); }
});

export default router;