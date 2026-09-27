import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Field, ForgeHeader, GhostButton, PrimaryButton, Tag, uiStyles } from '@/components/ForgeUI';
import { useForge } from '@/lib/forge-store';
import { testLocalModel } from '@/lib/local-model';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useForge();
  const [endpoint, setEndpoint] = useState(settings.endpoint);
  const [model, setModel] = useState(settings.model);
  const [status, setStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [error, setError] = useState('');

  const save = async () => {
    await updateSettings({ endpoint: endpoint.trim(), model: model.trim() });
    setStatus('idle');
  };
  const test = async () => {
    setStatus('checking');
    setError('');
    try {
      await testLocalModel({ endpoint: endpoint.trim(), model: model.trim() });
      setStatus('connected');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Could not reach the local model.');
    }
  };

  return (
    <ScrollView style={[uiStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[uiStyles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 40 }]}>
      <GhostButton label="Back" onPress={() => router.back()} icon="arrow-left" />
      <View style={{ marginTop: 26 }}><ForgeHeader eyebrow="Runtime" title="Local model settings." subtitle="Forge uses an Ollama-compatible endpoint. Nothing is uploaded by Forge; the endpoint is yours to run and manage." /></View>
      <View style={[styles.info, { backgroundColor: colors.secondary }]}><Feather name="info" size={17} color={colors.primary} /><Text style={[styles.infoText, { color: colors.mutedForeground }]}>On a physical Android phone, use the computer’s LAN IP instead of 127.0.0.1.</Text></View>
      <Text style={[styles.label, { color: colors.foreground }]}>Endpoint</Text>
      <Field value={endpoint} onChangeText={setEndpoint} placeholder="http://192.168.1.20:11434" />
      <Text style={[styles.label, { color: colors.foreground }]}>Model name</Text>
      <Field value={model} onChangeText={setModel} placeholder="qwen2.5:3b" />
      <View style={styles.status}>
        {status === 'checking' ? <ActivityIndicator color={colors.primary} /> : status === 'connected' ? <Tag label="CONNECTED" tone="green" /> : status === 'error' ? <Tag label="NOT REACHABLE" tone="orange" /> : <Tag label="NOT TESTED" />}
        {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
      </View>
      <View style={styles.actions}><PrimaryButton label="Save settings" onPress={save} icon="save" /><GhostButton label="Test local model" onPress={test} icon="radio" /></View>
      <View style={[styles.note, { borderColor: colors.border }]}><Feather name="lock" size={16} color={colors.mutedForeground} /><Text style={[styles.noteText, { color: colors.mutedForeground }]}>Forge will never label a brief as source code or an APK. It only advances when the local model or guided build service returns a real response.</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  info: { borderRadius: 15, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 22 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  status: { minHeight: 35, marginTop: 18, gap: 8, alignItems: 'flex-start' },
  error: { fontSize: 12 },
  actions: { gap: 10, marginTop: 14 },
  note: { marginTop: 28, borderWidth: 1, borderRadius: 15, padding: 14, flexDirection: 'row', gap: 10 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
});