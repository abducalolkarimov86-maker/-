import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, ExternalLink, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { SHOP_DC_PHONE, SHOP_OWNER_NAME } from '../shared/catalog.ts';
import { TRANSLATIONS } from '../i18n.ts';
import type { BotReply, Language, ShopPublicConfig } from '../types.ts';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  quickActions?: Array<{ label: string; command: string }>;
}

interface TelegramBotPanelProps {
  lang: Language;
  config: ShopPublicConfig;
  externalPrompt?: string | null;
  onConsumeExternalPrompt?: () => void;
}

export function TelegramBotPanel({
  lang,
  config,
  externalPrompt,
  onConsumeExternalPrompt,
}: TelegramBotPanelProps) {
  const t = TRANSLATIONS[lang];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: t.botGreeting,
      quickActions:
        lang === 'tj'
          ? [
              { label: 'Нархҳои UC', command: '/prices' },
              { label: 'Тарзи пардохт бо DC', command: '/pay' },
              { label: 'Player ID куҷост?', command: '/id' },
              { label: 'Тамос бо Абдучалол', command: '/contact' },
            ]
          : [
              { label: 'Цены на UC', command: '/prices' },
              { label: 'Как оплатить DC?', command: '/pay' },
              { label: 'Где найти Player ID?', command: '/id' },
              { label: 'Контакты владельца', command: '/contact' },
            ],
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'bot',
            text: TRANSLATIONS[lang].botGreeting,
            quickActions:
              lang === 'tj'
                ? [
                    { label: 'Нархҳои UC', command: '/prices' },
                    { label: 'Тарзи пардохт бо DC', command: '/pay' },
                    { label: 'Player ID куҷост?', command: '/id' },
                    { label: 'Тамос бо Абдучалол', command: '/contact' },
                  ]
                : [
                    { label: 'Цены на UC', command: '/prices' },
                    { label: 'Как оплатить DC?', command: '/pay' },
                    { label: 'Где найти Player ID?', command: '/id' },
                    { label: 'Контакты владельца', command: '/contact' },
                  ],
          },
        ];
      }
      return prev;
    });
  }, [lang]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessageToBot = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/bot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, lang }),
      });
      const data: BotReply = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: res.ok
            ? data.reply
            : lang === 'tj'
              ? 'Хато рух дод. Лутфан боз кӯшиш кунед.'
              : 'Не удалось получить ответ от бота. Попробуйте ещё раз.',
          quickActions: data.quickActions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          sender: 'bot',
          text:
            lang === 'tj'
              ? `Хатои пайвастшавӣ. Барои пардохт рақами DC: ${SHOP_DC_PHONE} (${SHOP_OWNER_NAME}).`
              : `Ошибка связи с сервером. Номер DC для оплаты: ${SHOP_DC_PHONE} (${SHOP_OWNER_NAME}).`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (externalPrompt) {
      void sendMessageToBot(externalPrompt);
      onConsumeExternalPrompt?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessageToBot(input);
  };

  const telegramHref = config.telegramBotUsername
    ? `https://t.me/${config.telegramBotUsername}`
    : `https://t.me/share/url?url=${encodeURIComponent(
        typeof window !== 'undefined' ? window.location.href : ''
      )}&text=${encodeURIComponent(
        `PUBG Mobile UC Shop — ${SHOP_OWNER_NAME} (DC: ${SHOP_DC_PHONE})`
      )}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/12 bg-gradient-to-b from-[#151822] to-[#0F1219] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#181C27] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D4A12A]/40 bg-[#D4A12A]/15 text-[#F0B938]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold tracking-wide text-white">
              {t.botTitle}
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              {config.telegramBotUsername
                ? `@${config.telegramBotUsername} · ${SHOP_OWNER_NAME}`
                : `${SHOP_OWNER_NAME} · DC ${SHOP_DC_PHONE}`}
            </p>
          </div>
        </div>

        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[#D4A12A]/40 bg-[#0B0D12] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-[#F0B938] hover:bg-[#141822] whitespace-nowrap shrink-0"
        >
          {t.botOpenTelegram}
          <ExternalLink className="h-3.5 w-3.5 text-[#F0B938]" />
        </a>
      </div>

      <div
        ref={listRef}
        className="flex h-96 flex-col gap-3.5 overflow-y-auto px-5 py-5"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[88%] whitespace-pre-line rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-[#F0B938] to-[#C8921B] font-semibold text-[#07080B] shadow-md'
                  : 'border border-white/10 bg-[#090B0F] text-[#E5E7EB]'
              }`}
            >
              {msg.text}
            </div>

            {msg.sender === 'bot' && msg.quickActions && msg.quickActions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {msg.quickActions.map((action) => (
                  <button
                    key={`${msg.id}-${action.command}`}
                    type="button"
                    onClick={() => void sendMessageToBot(action.command)}
                    className="rounded-lg border border-white/12 bg-[#1A1F2B] px-3 py-1.5 text-xs font-medium text-[#E5E7EB] transition-colors hover:border-[#D4A12A]/70 hover:text-white active:scale-[0.98] whitespace-nowrap shrink-0"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="self-start rounded-xl border border-white/10 bg-[#090B0F] px-4 py-2.5 text-xs text-[#9CA3AF]">
            ...
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-white/10 bg-[#0E1117] px-4 py-3.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.botInputPlaceholder}
          aria-label={t.botInputPlaceholder}
          className="min-w-0 flex-1 rounded-lg border border-white/12 bg-[#07080B] px-3.5 py-2.5 text-sm text-white placeholder-[#6B7280] focus:border-[#D4A12A] focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label={t.botSend}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#E5B33B] to-[#C8921B] px-4 text-sm font-bold text-[#07080B] transition-transform duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">{t.botSend}</span>
        </button>
      </form>
    </div>
  );
}
