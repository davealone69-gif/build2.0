import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1).max(2000),
});

const interviewSchema = z.object({
  prompt: z.string().min(3).max(2000),
  answers: z.array(answerSchema).max(12),
  database: z.object({
    engine: z.enum(["sqlite", "postgresql", "supabase", "firebase", "none"]),
    persistence: z.enum(["local", "server", "hybrid"]),
    schemaNotes: z.string().max(2000),
    authRequired: z.boolean(),
  }),
});

const questions = [
  {
    id: "audience",
    question: "Who will use this app most often?",
    kind: "text" as const,
  },
  {
    id: "core-flow",
    question: "What is the one action the app must make effortless?",
    kind: "text" as const,
  },
  {
    id: "data",
    question: "What information should the app save between sessions?",
    kind: "text" as const,
  },
  {
    id: "offline",
    question: "Should the core experience work without internet?",
    kind: "choice" as const,
    options: ["Yes, fully offline", "Offline-first with sync later", "No, internet is required"],
  },
  {
    id: "finish-line",
    question: "What would make you call the first release complete?",
    kind: "text" as const,
  },
];

router.post("/forge/interview", (req, res) => {
  const parsed = interviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "prompt and answers are required" });
    return;
  }

  const next = questions[parsed.data.answers.length];
  if (!next) {
    res.json({ done: true, progress: 100 });
    return;
  }

  res.json({
    done: false,
    questionId: next.id,
    question: next.question,
    kind: next.kind,
    ...(next.kind === "choice" ? { options: next.options } : {}),
    progress: Math.round((parsed.data.answers.length / questions.length) * 100),
  });
});

const blueprintSchema = z.object({
  prompt: z.string().min(3).max(2000),
  answers: z.array(answerSchema).min(1).max(12),
  database: z.object({
    engine: z.enum(["sqlite", "postgresql", "supabase", "firebase", "none"]),
    persistence: z.enum(["local", "server", "hybrid"]),
    schemaNotes: z.string().max(2000),
    authRequired: z.boolean(),
  }),
});

router.post("/forge/blueprint", (req, res) => {
  const parsed = blueprintSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "prompt and at least one answer are required" });
    return;
  }

  const { prompt, answers, database } = parsed.data;
  const title = prompt
    .replace(/^(build|make|create|an app for|a)\s+/i, "")
    .split(/[.!?]/)[0]
    .trim()
    .slice(0, 48)
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase()) || "Untitled app";
  const featureNames = [
    "Core experience",
    "Saved data",
    "Offline behavior",
    "Release finish line",
  ];
  const features = answers.slice(0, 4).map((answer: { questionId: string; answer: string }, index: number) => ({
    name: featureNames[index] ?? `Decision ${index + 1}`,
    description: answer.answer,
    priority: index < 2 ? "must" : index === 2 ? "should" : "later",
  }));

  res.json({
    title,
    summary: `A native Android app for ${answers[0]?.answer ?? "your intended audience"} focused on ${answers[1]?.answer ?? "the main workflow"}.`,
    platform: "Android",
    database,
    features,
    openQuestions: answers.length < questions.length
      ? ["Connect a local model or answer the remaining interview questions before generating source files."]
      : [],
    generatedAt: new Date().toISOString(),
  });
});

export default router;