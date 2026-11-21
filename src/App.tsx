import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Bot,
  Check,
  Copy,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  SHOP_DC_PHONE,
  SHOP_OWNER_NAME,
  UC_PACKAGES,
} from './shared/catalog.ts';
import { formatOrderStatus, TRANSLATIONS } from './i18n.ts';
import { HERO_IMAGE_URL, PACKAGE_IMAGE_URLS } from './assetsMap.ts';
import { ResilientImage } from './components/ResilientImage.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { TelegramBotPanel } from './components/TelegramBotPanel.tsx';
import { PWAInstallButton } from './components/PWAInstallButton.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import type {
  CartItem,
  Language,
  PackageCategory,
  ShopPublicConfig,
  UcOrder,
} from './types.ts';

export default function App() {
  const [lang, setLang] = useState<Language>('ru');
  const [category, setCategory] = useState<PackageCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [copiedDc, setCopiedDc] = useState(false);
  const [config, setConfig] = useState<ShopPublicConfig>({
    ownerName: SHOP_OWNER_NAME,
    dcPhone: SHOP_DC_PHONE,
    telegramBotConfigured: false,
    telegramBotUsername: '',
  });

  // Order lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResults, setLookupResults] = useState<Array<Omit<UcOrder, 'telegramUsername'>> | null>(
    null
  );

  // Bot external trigger
  const [botPrompt, setBotPrompt] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.ownerName === 'string') {
          setConfig(data);
        }
      })
      .catch(() => {
        // Keep defaults if offline
      });
  }, []);

  const filteredPackages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return UC_PACKAGES.filter((pkg) => {
      if (category !== 'all' && pkg.category !== category) return false;
      if (!q) return true;
      return (
        String(pkg.ucAmount).includes(q) ||
        pkg.tagRu.toLowerCase().includes(q) ||
        pkg.tagTj.toLowerCase().includes(q)
      );
    });
  }, [category, searchQuery]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (packageId: string, openDrawer = false) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.packageId === packageId);
      if (existing) {
        return prev.map((i) =>
          i.packageId === packageId ? { ...i, quantity: Math.min(50, i.quantity + 1) } : i
        );
      }
      return [...prev, { packageId, quantity: 1 }];
    });
    if (openDrawer) {
      setCartOpen(true);
    }
  };

  const updateCartQty = (packageId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.packageId === packageId
            ? { ...item, quantity: Math.min(50, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (packageId: string) => {
    setCart((prev) => prev.filter((item) => item.packageId !== packageId));
  };

  const handleCopyDc = async () => {
    try {
      await navigator.clipboard.writeText(config.dcPhone || SHOP_DC_PHONE);
      setCopiedDc(true);
      setTimeout(() => setCopiedDc(false), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const handleOrderLookup = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = lookupQuery.trim();
    setLookupError('');
    if (cleaned.length < 4) {
      setLookupError(t.lookupEmpty);
      return;
    }

    setLookupLoading(true);
    try {
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || t.lookupEmpty);
        setLookupResults(null);
        return;
      }
      setLookupResults(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setLookupError('Ошибка сети при проверке заказа.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleOpenBotWithOrder = (orderId: string) => {
    setBotPrompt(orderId);
    const botSection = document.getElementById('telegram-bot');
    if (botSection) {
      botSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div id="top" className="min-h-screen bg-[#07080B] text-[#F4F4F5]">
      {/* Top Bar Contract: 1 row, 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080B]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <a
            href="#top"
            className="font-display text-xl font-bold tracking-wide text-white whitespace-nowrap shrink-0"
          >
            ABDUJALOL UC
          </a>

          <nav
            aria-label="Основная навигация"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#9CA3AF]"
          >
            <a
              href="#catalog"
              className="transition-colors hover:text-white hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.navCatalog}
            </a>
            <a
              href="#payment"
              className="transition-colors hover:text-white hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.navPayment}
            </a>
            <a
              href="#telegram-bot"
              className="transition-colors hover:text-white hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.navBot}
            </a>
            <a
              href="#order-check"
              className="transition-colors hover:text-white hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.navCheck}
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#E5B33B] to-[#C8921B] px-4 py-2 text-sm font-bold text-[#07080B] shadow-[0_6px_20px_-4px_rgba(212,161,42,0.45)] transition-transform duration-150 hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                {t.cartButton}
                {totalCartCount > 0 ? ` · ${totalCartCount}` : ''}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Section 1: Tactical Luxury Hero + 4-Column Summary Strip */}
        <section className="relative overflow-hidden border-b border-white/10 tactical-grid-bg">
          <div className="pointer-events-none absolute inset-0 gold-aura" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-20">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div
                className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-[#11141C] p-1"
                role="group"
                aria-label="Выбор языка"
              >
                <button
                  type="button"
                  onClick={() => setLang('ru')}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    lang === 'ru'
                      ? 'bg-[#D4A12A] text-[#07080B]'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  Русский
                </button>
                <button
                  type="button"
                  onClick={() => setLang('tj')}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    lang === 'tj'
                      ? 'bg-[#D4A12A] text-[#07080B]'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  Тоҷикӣ
                </button>
              </div>
              <PWAInstallButton lang={lang} />
            </div>

            <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
              <div className="flex flex-col justify-center lg:col-span-6">
                <p className="text-sm font-semibold tracking-wide text-[#F0B938]">
                  PUBG Mobile · {SHOP_OWNER_NAME} · DC {SHOP_DC_PHONE}
                </p>
                <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-[1.04] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                  {t.heroTitle}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-[#A1A7B3]">
                  {t.heroSubtitle}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalog"
                    className="inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-[#F0B938] to-[#C8921B] px-7 py-3.5 text-sm font-bold text-[#07080B] shadow-[0_12px_32px_-8px_rgba(212,161,42,0.5)] transition-transform duration-150 hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0"
                  >
                    {t.heroPrimaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#telegram-bot"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#121620] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-[#D4A12A]/70 hover:bg-[#171C28] whitespace-nowrap shrink-0"
                  >
                    {t.heroSecondaryCta}
                  </a>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative h-72 w-full overflow-hidden rounded-xl border border-[#D4A12A]/35 bg-[#11141C] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.9)] sm:h-96 lg:h-full lg:min-h-[410px]">
                  <ResilientImage
                    src={HERO_IMAGE_URL}
                    alt="PUBG Mobile UC — золотые монеты и кейс снабжения"
                    fallbackLabel="ABDUJALOL UC SHOP"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080B]/95 via-[#07080B]/30 to-transparent" />

                  {/* Precision corner framing brackets */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l border-t border-[#F0B938]/70"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r border-t border-[#F0B938]/70"
                  />

                  <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-4">
                    <div>
                      <p className="text-xs font-medium text-[#F0B938]">Dushanbe City (DC)</p>
                      <p className="font-mono text-2xl font-bold tabular-nums tracking-tight text-white">
                        {SHOP_DC_PHONE}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#9CA3AF]">{t.stripOwnerLabel}</p>
                      <p className="font-display text-lg font-semibold tracking-wide text-white">
                        {SHOP_OWNER_NAME}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-column summary strip below Hero split */}
            <div className="mt-12 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-gradient-to-b from-[#151823] to-[#10131B] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D4A12A]/30 bg-[#D4A12A]/10 text-[#F0B938]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-[#9CA3AF]">{t.stripOwnerLabel}</span>
                  <p className="mt-1 font-display text-lg font-semibold text-white">
                    {config.ownerName}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#D4A12A]/30 bg-gradient-to-b from-[#171B27] to-[#10131B] p-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D4A12A]/30 bg-[#D4A12A]/10 text-[#F0B938]">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#9CA3AF]">{t.stripDcLabel}</span>
                    <p className="mt-1 font-mono text-lg font-bold tabular-nums text-[#F0B938]">
                      {config.dcPhone}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyDc}
                  aria-label={t.copyNumber}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#07080B] px-3 py-2 text-xs font-medium text-white transition-colors hover:border-[#D4A12A]/70 whitespace-nowrap shrink-0"
                >
                  {copiedDc ? (
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

              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-gradient-to-b from-[#151823] to-[#10131B] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D4A12A]/30 bg-[#D4A12A]/10 text-[#F0B938]">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-[#9CA3AF]">{t.stripSpeedLabel}</span>
                  <p className="mt-1 text-base font-semibold text-white">
                    {t.stripSpeedValue}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-gradient-to-b from-[#151823] to-[#10131B] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D4A12A]/30 bg-[#D4A12A]/10 text-[#F0B938]">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-[#9CA3AF]">{t.stripBotLabel}</span>
                  <p className="mt-1 text-base font-semibold text-white">
                    {t.stripBotValue}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Featured UC Collection */}
        <section id="catalog" className="border-b border-white/10 bg-[#090B0F] py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
                  {t.catalogTitle}
                </h2>
                <p className="mt-3 max-w-2xl text-base text-[#9CA3AF]">
                  {t.catalogSubtitle}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div
                  className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-[#121620] p-1"
                  role="tablist"
                  aria-label="Фильтр пакетов UC"
                >
                  {(
                    [
                      ['all', t.filterAll],
                      ['starter', t.filterStarter],
                      ['popular', t.filterPopular],
                      ['elite', t.filterElite],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={category === key}
                      onClick={() => setCategory(key)}
                      className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        category === key
                          ? 'bg-[#D4A12A] text-[#07080B]'
                          : 'text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                    className="w-full rounded-lg border border-white/12 bg-[#121620] py-2 pl-9 pr-3.5 text-sm text-white placeholder-[#6B7280] focus:border-[#D4A12A] focus:outline-none sm:w-56"
                  />
                </div>
              </div>
            </div>

            {filteredPackages.length === 0 ? (
              <div className="mt-10 rounded-xl border border-white/10 bg-[#121620] p-10 text-center">
                <p className="text-base text-[#9CA3AF]">{t.emptySearch}</p>
              </div>
            ) : (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPackages.map((pkg) => {
                  const inCartItem = cart.find((c) => c.packageId === pkg.id);
                  const qtyInCart = inCartItem?.quantity ?? 0;
                  const isFeatured = pkg.ucAmount === 660 || pkg.ucAmount === 1800;

                  return (
                    <motion.article
                      key={pkg.id}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className={`group flex flex-col overflow-hidden rounded-xl border bg-gradient-to-b from-[#161A25] to-[#0F1219] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.85)] transition-colors ${
                        isFeatured
                          ? 'border-[#D4A12A]/45 hover:border-[#F0B938]'
                          : 'border-white/12 hover:border-[#D4A12A]/50'
                      }`}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#07080B]">
                        <ResilientImage
                          src={PACKAGE_IMAGE_URLS[pkg.imageTier]}
                          alt={`${pkg.ucAmount} UC для PUBG Mobile`}
                          fallbackLabel={`${pkg.ucAmount} UC`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#161A25] via-transparent to-transparent opacity-60"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                            <span>PUBG Mobile</span>
                            <span aria-hidden="true">·</span>
                            <span className={isFeatured ? 'font-semibold text-[#F0B938]' : ''}>
                              {lang === 'tj' ? pkg.tagTj : pkg.tagRu}
                            </span>
                          </div>

                          <div className="mt-2.5 flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                            <h3 className="font-display text-3xl font-bold tabular-nums text-white">
                              {pkg.ucAmount} UC
                            </h3>
                            <span className="font-mono text-2xl font-bold tabular-nums text-[#F0B938]">
                              {pkg.priceTjs} TJS
                            </span>
                          </div>

                          <p className="mt-2.5 font-mono text-xs tabular-nums text-[#A1A7B3]">
                            {pkg.bonusUc > 0
                              ? `${pkg.baseUc} + ${pkg.bonusUc} ${t.bonusLabel}`
                              : `${pkg.baseUc} UC`}
                          </p>

                          <p className="mt-2.5 text-sm leading-relaxed text-[#9CA3AF]">
                            {lang === 'tj' ? pkg.descriptionTj : pkg.descriptionRu}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => addToCart(pkg.id, true)}
                            className="inline-flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-[#E5B33B] to-[#C8921B] px-4 py-2.5 text-sm font-bold text-[#07080B] shadow-[0_8px_20px_-6px_rgba(212,161,42,0.4)] transition-transform duration-150 hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0"
                          >
                            {t.buyNow}
                          </button>
                          <button
                            type="button"
                            onClick={() => addToCart(pkg.id, false)}
                            aria-label={`${t.addToCart} ${pkg.ucAmount} UC`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-[#07080B] px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#D4A12A]/70 whitespace-nowrap shrink-0"
                          >
                            <Plus className="h-4 w-4 text-[#F0B938]" />
                            <span>{qtyInCart > 0 ? `${qtyInCart}` : t.addToCart}</span>
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Bespoke DC Payment Card, Order Check & Telegram Bot Console */}
        <section id="payment" className="relative py-16 lg:py-24 tactical-grid-bg">
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Left 6 cols: Metal DC Card + Steps + Order Verification */}
              <div className="space-y-8 lg:col-span-6">
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl">
                    {t.paymentSectionTitle}
                  </h2>
                  <p className="mt-2.5 text-base text-[#9CA3AF]">
                    {t.paymentSectionSubtitle}
                  </p>
                </div>

                {/* Bespoke Metal DC Payment Card */}
                <div className="relative overflow-hidden rounded-xl border border-[#D4A12A]/45 bg-gradient-to-br from-[#1C212E] via-[#121620] to-[#080A0E] p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <p className="text-sm font-semibold text-[#F0B938]">{t.dcCardTitle}</p>
                    <span className="font-mono text-xs text-[#9CA3AF]">TJS · DUSHANBE CITY</span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="block text-xs text-[#9CA3AF]">{t.phoneLabel}</span>
                      <p className="mt-1 font-mono text-3xl font-bold tabular-nums tracking-tight text-white">
                        {config.dcPhone}
                      </p>
                      <span className="mt-3 block text-xs text-[#9CA3AF]">{t.recipientLabel}</span>
                      <p className="font-display text-xl font-semibold tracking-wide text-[#F0B938]">
                        {config.ownerName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyDc}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#E5B33B] to-[#C8921B] px-5 py-3 text-sm font-bold text-[#07080B] shadow-[0_8px_20px_-6px_rgba(212,161,42,0.45)] transition-transform hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0"
                    >
                      {copiedDc ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedDc ? t.copied : t.copyNumber}
                    </button>
                  </div>
                </div>

                {/* Editorial Steps */}
                <div className="divide-y divide-white/10 rounded-xl border border-white/12 bg-[#11141C]">
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-white">{t.step1Title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#9CA3AF]">{t.step1Desc}</p>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-white">{t.step2Title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#9CA3AF]">{t.step2Desc}</p>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-white">{t.step3Title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#9CA3AF]">{t.step3Desc}</p>
                  </div>
                </div>

                {/* Order Verification */}
                <div
                  id="order-check"
                  className="rounded-xl border border-white/12 bg-[#11141C] p-6"
                >
                  <h3 className="font-display text-xl font-semibold text-white">
                    {t.lookupTitle}
                  </h3>
                  <form onSubmit={handleOrderLookup} className="mt-4 flex gap-3">
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder={t.lookupPlaceholder}
                      aria-label={t.lookupPlaceholder}
                      className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#07080B] px-3.5 py-2.5 font-mono text-sm text-white placeholder-[#6B7280] focus:border-[#D4A12A] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={lookupLoading}
                      className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#E5B33B] to-[#C8921B] px-5 py-2.5 text-sm font-bold text-[#07080B] transition-transform hover:brightness-110 active:scale-[0.98] disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      {t.lookupButton}
                    </button>
                  </form>

                  {lookupError && (
                    <p className="mt-3 text-sm text-red-300">{lookupError}</p>
                  )}

                  {lookupResults && lookupResults.length === 0 && (
                    <p className="mt-4 text-sm text-[#9CA3AF]">{t.lookupNotFound}</p>
                  )}

                  {lookupResults && lookupResults.length > 0 && (
                    <ul className="mt-4 divide-y divide-white/10 rounded-lg border border-white/12 bg-[#07080B]">
                      {lookupResults.map((order) => (
                        <li
                          key={order.orderId}
                          className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
                        >
                          <div>
                            <p className="font-mono font-bold tabular-nums text-[#F0B938]">
                              {order.orderId}
                            </p>
                            <p className="mt-0.5 text-xs text-[#9CA3AF] tabular-nums">
                              ID: {order.playerId} · {order.totalUc} UC · {order.totalTjs} TJS
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-white">
                            {formatOrderStatus(order.status, lang)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right 6 cols: Interactive Telegram Support Bot */}
              <div id="telegram-bot" className="space-y-6 lg:col-span-6">
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl">
                    {t.botTitle}
                  </h2>
                  <p className="mt-2.5 text-base text-[#9CA3AF]">{t.botSubtitle}</p>
                </div>

                <TelegramBotPanel
                  lang={lang}
                  config={config}
                  externalPrompt={botPrompt}
                  onConsumeExternalPrompt={() => setBotPrompt(null)}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#050608] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-bold tracking-wide text-white">
              ABDUJALOL UC · {SHOP_OWNER_NAME}
            </p>
            <p className="mt-1 text-sm text-[#9CA3AF]">{t.footerTagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#9CA3AF]">
            <a href="#catalog" className="hover:text-white whitespace-nowrap shrink-0">
              {t.navCatalog}
            </a>
            <a href="#payment" className="hover:text-white whitespace-nowrap shrink-0">
              {t.navPayment}
            </a>
            <a href="#telegram-bot" className="hover:text-white whitespace-nowrap shrink-0">
              {t.navBot}
            </a>
            <a href="#order-check" className="hover:text-white whitespace-nowrap shrink-0">
              {t.navCheck}
            </a>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        lang={lang}
        items={cart}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeCartItem}
        onClearCart={() => setCart([])}
        config={config}
        onOrderCreated={(order) => {
          setLookupQuery(order.orderId);
          setLookupResults([order]);
        }}
        onOpenBotWithOrder={handleOpenBotWithOrder}
      />

      <OfflineIndicator lang={lang} />
    </div>
  );
}
