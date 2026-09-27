import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { ForgeHeader, GhostButton, Tag, uiStyles } from '@/components/ForgeUI';
import { useForge } from '@/lib/forge-store';

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, deleteProject } = useForge();

  return (
    <View style={[uiStyles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[uiStyles.content, { paddingTop: insets.top + 18, flexGrow: 1 }]}
        ListHeaderComponent={<ForgeHeader eyebrow="Workspace" title="Your builds." subtitle="Every brief is stored locally so you can keep shaping it without a credit clock." />}
        ListEmptyComponent={<View style={styles.empty}><Feather name="layers" size={26} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No builds yet</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Start with an idea on Home and Forge will keep the brief here.</Text></View>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <View style={[styles.projectGlyph, { backgroundColor: colors.secondary }]}><Feather name="layers" size={16} color={colors.primary} /></View>
              <Tag label={item.modelMode === 'local-model' ? 'LOCAL MODEL' : 'GUIDED'} tone={item.modelMode === 'local-model' ? 'green' : 'orange'} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.summary, { color: colors.mutedForeground }]}>{item.summary}</Text>
            <View style={styles.actions}>
              <GhostButton label="Open brief" onPress={() => router.push({ pathname: '/blueprint', params: { id: item.id } })} icon="arrow-up-right" />
              <GhostButton label="Delete" onPress={() => Alert.alert('Delete this brief?', 'This removes the local copy from Forge.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void deleteProject(item.id) }])} icon="trash-2" />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingBottom: 90 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 21, maxWidth: 280 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 12, gap: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectGlyph: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  summary: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
});