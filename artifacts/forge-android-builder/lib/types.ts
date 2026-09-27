export type Answer = {
  questionId: string;
  answer: string;
};

export type BlueprintFeature = {
  name: string;
  description: string;
  priority: 'must' | 'should' | 'later';
};

export type Blueprint = {
  title: string;
  summary: string;
  platform: string;
  features: BlueprintFeature[];
  openQuestions: string[];
  generatedAt: string;
};

export type Project = Blueprint & {
  id: string;
  prompt: string;
  answers: Answer[];
  createdAt: string;
  modelMode: 'local-model' | 'guided';
};

export type LocalModelSettings = {
  endpoint: string;
  model: string;
};