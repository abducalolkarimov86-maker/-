import { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import type { Language } from '../types.ts';

interface PWAInstallButtonProps {
  lang: Language;
}

export function PWAInstallButton({ lang }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const label = lang === 'tj' ? 'Насб кардан дар телефон' : 'Установить приложение';

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex items-center gap-2 rounded-lg border border-[#D4A12A]/45 bg-[#121620] px-4 py-2.5 text-xs font-semibold text-[#F0B938] transition-colors hover:border-[#F0B938] hover:bg-[#171C28] whitespace-nowrap shrink-0"
      >
        <Download className="h-4 w-4" />
        <span>{label}</span>
      </button>
    );
  }

  // Provide iOS Safari or desktop fallback instructions when native prompt isn't emitted yet
  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#121620] px-4 py-2.5 text-xs font-medium text-[#E5E7EB] transition-colors hover:border-[#D4A12A]/60 hover:text-white whitespace-nowrap shrink-0"
      >
        <Download className="h-4 w-4 text-[#F0B938]" />
        <span>{label}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div className="w-full max-w-md rounded-xl border border-white/15 bg-[#131720] p-6 text-[#F4F4F5] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <h3 className="font-display text-xl font-semibold text-white">{label}</h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Закрыть"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-[#9CA3AF] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#D1D5DB]">
                <p className="flex items-center gap-2 text-[#F0B938]">
                  <Share className="h-4 w-4 shrink-0" />
                  <span>
                    {lang === 'tj'
                      ? 'Барои насб дар iPhone / iPad (Safari):'
                      : 'Для установки на iPhone / iPad (Safari):'}
                  </span>
                </p>
                <ol className="list-decimal space-y-1.5 pl-5">
                  <li>
                    {lang === 'tj'
                      ? 'Дар поёни Safari тугмаи «Поделиться» (мураббаъ бо тирча)-ро пахш кунед.'
                      : 'Нажмите кнопку «Поделиться» в нижней панели Safari.'}
                  </li>
                  <li>
                    {lang === 'tj'
                      ? 'Ба поён лағжида, «На экран Домой»-ро интихоб кунед.'
                      : 'Выберите пункт «На экран Домой» (Add to Home Screen).'}
                  </li>
                  <li>
                    {lang === 'tj'
                      ? 'Тугмаи «Добавить»-ро пахш кунед.'
                      : 'Нажмите «Добавить» — иконка появится на главном экране.'}
                  </li>
                </ol>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#D1D5DB]">
                <p>
                  {lang === 'tj'
                    ? 'Барои насб дар Android (Chrome) ё компютер:'
                    : 'Для установки на Android (Chrome) или компьютер:'}
                </p>
                <ol className="list-decimal space-y-1.5 pl-5">
                  <li>
                    {lang === 'tj'
                      ? 'Менюи браузерро (⋮) кушоед.'
                      : 'Откройте меню браузера (три точки в углу экрана).'}
                  </li>
                  <li>
                    {lang === 'tj'
                      ? '«Установить приложение» ё «Добавить на главный экран»-ро интихоб кунед.'
                      : 'Нажмите «Установить приложение» или «Добавить на главный экран».'}
                  </li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full rounded-lg bg-[#D4A12A] py-2.5 text-sm font-bold text-[#07080B] transition-colors hover:bg-[#E5B33B]"
            >
              {lang === 'tj' ? 'Фаҳмо' : 'Понятно'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
