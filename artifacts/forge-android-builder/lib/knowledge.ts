export type KnowledgeEntry = {
  language: 'Kotlin' | 'Python';
  version: string;
  title: string;
  summary: string;
  sources: { label: string; url: string }[];
};

export const currentKnowledge: KnowledgeEntry[] = [
  {
    language: 'Kotlin',
    version: '2.4.x track',
    title: 'Kotlin-first Android development',
    summary: 'Prefer Kotlin for new Android code, coroutines for structured concurrency, and current AndroidX / Jetpack guidance. Verify compiler and Android Gradle Plugin compatibility in the target project before generating source.',
    sources: [
      { label: 'Kotlin documentation', url: 'https://kotlinlang.org/docs/getting-started.html' },
      { label: 'Android Kotlin-first guidance', url: 'https://developer.android.com/kotlin/first' },
    ],
  },
  {
    language: 'Python',
    version: '3.14.x docs',
    title: 'Modern Python services and tooling',
    summary: 'Use Python 3.14 documentation as the current reference line, isolate dependencies in virtual environments, and use pyproject.toml-based packaging with the Python Packaging User Guide.',
    sources: [
      { label: 'Python 3.14 docs', url: 'https://docs.python.org/3/' },
      { label: 'Python Packaging User Guide', url: 'https://packaging.python.org/en/latest/' },
    ],
  },
];