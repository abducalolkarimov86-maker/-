import { useState, type FormEvent } from 'react';
import {
  Check,
  Copy,
  Minus,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { SHOP_DC_PHONE, SHOP_OWNER_NAME, UC_PACKAGES } from '../shared/catalog.ts';
import { formatOrderStatus, TRANSLATIONS } from '../i18n.ts';
import type { CartItem, Language, ShopPublicConfig, UcOrder } from '../types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  items: CartItem[];
  onUpdateQty: (packageId: string, delta: number) => void;
  onRemoveItem: (packageId: string) => void;
  onClearCart: () => void;
  config: ShopPublicConfig;
  onOrderCreated: (order: Omit<UcOrder, 'telegramUsername'>) => void;
  onOpenBotWithOrder: (orderId: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  lang,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  config,
  onOrderCreated,
  onOpenBotWithOrder,
}: CartDrawerProps) {
  const t = TRANSLATIONS[lang];
  const [playerId, setPlayerId] = useState('');
  const [playerNickname, setPlayerNickname] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Omit<UcOrder, 'telegramUsername'> | null>(null);

  if (!isOpen) return null;

  const resolvedItems = items
    .map((item) => {
      const pkg = UC_PACKAGES.find((p) => p.id === item.packageId);
      return pkg ? { ...item, pkg } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const totalUc = resolvedItems.reduce((sum, x) => sum + x.pkg.ucAmount * x.quantity, 0);
  const totalTjs = resolvedItems.reduce((sum, x) => sum + x.pkg.priceTjs * x.quantity, 0);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(config.dcPhone || SHOP_DC_PHONE);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 1800);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  const handleCopyOrderId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 1800);
    } catch {
      // Ignore
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanedId = playerId.trim();
    if (!/^\d{8,13}$/.test(cleanedId)) {
      setErrorMsg(
        lang === 'tj'
          ? 'Player ID бояд аз 8 то 13 рақам иборат бошад.'
          : 'Player ID должен содержать от 8 до 13 цифр.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: cleanedId,
          playerNickname: playerNickname.trim(),
          telegramUsername: telegramUsername.trim(),
          items: resolvedItems.map((i) => ({
            packageId: i.packageId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Ошибка при создании заказа.');
        return;
      }

      setCreatedOrder(data.order);
      onOrderCreated(data.order);
      onClearCart();
    } catch {
      setErrorMsg(
        lang === 'tj'
          ? 'Хатои пайвастшавӣ ба сервер.'
          : 'Ошибка соединения с сервером.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const buildTelegramShareUrl = (order: Omit<UcOrder, 'telegramUsername'>) => {
    const summary = `Заказ ${order.orderId} | Player ID: ${order.playerId} | ${order.totalUc} UC (${order.totalTjs} TJS) | DC ${SHOP_DC_PHONE} (${SHOP_OWNER_NAME})`;
    if (config.telegramBotUsername) {
      return `https://t.me/${config.telegramBotUsername}?start=${encodeURIComponent(order.orderId)}`;
    }
    return `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(summary)}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t.cartTitle}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-white/12 bg-gradient-to-b from-[#131720] to-[#0B0D12] text-[#F4F4F5] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#161B26] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4A12A]/40 bg-[#D4A12A]/15 text-[#F0B938]">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <h2 className="font-display text-xl font-semibold tracking-wide">
              {createdOrder ? t.receiptTitle : t.cartTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть корзину"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 bg-[#0B0D12] text-[#9CA3AF] transition-colors hover:border-white/25 hover:text-white focus-visible:outline-2 focus-visible:outline-[#D4A12A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {createdOrder ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-[#D4A12A]/45 bg-[#151A24] p-5">
                <p className="text-sm text-[#9CA3AF]">{t.receiptSubtitle}</p>
                <div className="mt-4 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="block text-xs text-[#9CA3AF]">{t.receiptOrderId}</span>
                    <span className="font-mono text-xl font-bold tabular-nums text-[#F0B938]">
                      {createdOrder.orderId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(createdOrder.orderId)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#07080B] px-3 py-2 text-xs font-medium text-[#F4F4F5] transition-colors hover:border-[#D4A12A]/60 whitespace-nowrap shrink-0"
                  >
                    {copiedOrder ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#F0B938]" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        {t.copyNumber}
                      </>
                    )}
                  </button>
                </div>

                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#9CA3AF]">Player ID</dt>
                    <dd className="font-mono tabular-nums text-white">{createdOrder.playerId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#9CA3AF]">{t.cartTotalUc}</dt>
                    <dd className="font-mono tabular-nums text-white">{createdOrder.totalUc} UC</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#9CA3AF]">{t.cartTotalTjs}</dt>
                    <dd className="font-mono font-bold tabular-nums text-[#F0B938]">
                      {createdOrder.totalTjs} TJS
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#9CA3AF]">{t.recipientLabel}</dt>
                    <dd className="text-white">{createdOrder.dcRecipientName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#9CA3AF]">{t.phoneLabel}</dt>
                    <dd className="font-mono tabular-nums text-white">
                      {createdOrder.dcRecipientPhone}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#9CA3AF]">Статус</dt>
                    <dd className="font-medium text-[#F0B938]">
                      {formatOrderStatus(createdOrder.status, lang)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-[#D4A12A]/35 bg-gradient-to-br from-[#1C202B] via-[#131720] to-[#0B0D12] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-xs text-[#9CA3AF]">{t.phoneLabel}</span>
                    <span className="font-mono text-2xl font-bold tabular-nums text-white">
                      {SHOP_DC_PHONE}
                    </span>
                    <span className="mt-1 block text-xs text-[#D4A12A]">
                      {SHOP_OWNER_NAME}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#E5B33B] to-[#C8921B] px-4 py-2.5 text-sm font-bold text-[#07080B] transition-transform hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0"
                  >
                    {copiedPhone ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedPhone ? t.copied : t.copyNumber}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const id = createdOrder.orderId;
                    onClose();
                    onOpenBotWithOrder(id);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#E5B33B] to-[#C8921B] px-4 py-3 text-sm font-bold text-[#07080B] transition-transform hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0"
                >
                  <Send className="h-4 w-4" />
                  {t.receiptSendToBot}
                </button>
                <a
                  href={buildTelegramShareUrl(createdOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#151A24] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-[#D4A12A]/60 whitespace-nowrap shrink-0"
                >
                  {t.botShareTelegram}
                </a>
                <button
                  type="button"
                  onClick={() => setCreatedOrder(null)}
                  className="w-full py-2.5 text-sm text-[#9CA3AF] transition-colors hover:text-white"
                >
                  {t.receiptNewOrder}
                </button>
              </div>
            </div>
          ) : resolvedItems.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-[#9CA3AF]/60" strokeWidth={1.5} />
              <p className="text-base font-medium text-white">{t.cartEmpty}</p>
              <p className="mt-1 max-w-xs text-sm text-[#9CA3AF]">{t.cartEmptyHint}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#12161F]">
                {resolvedItems.map(({ pkg, quantity }) => (
                  <li key={pkg.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold tabular-nums text-white">
                        {pkg.ucAmount} UC
                      </p>
                      <p className="text-xs text-[#9CA3AF] tabular-nums">
                        {pkg.priceTjs} TJS × {quantity} = {pkg.priceTjs * quantity} TJS
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(pkg.id, -1)}
                        aria-label={`Уменьшить ${pkg.ucAmount} UC`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-[#07080B] text-white transition-colors hover:border-white/30"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono text-sm tabular-nums text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(pkg.id, 1)}
                        aria-label={`Увеличить ${pkg.ucAmount} UC`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-[#07080B] text-white transition-colors hover:border-white/30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(pkg.id)}
                        aria-label={`Удалить ${pkg.ucAmount} UC`}
                        className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-[#D4A12A]/30 bg-gradient-to-br from-[#191E29] to-[#11141C] p-4">
                <div className="flex items-center justify-between text-sm text-[#9CA3AF]">
                  <span>{t.cartTotalUc}</span>
                  <span className="font-mono font-semibold tabular-nums text-white">
                    {totalUc} UC
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                  <span className="text-sm font-medium text-white">{t.cartTotalTjs}</span>
                  <span className="font-mono text-xl font-bold tabular-nums text-[#F0B938]">
                    {totalTjs} TJS
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-[#9CA3AF]">
                  <span>
                    DC ({SHOP_OWNER_NAME}):{' '}
                    <strong className="font-mono tabular-nums text-white">
                      {SHOP_DC_PHONE}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="font-semibold text-[#F0B938] hover:underline whitespace-nowrap shrink-0"
                  >
                    {copiedPhone ? t.copied : t.copyNumber}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="checkout-player-id"
                    className="block text-sm font-medium text-white"
                  >
                    {t.playerIdLabel}
                  </label>
                  <input
                    id="checkout-player-id"
                    type="text"
                    inputMode="numeric"
                    required
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value.replace(/[^\d]/g, '').slice(0, 13))}
                    placeholder={t.playerIdPlaceholder}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#07080B] px-3.5 py-2.5 font-mono text-sm tabular-nums text-white placeholder-[#6B7280] focus:border-[#D4A12A] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-[#9CA3AF]">{t.playerIdHint}</p>
                </div>

                <div>
                  <label
                    htmlFor="checkout-nickname"
                    className="block text-sm font-medium text-white"
                  >
                    {t.nicknameLabel}
                  </label>
                  <input
                    id="checkout-nickname"
                    type="text"
                    value={playerNickname}
                    onChange={(e) => setPlayerNickname(e.target.value.slice(0, 40))}
                    placeholder={t.nicknamePlaceholder}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#07080B] px-3.5 py-2.5 text-sm text-white placeholder-[#6B7280] focus:border-[#D4A12A] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-telegram"
                    className="block text-sm font-medium text-white"
                  >
                    {t.telegramLabel}
                  </label>
                  <input
                    id="checkout-telegram"
                    type="text"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value.slice(0, 40))}
                    placeholder={t.telegramPlaceholder}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#07080B] px-3.5 py-2.5 text-sm text-white placeholder-[#6B7280] focus:border-[#D4A12A] focus:outline-none"
                  />
                </div>

                {errorMsg && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
                  >
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#E5B33B] to-[#C8921B] px-5 py-3 text-sm font-bold text-[#07080B] shadow-[0_8px_24px_-6px_rgba(212,161,42,0.4)] transition-transform hover:brightness-110 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap shrink-0"
                >
                  {submitting ? t.submittingOrder : t.submitOrder}
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
