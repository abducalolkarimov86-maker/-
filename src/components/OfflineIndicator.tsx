import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall.ts';
import type { Language } from '../types.ts';

interface OfflineIndicatorProps {
  lang: Language;
}

export function OfflineIndicator({ lang }: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-[#D4A12A]/50 bg-[#14171E] px-3.5 py-2 text-xs font-medium text-[#F0B938] shadow-xl"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>
        {lang === 'tj'
          ? 'Ҳолати офлайн — нархҳои захирашуда'
          : 'Офлайн-режим — показаны сохранённые цены'}
      </span>
    </div>
  );
}
