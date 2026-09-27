import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { ForgeHeader, GhostButton, PrimaryButton, Tag, uiStyles } from '@/components/ForgeUI';
import { useForge } from '@/lib/forge-store';

export default function BlueprintScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { projects } = useForge();
  const project = projects.find((item) => item.id === id);

  if (!project) {
    return <View style={[uiStyles.screen, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }]}><Text style={[styles.title, { color: colors.foreground }]}>Brief not found</Text><GhostButton label="Back to projects" onPress={() => router.replace('/projects')} /></View>;
  }

  return (
    <View style={[uiStyles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[uiStyles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.topBar}><GhostButton label="Projects" onPress={() => router.back()} icon="arrow-left" /><Tag label={project.modelMode === 'local-model' ? 'LOCAL MODEL' : 'GUIDED'} tone={project.modelMode === 'local-model' ? 'green' : 'orange'} /></View>
        <ForgeHeader eyebrow="Build brief" title={project.title} subtitle={project.summary} />
        <View style={[styles.callout, { backgroundColor: colors.accent }]}>
          <Feather name="check-circle" size={18} color={colors.accentForeground} />
          <Text style={[styles.calloutText, { color: colors.foreground }]}>This brief is saved on this device. It is a source of truth for the Android build, not a claim that source code has already been generated.</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Scope</Text>
        <View style={styles.featureList}>
          {project.features.map((feature) => (
            <View key={feature.name} style={[styles.feature, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.featureTop}><Text style={[styles.featureName, { color: colors.foreground }]}>{feature.name}</Text><Tag label={feature.priority.toUpperCase()} tone={feature.priority === 'must' ? 'green' : 'muted'} /></View>
              <Text style={[styles.featureDescription, { color: colors.mutedForeground }]}>{feature.description}</Text>
            </View>
          ))}
        </View>
        {project.openQuestions.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Still open</Text>
            {project.openQuestions.map((item) => <View key={item} style={[styles.openQuestion, { borderColor: colors.border }]}><Feather name="help-circle" size={16} color={colors.primary} /><Text style={[styles.featureDescription, { color: colors.mutedForeground }]}>{item}</Text></View>)}
          </>
        ) : null}
        <View style={styles.bottomActions}>
          <PrimaryButton label="Continue shaping this brief" onPress={() => router.push({ pathname: '/interview', params: { prompt: project.prompt } })} icon="edit-3" />
          <GhostButton label="Configure local model" onPress={() => router.push('/settings')} icon="cpu" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  callout: { padding: 14, borderRadius: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  calloutText: { flex: 1, fontSize: 13, lineHeight: 19 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 28, marginBottom: 12 },
  featureList: { gap: 10 },
  feature: { borderWidth: 1, borderRadius: 17, padding: 15, gap: 9 },
  featureTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  featureName: { flex: 1, fontSize: 15, fontWeight: '700' },
  featureDescription: { fontSize: 13, lineHeight: 19 },
  openQuestion: { borderWidth: 1, borderRadius: 15, padding: 14, flexDirection: 'row', gap: 10 },
  bottomActions: { gap: 10, marginTop: 28 },
});