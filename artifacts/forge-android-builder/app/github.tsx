import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  getListGithubRunsQueryKey,
  getListGithubWorkflowsQueryKey,
  useDispatchGithubWorkflow,
  useListGithubRepositories,
  useListGithubRuns,
  useListGithubWorkflows,
  usePushGithubFile,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Field, ForgeHeader, GhostButton, PrimaryButton, Tag, uiStyles } from '@/components/ForgeUI';
import { useForge } from '@/lib/forge-store';

function splitRepo(fullName: string) {
  const [owner = '', repo = ''] = fullName.split('/');
  return { owner, repo };
}

export default function GithubScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects } = useForge();
  const repositories = useListGithubRepositories();
  const [selectedRepo, setSelectedRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [message, setMessage] = useState('Forge: publish build brief');
  const [status, setStatus] = useState('');
  const repo = useMemo(() => repositories.data?.repositories.find((item) => item.fullName === (selectedRepo || repositories.data?.repositories[0]?.fullName)), [repositories.data?.repositories, selectedRepo]);
  const { owner, repo: repoName } = splitRepo(repo?.fullName ?? '');
  const effectiveBranch = branch || repo?.defaultBranch || 'main';
  const workflows = useListGithubWorkflows(owner, repoName, { query: { enabled: Boolean(owner && repoName), queryKey: getListGithubWorkflowsQueryKey(owner, repoName) } });
  const runs = useListGithubRuns(owner, repoName, { query: { enabled: Boolean(owner && repoName), queryKey: getListGithubRunsQueryKey(owner, repoName) } });
  const push = usePushGithubFile();
  const dispatch = useDispatchGithubWorkflow();
  const project = projects[0];

  const pushBrief = async () => {
    if (!repo || !project) {
      setStatus('Choose a repository and create a brief first.');
      return;
    }
    setStatus('');
    try {
      const result = await push.mutateAsync({
        owner,
        repo: repoName,
        data: {
          path: 'forge/brief.json',
          content: JSON.stringify(project, null, 2),
          message,
          branch: effectiveBranch,
        },
      });
      setStatus(result.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'GitHub push failed.');
    }
  };

  const startBuild = async () => {
    const workflow = workflows.data?.workflows.find((item) => String(item.id) === workflowId) ?? workflows.data?.workflows[0];
    if (!repo || !workflow) {
      setStatus('Choose a repository with a workflow that supports workflow_dispatch.');
      return;
    }
    setStatus('');
    try {
      const result = await dispatch.mutateAsync({ owner, repo: repoName, data: { workflowId: String(workflow.id), ref: effectiveBranch } });
      setStatus(result.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'GitHub Actions could not be started.');
    }
  };

  return (
    <ScrollView style={[uiStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[uiStyles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 40 }]}>
      <GhostButton label="Back" onPress={() => router.back()} icon="arrow-left" />
      <View style={{ marginTop: 26 }}><ForgeHeader eyebrow="Delivery" title="GitHub & builds." subtitle="Use the connected GitHub account to publish the current brief and start repository workflows. Forge never hides a failed push or build." /></View>
      {repositories.isLoading ? <ActivityIndicator color={colors.primary} /> : repositories.isError ? <View style={[styles.error, { backgroundColor: colors.secondary }]}><Feather name="alert-circle" size={17} color={colors.destructive} /><Text style={[styles.errorText, { color: colors.foreground }]}>GitHub could not be reached. Check the connection and try again.</Text></View> : (
        <>
          <Text style={[styles.label, { color: colors.foreground }]}>Repository</Text>
          <View style={styles.repoList}>
            {repositories.data?.repositories.map((item) => (
              <Pressable key={item.id} onPress={() => { setSelectedRepo(item.fullName); setBranch(item.defaultBranch); setWorkflowId(''); }} style={[styles.repo, { borderColor: (selectedRepo || repositories.data?.repositories[0]?.fullName) === item.fullName ? colors.primary : colors.border, backgroundColor: (selectedRepo || repositories.data?.repositories[0]?.fullName) === item.fullName ? colors.secondary : colors.card }]}>
                <View style={[styles.repoIcon, { backgroundColor: colors.accent }]}><Feather name={item.private ? 'lock' : 'github'} size={16} color={colors.accentForeground} /></View>
                <View style={styles.repoMeta}><Text style={[styles.repoName, { color: colors.foreground }]}>{item.fullName}</Text><Text style={[styles.repoDetails, { color: colors.mutedForeground }]}>{item.private ? 'Private' : 'Public'} · default {item.defaultBranch}</Text></View>
                <Feather name="check-circle" size={17} color={(selectedRepo || repositories.data?.repositories[0]?.fullName) === item.fullName ? colors.primary : colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
          {!repo ? <Text style={[styles.empty, { color: colors.mutedForeground }]}>No repositories are available to this GitHub connection.</Text> : null}
          <Text style={[styles.label, { color: colors.foreground }]}>Branch</Text>
          <Field value={effectiveBranch} onChangeText={setBranch} placeholder="main" />
          <Text style={[styles.label, { color: colors.foreground }]}>Commit message</Text>
          <Field value={message} onChangeText={setMessage} placeholder="Forge: publish build brief" />
          <View style={styles.actions}><PrimaryButton label="Push current brief" onPress={pushBrief} loading={push.isPending} disabled={!repo || !project} icon="upload-cloud" /><GhostButton label="Open repository" onPress={() => repo?.htmlUrl ? void Linking.openURL(repo.htmlUrl) : undefined} icon="external-link" /></View>
          <Text style={[styles.label, { color: colors.foreground }]}>Actions workflow</Text>
          {workflows.isLoading ? <ActivityIndicator color={colors.primary} /> : workflows.data?.workflows.length ? <View style={styles.repoList}>{workflows.data.workflows.map((workflow) => <Pressable key={workflow.id} onPress={() => setWorkflowId(String(workflow.id))} style={[styles.workflow, { borderColor: workflowId === String(workflow.id) ? colors.primary : colors.border, backgroundColor: workflowId === String(workflow.id) ? colors.secondary : colors.card }]}><View style={styles.repoMeta}><Text style={[styles.repoName, { color: colors.foreground }]}>{workflow.name}</Text><Text style={[styles.repoDetails, { color: colors.mutedForeground }]}>{workflow.path} · {workflow.state}</Text></View><Tag label={workflowId === String(workflow.id) ? 'SELECTED' : 'WORKFLOW'} tone={workflowId === String(workflow.id) ? 'green' : 'muted'} /></Pressable>)}</View> : <Text style={[styles.empty, { color: colors.mutedForeground }]}>No workflows were returned. The workflow must declare workflow_dispatch before Forge can start it.</Text>}
          <PrimaryButton label="Start GitHub build" onPress={startBuild} loading={dispatch.isPending} disabled={!repo || !workflows.data?.workflows.length} icon="play-circle" />
          {runs.data?.runs.length ? <><Text style={[styles.label, { color: colors.foreground }]}>Recent runs</Text>{runs.data.runs.map((run) => <Pressable key={run.id} onPress={() => void Linking.openURL(run.htmlUrl)} style={[styles.run, { borderColor: colors.border }]}><View style={styles.repoMeta}><Text style={[styles.repoName, { color: colors.foreground }]}>{run.name}</Text><Text style={[styles.repoDetails, { color: colors.mutedForeground }]}>{run.status}{run.conclusion ? ` · ${run.conclusion}` : ''}</Text></View><Feather name="external-link" size={16} color={colors.primary} /></Pressable>)}</> : null}
          {status ? <View style={[styles.notice, { backgroundColor: colors.accent }]}><Feather name="info" size={16} color={colors.accentForeground} /><Text style={[styles.noticeText, { color: colors.foreground }]}>{status}</Text></View> : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', marginTop: 18, marginBottom: 8 },
  repoList: { gap: 9 },
  repo: { borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  repoIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  repoMeta: { flex: 1, gap: 4 },
  repoName: { fontSize: 14, fontWeight: '700' },
  repoDetails: { fontSize: 11 },
  workflow: { borderWidth: 1, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  actions: { gap: 10, marginTop: 16 },
  run: { borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  empty: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  error: { borderRadius: 15, padding: 14, flexDirection: 'row', gap: 9 },
  errorText: { flex: 1, fontSize: 13, lineHeight: 19 },
  notice: { marginTop: 16, borderRadius: 15, padding: 14, flexDirection: 'row', gap: 10 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19 },
});