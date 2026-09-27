import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { currentKnowledge } from '@/lib/knowledge';
import { ForgeHeader, GhostButton, Tag, uiStyles } from '@/components/ForgeUI';

export default function KnowledgeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={[uiStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[uiStyles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 40 }]}>
      <GhostButton label="Back" onPress={() => router.back()} icon="arrow-left" />
      <View style={{ marginTop: 26 }}><ForgeHeader eyebrow="Reference pack" title="Current Kotlin + Python guidance." subtitle="Forge links to official sources instead of pretending a static cheat sheet stays current forever." /></View>
      <View style={[styles.notice, { backgroundColor: colors.accent }]}><Feather name="refresh-cw" size={16} color={colors.accentForeground} /><Text style={[styles.noticeText, { color: colors.foreground }]}>Reviewed September 2026. Open the official sources before locking a generated build to exact tool versions.</Text></View>
      {currentKnowledge.map((entry) => (
        <View key={entry.language} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.top}><Text style={[styles.language, { color: colors.foreground }]}>{entry.language}</Text><Tag label={entry.version} tone="green" /></View>
          <Text style={[styles.title, { color: colors.foreground }]}>{entry.title}</Text>
          <Text style={[styles.summary, { color: colors.mutedForeground }]}>{entry.summary}</Text>
          {entry.sources.map((source) => <Text key={source.url} onPress={() => void Linking.openURL(source.url)} style={[styles.source, { color: colors.primary }]}>{source.label}  ↗</Text>)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  notice: { borderRadius: 15, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 16 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19 },
  card: { borderWidth: 1, borderRadius: 19, padding: 16, gap: 10, marginBottom: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  language: { fontSize: 20, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700' },
  summary: { fontSize: 13, lineHeight: 20 },
  source: { fontSize: 13, fontWeight: '700', marginTop: 2 },
});