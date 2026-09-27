import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateBlueprint, useCreateInterviewQuestion } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Field, ForgeHeader, PrimaryButton, ProgressBar, Tag, uiStyles } from '@/components/ForgeUI';
import { useForge } from '@/lib/forge-store';
import { askLocalModel, buildLocalBlueprint } from '@/lib/local-model';
import type { Answer } from '@/lib/types';
import type { DatabaseConfig } from '@/lib/types';

type Question = { questionId: string; question: string; kind: 'text' | 'choice'; options?: string[]; progress: number };

export default function InterviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { prompt: rawPrompt, database: rawDatabase } = useLocalSearchParams<{ prompt?: string; database?: string }>();
  const prompt = Array.isArray(rawPrompt) ? rawPrompt[0] : rawPrompt ?? '';
  const databaseEngine = (Array.isArray(rawDatabase) ? rawDatabase[0] : rawDatabase ?? 'sqlite') as DatabaseConfig['engine'];
  const databaseConfig: DatabaseConfig = { engine: databaseEngine, persistence: databaseEngine === 'postgresql' || databaseEngine === 'supabase' ? 'server' : 'local', schemaNotes: '', authRequired: false };
  const { settings, makeProject, saveProject } = useForge();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'local-model' | 'guided'>('guided');
  const [error, setError] = useState('');
  const interview = useCreateInterviewQuestion();
  const blueprint = useCreateBlueprint();

  const askNext = async (nextAnswers: Answer[]) => {
    setBusy(true);
    setError('');
    try {
      const local = await askLocalModel(settings, prompt, nextAnswers, databaseConfig);
      setMode('local-model');
      if (local.done) {
        await finish(nextAnswers, 'local-model');
      } else {
        setQuestion({ questionId: local.questionId ?? `local-${nextAnswers.length}`, question: local.question ?? 'What should Forge understand next?', kind: local.kind ?? 'text', options: local.options, progress: local.progress });
      }
    } catch {
      try {
        const result = await interview.mutateAsync({ data: { prompt, answers: nextAnswers, database: databaseConfig } });
        setQuestion(result.done ? null : { questionId: result.questionId ?? '', question: result.question ?? '', kind: result.kind ?? 'text', options: result.options, progress: result.progress });
        setMode('guided');
      } catch {
        setError('Forge could not reach the local model or the build service. Check your connection and try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const finish = async (finalAnswers: Answer[], finalMode: 'local-model' | 'guided') => {
    setBusy(true);
    try {
      const local = finalMode === 'local-model' ? await buildLocalBlueprint(settings, prompt, finalAnswers, databaseConfig).catch(() => null) : null;
      const built = local ?? await blueprint.mutateAsync({ data: { prompt, answers: finalAnswers, database: databaseConfig } });
      const project = makeProject(built, prompt, finalAnswers, finalMode);
      await saveProject(project);
      router.replace({ pathname: '/blueprint', params: { id: project.id } });
    } catch {
      setError('The brief could not be completed. Nothing was saved.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void askNext([]);
  }, []);

  const canContinue = useMemo(() => answer.trim().length > 0 && !busy, [answer, busy]);

  const submit = async () => {
    if (!question || !answer.trim()) return;
    const nextAnswers = [...answers, { questionId: question.questionId, answer: answer.trim() }];
    setAnswers(nextAnswers);
    setAnswer('');
    if (nextAnswers.length >= 5) {
      await finish(nextAnswers, mode);
    } else {
      await askNext(nextAnswers);
    }
  };

  return (
    <KeyboardAvoidingView style={[uiStyles.screen, { backgroundColor: colors.background }]} behavior="padding">
      <ScrollView contentContainerStyle={[uiStyles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" size={18} color={colors.mutedForeground} /><Text style={[styles.backText, { color: colors.mutedForeground }]}>Back</Text></Pressable>
        <ForgeHeader eyebrow="Build interview" title="Let’s remove the unknowns." subtitle={prompt} />
        <View style={styles.statusRow}>
          <Tag label={mode === 'local-model' ? 'LOCAL MODEL CONNECTED' : 'GUIDED MODE'} tone={mode === 'local-model' ? 'green' : 'orange'} />
          <Text style={[styles.step, { color: colors.mutedForeground }]}>{answers.length} of 5 answered</Text>
        </View>
        <ProgressBar progress={question?.progress ?? (answers.length / 5) * 100} />
        {busy && !question ? (
          <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /><Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Thinking about the next question…</Text></View>
        ) : question ? (
          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.questionIndex, { color: colors.primary }]}>QUESTION {answers.length + 1}</Text>
            <Text style={[styles.question, { color: colors.foreground }]}>{question.question}</Text>
            {question.kind === 'choice' && question.options ? (
              <View style={styles.options}>
                {question.options.map((option) => (
                  <Pressable key={option} onPress={() => setAnswer(option)} style={[styles.option, { borderColor: answer === option ? colors.primary : colors.border, backgroundColor: answer === option ? colors.secondary : 'transparent' }]}>
                    <View style={[styles.radio, { borderColor: answer === option ? colors.primary : colors.mutedForeground, backgroundColor: answer === option ? colors.primary : 'transparent' }]} />
                    <Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Field value={answer} onChangeText={setAnswer} placeholder="Write the honest version…" multiline />
            )}
            <PrimaryButton label={answers.length >= 4 ? 'Create the build brief' : 'Continue'} onPress={submit} disabled={!canContinue} loading={busy} icon="arrow-right" />
          </View>
        ) : null}
        {error ? <View style={[styles.error, { backgroundColor: colors.secondary }]}><Feather name="alert-circle" size={17} color={colors.destructive} /><Text style={[styles.errorText, { color: colors.foreground }]}>{error}</Text></View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 26 },
  backText: { fontSize: 14, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  step: { fontSize: 12, fontWeight: '600' },
  questionCard: { borderWidth: 1, borderRadius: 22, padding: 18, marginTop: 26, gap: 18 },
  questionIndex: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  question: { fontSize: 24, lineHeight: 31, fontWeight: '700', letterSpacing: -0.4 },
  options: { gap: 10 },
  option: { minHeight: 54, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  radio: { width: 17, height: 17, borderRadius: 9, borderWidth: 1 },
  optionText: { flex: 1, fontSize: 14, lineHeight: 19 },
  loading: { alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 260 },
  loadingText: { fontSize: 14 },
  error: { marginTop: 18, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  errorText: { flex: 1, fontSize: 13, lineHeight: 19 },
});