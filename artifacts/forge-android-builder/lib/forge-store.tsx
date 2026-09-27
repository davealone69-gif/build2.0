import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Blueprint, LocalModelSettings, Project } from '@/lib/types';

const PROJECTS_KEY = '@forge/projects';
const SETTINGS_KEY = '@forge/local-model-settings';
const DEFAULT_SETTINGS: LocalModelSettings = {
  endpoint: 'http://127.0.0.1:11434',
  model: 'qwen2.5:3b',
};

type ForgeContextValue = {
  projects: Project[];
  settings: LocalModelSettings;
  ready: boolean;
  saveProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateSettings: (settings: LocalModelSettings) => Promise<void>;
  makeProject: (blueprint: Blueprint, prompt: string, answers: Project['answers'], modelMode: Project['modelMode']) => Project;
};

const ForgeContext = createContext<ForgeContextValue | null>(null);

export function ForgeProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<LocalModelSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(PROJECTS_KEY), AsyncStorage.getItem(SETTINGS_KEY)])
      .then(([storedProjects, storedSettings]) => {
        if (storedProjects) setProjects(JSON.parse(storedProjects) as Project[]);
        if (storedSettings) setSettings(JSON.parse(storedSettings) as LocalModelSettings);
      })
      .finally(() => setReady(true));
  }, []);

  const saveProject = async (project: Project) => {
    const next = [project, ...projects.filter((item) => item.id !== project.id)];
    setProjects(next);
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
  };

  const deleteProject = async (id: string) => {
    const next = projects.filter((project) => project.id !== id);
    setProjects(next);
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
  };

  const updateSettings = async (nextSettings: LocalModelSettings) => {
    setSettings(nextSettings);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  };

  const makeProject = (blueprint: Blueprint, prompt: string, answers: Project['answers'], modelMode: Project['modelMode']) => {
    const now = new Date().toISOString();
    return {
      ...blueprint,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prompt,
      answers,
      createdAt: now,
      modelMode,
    };
  };

  const value = useMemo(
    () => ({ projects, settings, ready, saveProject, deleteProject, updateSettings, makeProject }),
    [projects, settings, ready],
  );
  return <ForgeContext.Provider value={value}>{children}</ForgeContext.Provider>;
}

export function useForge() {
  const context = useContext(ForgeContext);
  if (!context) throw new Error('useForge must be used inside ForgeProvider');
  return context;
}