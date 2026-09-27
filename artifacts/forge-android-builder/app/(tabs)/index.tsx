import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Field, ForgeHeader, GhostButton, PrimaryButton, Tag, uiStyles } from '@/components/ForgeUI';
import { useForge } from '@/lib/forge-store';
import type { DatabaseConfig } from '@/lib/types';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects } = useForge();
  const [prompt, setPrompt] = useState('');
  const [database, setDatabase] = useState<DatabaseConfig['engine']>('sqlite');

  const start = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    router.push({ pathname: '/interview', params: { prompt: trimmed, database } });
  };

  return (
    <View style={[uiStyles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[uiStyles.content, { paddingTop: insets.top + 18 }]}>
        <ForgeHeader eyebrow="Local app studio" title="Turn the idea into a build brief." subtitle="Forge asks the questions that prevent half-built apps. Your projects stay on this device." />
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.heroTop}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
              <Feather name="zap" size={20} color={colors.accentForeground} />
            </View>
            <Tag label="NO CREDIT METER" tone="green" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>What are you building?</Text>
          <Text style={[styles.heroCopy, { color: colors.mutedForeground }]}>Start with the outcome, not the screens. Be specific about who it helps.</Text>
          <Field value={prompt} onChangeText={setPrompt} multiline placeholder="e.g. An offline pantry tracker for shared houses..." />
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>Data storage</Text>
          <Text style={[styles.inputHint, { color: colors.mutedForeground }]}>Forge includes this choice in the build brief and GitHub handoff.</Text>
          <View style={styles.databaseGrid}>
            {([
              ['sqlite', 'SQLite', 'Local-first'],
              ['postgresql', 'PostgreSQL', 'Server data'],
              ['supabase', 'Supabase', 'Hosted backend'],
              ['firebase', 'Firebase', 'Google cloud'],
              ['none', 'No database', 'Static / local state'],
            ] as const).map(([value, label, hint]) => (
              <Pressable key={value} onPress={() => setDatabase(value)} style={[styles.databaseOption, { borderColor: database === value ? colors.primary : colors.border, backgroundColor: database === value ? colors.secondary : 'transparent' }]}>
                <Text style={[styles.databaseLabel, { color: colors.foreground }]}>{label}</Text>
                <Text style={[styles.databaseHint, { color: colors.mutedForeground }]}>{hint}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton label="Start the interview" onPress={start} disabled={!prompt.trim()} icon="arrow-up-right" />
          <View style={styles.trustRow}>
            <Feather name="shield" size={14} color={colors.accentForeground} />
            <Text style={[styles.trustText, { color: colors.mutedForeground }]}>Local-first. No pay-per-prompt counter.</Text>
          </View>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Try a starting point</Text>
        <View style={styles.suggestions}>
          {['A simple appointment app for a mobile dog groomer', 'A private voice journal that works offline', 'A stocktake tool for a small retail team'].map((item) => (
            <GhostButton key={item} label={item} onPress={() => setPrompt(item)} icon="plus" />
          ))}
        </View>
        {projects.length > 0 ? (
          <View style={styles.recent}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent builds</Text>
              <Text onPress={() => router.push('/projects')} style={[styles.link, { color: colors.primary }]}>See all</Text>
            </View>
            {projects.slice(0, 2).map((project) => (
              <View key={project.id} style={[styles.projectRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.projectGlyph, { backgroundColor: colors.secondary }]}>
                  <Feather name="layers" size={16} color={colors.primary} />
                </View>
                <View style={styles.projectMeta}>
                  <Text style={[styles.projectTitle, { color: colors.foreground }]} numberOfLines={1}>{project.title}</Text>
                  <Text style={[styles.projectSummary, { color: colors.mutedForeground }]} numberOfLines={1}>{project.summary}</Text>
                </View>
                <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: { borderWidth: 1, borderRadius: 24, padding: 18, gap: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconCircle: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 23, fontWeight: '700', marginTop: 2 },
  heroCopy: { fontSize: 14, lineHeight: 20, marginTop: -8 },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: -4 },
  trustText: { fontSize: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 26, marginBottom: 12 },
  suggestions: { gap: 9 },
  recent: { marginTop: 4 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { fontSize: 13, fontWeight: '700' },
  projectRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderBottomWidth: 1 },
  projectGlyph: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  projectMeta: { flex: 1, gap: 4 },
  projectTitle: { fontSize: 14, fontWeight: '700' },
  projectSummary: { fontSize: 12 },
  inputLabel: { fontSize: 13, fontWeight: '700', marginTop: 2, marginBottom: -10 },
  inputHint: { fontSize: 12, lineHeight: 17, marginBottom: -6 },
  databaseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  databaseOption: { width: '48%', minHeight: 58, borderWidth: 1, borderRadius: 14, padding: 11, justifyContent: 'center' },
  databaseLabel: { fontSize: 13, fontWeight: '700' },
  databaseHint: { fontSize: 10, marginTop: 4 },
});