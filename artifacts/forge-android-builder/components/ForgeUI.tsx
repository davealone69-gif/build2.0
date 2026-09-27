import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export function ForgeHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={[styles.mark, { backgroundColor: colors.primary }]}>
          <Feather name="tool" size={16} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.brand, { color: colors.foreground }]}>FORGE</Text>
        <View style={[styles.localDot, { backgroundColor: colors.accentForeground }]} />
        <Text style={[styles.localLabel, { color: colors.mutedForeground }]}>LOCAL</Text>
      </View>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow.toUpperCase()}</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      testID={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.primary, opacity: disabled || loading ? 0.45 : pressed ? 0.82 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={colors.primaryForeground} /> : icon ? <Feather name={icon} size={17} color={colors.primaryForeground} /> : null}
      <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.ghostButton, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
      {icon ? <Feather name={icon} size={16} color={colors.foreground} /> : null}
      <Text style={[styles.ghostButtonText, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ value, onChangeText, placeholder, multiline = false }: { value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean }) {
  const colors = useColors();
  return (
    <TextInput
      testID="field-input"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.field, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border, minHeight: multiline ? 132 : 52 }]}
    />
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const colors = useColors();
  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
      <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${Math.max(4, Math.min(progress, 100))}%` }]} />
    </View>
  );
}

export function Tag({ label, tone = 'muted' }: { label: string; tone?: 'muted' | 'green' | 'orange' }) {
  const colors = useColors();
  const color = tone === 'green' ? colors.accentForeground : tone === 'orange' ? colors.primary : colors.mutedForeground;
  return <View style={[styles.tag, { backgroundColor: tone === 'green' ? colors.accent : colors.secondary }]}><Text style={[styles.tagText, { color }]}>{label}</Text></View>;
}

export const uiStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 120 },
  card: { borderRadius: 20, padding: 18, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
});

const styles = StyleSheet.create({
  header: { gap: 8, marginBottom: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  mark: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 13, fontWeight: '700', letterSpacing: 2.5 },
  localDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
  localLabel: { fontSize: 10, letterSpacing: 1.8, fontWeight: '600' },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -0.8, lineHeight: 38 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  primaryButton: { minHeight: 54, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
  ghostButton: { minHeight: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ghostButtonText: { fontSize: 14, fontWeight: '600' },
  field: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, lineHeight: 22 },
  progressTrack: { height: 5, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  tag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  tagText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
});