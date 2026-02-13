import { createContext, type ReactNode, useContext } from 'react';
import { useSettings } from '../lib/hooks/useSettings';

interface SettingsContextValue {
  frontmatterEnabled: boolean;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
  frontmatterEnabled: true,
  isLoading: true,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useSettings();

  const value: SettingsContextValue = {
    frontmatterEnabled: data?.frontmatterEnabled ?? true,
    isLoading,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useFrontmatterEnabled(): boolean {
  const ctx = useContext(SettingsContext);
  return ctx.frontmatterEnabled;
}

export function useSettingsLoading(): boolean {
  const ctx = useContext(SettingsContext);
  return ctx.isLoading;
}
