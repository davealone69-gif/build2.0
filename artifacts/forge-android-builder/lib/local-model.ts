import type { Answer, Blueprint, DatabaseConfig, LocalModelSettings } from '@/lib/types';

type ChatResponse = {
  message?: { content?: string };
};

function normalizeEndpoint(endpoint: string) {
  return endpoint.replace(/\/+$/, '');
}

export async function askLocalModel(
  settings: LocalModelSettings,
  prompt: string,
  answers: Answer[],
  database: DatabaseConfig,
) {
  const response = await fetch(`${normalizeEndpoint(settings.endpoint)}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.model,
      stream: false,
      messages: [
        {
          role: 'system',
          content:
            'You are Forge, a product architect. Ask exactly one concise question at a time to clarify an Android app. Do not invent requirements. Return only JSON with questionId, question, kind, options, done, progress.',
        },
        {
          role: 'user',
          content: JSON.stringify({ prompt, answers, database }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Local model returned HTTP ${response.status}`);
  }
  const data = (await response.json()) as ChatResponse;
  if (!data.message?.content) {
    throw new Error('Local model returned no message content');
  }
  return JSON.parse(data.message.content) as {
    done: boolean;
    questionId?: string;
    question?: string;
    kind?: 'text' | 'choice';
    options?: string[];
    progress: number;
  };
}

export async function buildLocalBlueprint(
  settings: LocalModelSettings,
  prompt: string,
  answers: Answer[],
  database: DatabaseConfig,
) {
  const response = await fetch(`${normalizeEndpoint(settings.endpoint)}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.model,
      stream: false,
      format: 'json',
      messages: [
        {
          role: 'system',
          content:
            'You are Forge, a senior Android product architect. Turn the user prompt and interview answers into a truthful build brief. Return only JSON matching: {title,summary,platform,features:[{name,description,priority}],openQuestions,generatedAt}. Never claim source files were generated.',
        },
        {
          role: 'user',
          content: JSON.stringify({ prompt, answers, database }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Local model returned HTTP ${response.status}`);
  }
  const data = (await response.json()) as ChatResponse;
  if (!data.message?.content) {
    throw new Error('Local model returned no blueprint');
  }
  return { ...JSON.parse(data.message.content), database } as Blueprint;
}

export async function testLocalModel(settings: LocalModelSettings) {
  const response = await fetch(`${normalizeEndpoint(settings.endpoint)}/api/tags`);
  if (!response.ok) throw new Error(`Local model returned HTTP ${response.status}`);
  return true;
}