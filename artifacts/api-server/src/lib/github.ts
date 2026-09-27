import { ReplitConnectors } from "@replit/connectors-sdk";

type GithubResponse = {
  ok: boolean;
  status: number;
  data: unknown;
};
type ProxyInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

const connectors = new ReplitConnectors();

function assertSegment(value: string, label: string) {
  if (!/^[A-Za-z0-9_.-]+$/.test(value)) throw new Error(`Invalid GitHub ${label}`);
  return value;
}

async function request(path: string, init?: ProxyInit): Promise<GithubResponse> {
  const response = await connectors.proxy("github", path, init);
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: response.ok, status: response.status, data };
}

export async function listRepositories() {
  const result = await request("/user/repos?sort=pushed&per_page=50");
  if (!result.ok) throw new Error(`GitHub repositories request failed (${result.status})`);
  return (result.data as Array<Record<string, unknown>>).map((repo) => ({
    id: Number(repo.id),
    fullName: String(repo.full_name),
    defaultBranch: String(repo.default_branch ?? "main"),
    private: Boolean(repo.private),
    htmlUrl: String(repo.html_url),
  }));
}

export async function listWorkflows(owner: string, repo: string) {
  const result = await request(`/repos/${assertSegment(owner, "owner")}/${assertSegment(repo, "repo")}/actions/workflows?per_page=50`);
  if (!result.ok) throw new Error(`GitHub workflows request failed (${result.status})`);
  const workflows = ((result.data as { workflows?: Array<Record<string, unknown>> }).workflows ?? []);
  return workflows.map((workflow) => ({
    id: Number(workflow.id),
    name: String(workflow.name),
    path: String(workflow.path),
    state: String(workflow.state),
  }));
}

export async function pushFile(owner: string, repo: string, input: { path: string; content: string; message: string; branch: string; sha?: string }) {
  if (!/^[A-Za-z0-9_./-]+$/.test(input.path) || input.path.startsWith("/") || input.path.includes("..")) {
    throw new Error("Invalid GitHub file path");
  }
  const body = {
    message: input.message,
    content: Buffer.from(input.content, "utf8").toString("base64"),
    branch: input.branch,
    ...(input.sha ? { sha: input.sha } : {}),
  };
  const result = await request(`/repos/${assertSegment(owner, "owner")}/${assertSegment(repo, "repo")}/contents/${input.path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/vnd.github+json" },
    body: JSON.stringify(body),
  });
  if (!result.ok) throw new Error(`GitHub push failed (${result.status})`);
  const data = result.data as { content?: { html_url?: string } };
  return { url: data.content?.html_url ?? "" };
}

export async function dispatchWorkflow(owner: string, repo: string, input: { workflowId: string; ref: string; inputs?: Record<string, string> }) {
  if (!/^[A-Za-z0-9_.-]+$/.test(input.workflowId)) throw new Error("Invalid workflow id");
  const result = await request(`/repos/${assertSegment(owner, "owner")}/${assertSegment(repo, "repo")}/actions/workflows/${input.workflowId}/dispatches`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/vnd.github+json" },
    body: JSON.stringify({ ref: input.ref, inputs: input.inputs ?? {} }),
  });
  if (!result.ok) throw new Error(`GitHub workflow dispatch failed (${result.status})`);
  return { url: `https://github.com/${owner}/${repo}/actions` };
}

export async function listRuns(owner: string, repo: string) {
  const result = await request(`/repos/${assertSegment(owner, "owner")}/${assertSegment(repo, "repo")}/actions/runs?per_page=10`);
  if (!result.ok) throw new Error(`GitHub runs request failed (${result.status})`);
  const runs = ((result.data as { workflow_runs?: Array<Record<string, unknown>> }).workflow_runs ?? []);
  return runs.map((run) => ({
    id: Number(run.id),
    name: String(run.name ?? "Workflow"),
    status: String(run.status ?? "unknown"),
    conclusion: run.conclusion == null ? null : String(run.conclusion),
    htmlUrl: String(run.html_url),
  }));
}