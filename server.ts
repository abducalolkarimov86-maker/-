import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  SHOP_DC_PHONE,
  SHOP_OWNER_NAME,
  UC_PACKAGES,
  findPackageById,
} from './src/shared/catalog.ts';
import type {
  BotReply,
  Language,
  OrderItemSummary,
  OrderStatus,
  UcOrder,
} from './src/types.ts';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const ORDERS_FILE = path.resolve(DATA_DIR, 'orders.json');

if (!ORDERS_FILE.startsWith(DATA_DIR + path.sep)) {
  throw new Error('Invalid orders storage path');
}

function ensureOrdersStore(): UcOrder[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let ordersStore: UcOrder[] = ensureOrdersStore();

function saveOrdersStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const trimmed = ordersStore.slice(-500);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(trimmed, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist orders:', err);
  }
}

function generateOrderId(): string {
  const num = crypto.randomInt(1000, 9999);
  const suffix = crypto.randomBytes(1).toString('hex').toUpperCase();
  return `UC-${num}${suffix}`;
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

function formatPricesMessage(lang: Language): string {
  const lines = UC_PACKAGES.map(
    (p) => `• ${p.ucAmount} UC — ${p.priceTjs} TJS${p.bonusUc > 0 ? ` (+${p.bonusUc} бонус)` : ''}`
  );
  if (lang === 'tj') {
    return [
      `Нархҳои UC дар мағозаи ${SHOP_OWNER_NAME}:`,
      '',
      ...lines,
      '',
      `Пардохт ба воситаи DC (Dushanbe City): ${SHOP_DC_PHONE}`,
      'Барои фармоиш Player ID-и худро дар сайт ворид кунед ё рақами UC-ро ба ман нависед.',
    ].join('\n');
  }
  return [
    `Актуальные цены на UC (${SHOP_OWNER_NAME}):`,
    '',
    ...lines,
    '',
    `Оплата через DC (Душанбе Сити): ${SHOP_DC_PHONE}`,
    'Чтобы оформить заказ, выберите пакет на сайте или напишите нужное количество UC.',
  ].join('\n');
}

function formatPaymentMessage(lang: Language): string {
  if (lang === 'tj') {
    return [
      'Дастури пардохт бо DC (Dushanbe City):',
      `1. Барномаи Dushanbe City (DC)-ро кушоед.`,
      `2. Интиқол ба рақами: ${SHOP_DC_PHONE}`,
      `3. Қабулкунанда: ${SHOP_OWNER_NAME}`,
      `4. Дар шарҳи интиқол рақами фармоиш (UC-...) ё Player ID-ро нависед.`,
      `5. Пас аз пардохт UC дар муддати 1–5 дақиқа мегузарад.`,
    ].join('\n');
  }
  return [
    'Инструкция по оплате через DC (Душанбе Сити):',
    `1. Откройте приложение Dushanbe City (DC).`,
    `2. Переведите сумму заказа на номер: ${SHOP_DC_PHONE}`,
    `3. Получатель: ${SHOP_OWNER_NAME}`,
    `4. Укажите номер заказа (UC-...) или ваш PUBG Player ID в комментарии.`,
    `5. Зачисление UC занимает 1–5 минут после подтверждения перевода.`,
  ].join('\n');
}

function getDefaultQuickActions(lang: Language): Array<{ label: string; command: string }> {
  if (lang === 'tj') {
    return [
      { label: 'Нархҳои UC', command: '/prices' },
      { label: 'Тарзи пардохт бо DC', command: '/pay' },
      { label: 'Player ID куҷост?', command: '/id' },
      { label: 'Тамос бо Абдучалол', command: '/contact' },
    ];
  }
  return [
    { label: 'Цены на UC', command: '/prices' },
    { label: 'Как оплатить DC?', command: '/pay' },
    { label: 'Где найти Player ID?', command: '/id' },
    { label: 'Контакты владельца', command: '/contact' },
  ];
}

function statusLabel(status: OrderStatus, lang: Language): string {
  if (lang === 'tj') {
    switch (status) {
      case 'awaiting_payment':
        return 'Интизори пардохт ба DC (021090008)';
      case 'processing':
        return 'Дар ҳоли коркард';
      case 'completed':
        return 'Анҷом ёфт (UC фиристода шуд)';
      case 'cancelled':
        return 'Бекор карда шуд';
    }
  }
  switch (status) {
    case 'awaiting_payment':
      return 'Ожидает оплаты на DC (021090008)';
    case 'processing':
      return 'В обработке';
    case 'completed':
      return 'Выполнен (UC зачислены)';
    case 'cancelled':
      return 'Отменён';
  }
}

function maskOrderForPublic(order: UcOrder): Omit<UcOrder, 'telegramUsername'> {
  const { telegramUsername: _hidden, ...safe } = order;
  return safe;
}

function buildBotReply(rawMessage: string, lang: Language): BotReply {
  const text = rawMessage.trim();
  const lower = text.toLowerCase();

  // Check if message contains an order ID (e.g. UC-1234A)
  const orderMatch = text.toUpperCase().match(/\bUC-[A-Z0-9]{4,8}\b/);
  if (orderMatch) {
    const found = ordersStore.find((o) => o.orderId === orderMatch[0]);
    if (found) {
      const safeOrder = maskOrderForPublic(found);
      const reply =
        lang === 'tj'
          ? `Фармоиш ${found.orderId}:\n• Player ID: ${found.playerId}\n• Ҳаҷм: ${found.totalUc} UC\n• Маблағ: ${found.totalTjs} TJS\n• Ҳолат: ${statusLabel(found.status, 'tj')}\n• Пардохт ба DC: ${SHOP_DC_PHONE} (${SHOP_OWNER_NAME})`
          : `Заказ ${found.orderId}:\n• Player ID: ${found.playerId}\n• Объём: ${found.totalUc} UC\n• Сумма: ${found.totalTjs} TJS\n• Статус: ${statusLabel(found.status, 'ru')}\n• Оплата на DC: ${SHOP_DC_PHONE} (${SHOP_OWNER_NAME})`;
      return {
        reply,
        quickActions: getDefaultQuickActions(lang),
        matchedOrder: safeOrder,
      };
    }
    return {
      reply:
        lang === 'tj'
          ? `Фармоиш бо рақами ${orderMatch[0]} ёфт нашуд. Лутфан рақами дурустро санҷед ё фармоиши нав созед.`
          : `Заказ ${orderMatch[0]} не найден. Проверьте номер заказа или оформите новый заказ в каталоге.`,
      quickActions: getDefaultQuickActions(lang),
    };
  }

  if (lower === '/start' || lower.includes('привет') || lower.includes('салом') || lower.includes('hello')) {
    return {
      reply:
        lang === 'tj'
          ? `Ассалому алайкум! Ман боти ёрирасони мағозаи ${SHOP_OWNER_NAME} ҳастам.\nМан ба шумо барои хариди UC, фаҳмидани нархҳо, пардохт ба DC (${SHOP_DC_PHONE}) ва санҷиши фармоиш кӯмак мекунам.`
          : `Здравствуйте! Я бот-помощник магазина ${SHOP_OWNER_NAME}.\nПомогу узнать цены на PUBG Mobile UC, оплатить через DC (${SHOP_DC_PHONE}) и проверить статус заказа.`,
      quickActions: getDefaultQuickActions(lang),
    };
  }

  if (
    lower === '/prices' ||
    lower.includes('цен') ||
    lower.includes('прайс') ||
    lower.includes('стои') ||
    lower.includes('нарх') ||
    lower.includes('пул') ||
    lower.includes('чанд')
  ) {
    // Also check if user mentioned a specific UC package number
    const numMatch = lower.match(/\b(60|325|660|1800|3850|8100)\b/);
    if (numMatch) {
      const amount = Number(numMatch[1]);
      const pkg = UC_PACKAGES.find((p) => p.ucAmount === amount);
      if (pkg) {
        return {
          reply:
            lang === 'tj'
              ? `Бастаи ${pkg.ucAmount} UC: ${pkg.priceTjs} TJS (${pkg.baseUc} асосӣ + ${pkg.bonusUc} бонус).\nПардохт бо DC ба рақами ${SHOP_DC_PHONE} (${SHOP_OWNER_NAME}).`
              : `Пакет ${pkg.ucAmount} UC стоит ${pkg.priceTjs} TJS (${pkg.baseUc} базовых + ${pkg.bonusUc} бонус).\nОплата через DC на номер ${SHOP_DC_PHONE} (${SHOP_OWNER_NAME}).`,
          quickActions: getDefaultQuickActions(lang),
        };
      }
    }
    return {
      reply: formatPricesMessage(lang),
      quickActions: getDefaultQuickActions(lang),
    };
  }

  if (
    lower === '/pay' ||
    lower.includes('оплат') ||
    lower.includes('дс') ||
    lower.includes('dc') ||
    lower.includes('душанбе') ||
    lower.includes('пардохт') ||
    lower.includes('номер') ||
    lower.includes('021090008')
  ) {
    return {
      reply: formatPaymentMessage(lang),
      quickActions: getDefaultQuickActions(lang),
    };
  }

  if (
    lower === '/id' ||
    lower.includes('player id') ||
    lower.includes('айди') ||
    lower.includes('где найти') ||
    lower.includes('куҷо')
  ) {
    return {
      reply:
        lang === 'tj'
          ? 'Чӣ тавр Player ID-ро дар PUBG Mobile ёфтан мумкин аст:\n1. Бозии PUBG Mobile-ро кушоед.\n2. Ба профили худ дар кунҷи чапи боло ворид шавед.\n3. Рақами зери ном (одатан 9–12 рақам, масалан 5123456789)-ро нусха гиред.'
          : 'Как найти Player ID в PUBG Mobile:\n1. Откройте PUBG Mobile и нажмите на аватар профиля в левом верхнем углу.\n2. Под вашим никнеймом указан числовой ID (обычно 9–12 цифр, например 5123456789).\n3. Скопируйте его и вставьте при оформлении заказа — пароль от аккаунта не нужен.',
      quickActions: getDefaultQuickActions(lang),
    };
  }

  if (
    lower === '/contact' ||
    lower.includes('контакт') ||
    lower.includes('тамос') ||
    lower.includes('каримов') ||
    lower.includes('абдучалол') ||
    lower.includes('владел') ||
    lower.includes('связ')
  ) {
    return {
      reply:
        lang === 'tj'
          ? `Фурӯшанда: ${SHOP_OWNER_NAME}\nРақами DC барои пардохт: ${SHOP_DC_PHONE}\nВақти корӣ: Ҳар рӯз, 24/7 (воридшавии UC дар 1–5 дақиқа).`
          : `Владелец магазина: ${SHOP_OWNER_NAME}\nКошелёк DC (Душанбе Сити): ${SHOP_DC_PHONE}\nРежим работы: ежедневно, зачисление UC за 1–5 минут после оплаты.`,
      quickActions: getDefaultQuickActions(lang),
    };
  }

  if (lower === '/status' || lower.includes('статус') || lower.includes('заказ') || lower.includes('фармоиш')) {
    return {
      reply:
        lang === 'tj'
          ? 'Барои санҷиши фармоиш рақами фармоишро (масалан, UC-1042A) дар ҳамин чат фиристед ё бахши «Проверка заказа»-ро истифода баред.'
          : 'Чтобы проверить статус заказа, отправьте сюда его номер (например, UC-1042A) или воспользуйтесь блоком «Проверка заказа» на странице.',
      quickActions: getDefaultQuickActions(lang),
    };
  }

  return {
    reply:
      lang === 'tj'
        ? `Ман саволро фаҳмидам! Шумо метавонед:\n• Нархҳои UC-ро бинед (/prices)\n• Дастури пардохти DC ба ${SHOP_DC_PHONE}-ро хонед (/pay)\n• Рақами фармоиши худро (UC-...) барои санҷиш фиристед.`
        : `Я готов помочь с покупкой UC в магазине ${SHOP_OWNER_NAME}. Выберите быструю команду ниже или отправьте номер заказа (например, UC-1042A), либо задайте вопрос о ценах и оплате через DC (${SHOP_DC_PHONE}).`,
    quickActions: getDefaultQuickActions(lang),
  };
}

async function sendTelegramApiMessage(chatId: string | number, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
    return response.ok;
  } catch (err) {
    console.error('Telegram API error:', err);
    return false;
  }
}

async function notifyAdminOrder(order: UcOrder): Promise<boolean> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!adminChatId || !process.env.TELEGRAM_BOT_TOKEN?.trim()) {
    return false;
  }
  const itemsText = order.items
    .map((item) => `• ${item.ucAmount} UC × ${item.quantity} = ${item.lineTotalTjs} TJS`)
    .join('\n');

  const msg = [
    `Новый заказ ${order.orderId}`,
    `Player ID: ${order.playerId}${order.playerNickname ? ` (${order.playerNickname})` : ''}`,
    order.telegramUsername ? `Telegram клиента: ${order.telegramUsername}` : '',
    '',
    itemsText,
    `Итого: ${order.totalUc} UC — ${order.totalTjs} TJS`,
    `Ожидается перевод DC на ${SHOP_DC_PHONE} (${SHOP_OWNER_NAME})`,
    '',
    `Подтвердить: /done ${order.orderId}`,
  ]
    .filter(Boolean)
    .join('\n');

  return sendTelegramApiMessage(adminChatId, msg);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/config', (_req, res) => {
    const botTokenSet = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
    const botUsername = (process.env.TELEGRAM_BOT_USERNAME || '').trim().replace(/^@/, '');
    res.json({
      ownerName: SHOP_OWNER_NAME,
      dcPhone: SHOP_DC_PHONE,
      telegramBotConfigured: botTokenSet,
      telegramBotUsername: botUsername,
    });
  });

  app.get('/api/packages', (_req, res) => {
    res.json({ packages: UC_PACKAGES });
  });

  app.post('/api/orders', async (req, res) => {
    const body = req.body ?? {};
    const playerId = sanitizeText(body.playerId, 20);
    const playerNickname = sanitizeText(body.playerNickname, 40);
    const telegramUsername = sanitizeText(body.telegramUsername, 40);
    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (!/^\d{8,13}$/.test(playerId)) {
      res.status(400).json({
        error: 'Некорректный Player ID. Укажите от 8 до 13 цифр.',
      });
      return;
    }

    if (rawItems.length === 0 || rawItems.length > 20) {
      res.status(400).json({
        error: 'Выберите хотя бы один пакет UC.',
      });
      return;
    }

    const orderItems: OrderItemSummary[] = [];
    let totalUc = 0;
    let totalTjs = 0;

    for (const rawItem of rawItems) {
      const packageId = sanitizeText(rawItem?.packageId, 32);
      const quantity = Number(rawItem?.quantity);
      const pkg = findPackageById(packageId);

      if (!pkg || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        res.status(400).json({
          error: 'Неверные параметры пакета UC.',
        });
        return;
      }

      const lineTotalTjs = pkg.priceTjs * quantity;
      orderItems.push({
        packageId: pkg.id,
        ucAmount: pkg.ucAmount,
        quantity,
        unitPriceTjs: pkg.priceTjs,
        lineTotalTjs,
      });
      totalUc += pkg.ucAmount * quantity;
      totalTjs += lineTotalTjs;
    }

    const newOrder: UcOrder = {
      orderId: generateOrderId(),
      playerId,
      playerNickname,
      telegramUsername,
      items: orderItems,
      totalUc,
      totalTjs,
      paymentMethod: 'DC',
      dcRecipientName: SHOP_OWNER_NAME,
      dcRecipientPhone: SHOP_DC_PHONE,
      status: 'awaiting_payment',
      createdAt: new Date().toISOString(),
    };

    ordersStore.push(newOrder);
    saveOrdersStore();

    const notifiedTelegram = await notifyAdminOrder(newOrder);

    res.status(201).json({
      order: maskOrderForPublic(newOrder),
      notifiedTelegram,
    });
  });

  app.get('/api/orders/lookup', (req, res) => {
    const query = sanitizeText(req.query.query, 32).toUpperCase();
    if (!query || query.length < 4) {
      res.status(400).json({ error: 'Введите номер заказа (UC-...) или Player ID.' });
      return;
    }

    const matches = ordersStore
      .filter((o) => o.orderId.toUpperCase() === query || o.playerId === query)
      .slice(-5)
      .reverse()
      .map(maskOrderForPublic);

    res.json({ orders: matches });
  });

  app.post('/api/bot/message', (req, res) => {
    const body = req.body ?? {};
    const message = sanitizeText(body.message, 400);
    const lang: Language = body.lang === 'tj' ? 'tj' : 'ru';

    if (!message) {
      res.status(400).json({ error: 'Введите сообщение для бота.' });
      return;
    }

    const botReply = buildBotReply(message, lang);
    res.json(botReply);
  });

  // Real Telegram Bot Webhook endpoint
  app.post('/api/telegram/webhook', async (req, res) => {
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
    if (expectedSecret) {
      const provided = String(req.headers['x-telegram-bot-api-secret-token'] || '');
      const expectedBuf = Buffer.from(expectedSecret, 'utf8');
      const providedBuf = Buffer.from(provided, 'utf8');
      if (
        expectedBuf.length !== providedBuf.length ||
        !crypto.timingSafeEqual(expectedBuf, providedBuf)
      ) {
        res.status(401).json({ ok: false });
        return;
      }
    }

    const update = req.body;
    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = typeof message?.text === 'string' ? message.text.trim() : '';

    if (chatId && text) {
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
      const isAdmin = Boolean(adminChatId && String(chatId) === adminChatId);

      // Admin status commands inside Telegram
      if (isAdmin && (text.startsWith('/done ') || text.startsWith('/cancel '))) {
        const parts = text.split(/\s+/);
        const targetOrderId = (parts[1] || '').toUpperCase();
        const found = ordersStore.find((o) => o.orderId === targetOrderId);
        if (found) {
          found.status = text.startsWith('/done ') ? 'completed' : 'cancelled';
          saveOrdersStore();
          await sendTelegramApiMessage(
            chatId,
            `Статус заказа ${found.orderId} обновлён: ${statusLabel(found.status, 'ru')}.`
          );
        } else {
          await sendTelegramApiMessage(chatId, `Заказ ${targetOrderId} не найден.`);
        }
        res.json({ ok: true });
        return;
      }

      const detectedLang: Language = /[ҷғқҳӯӣ]|салом|нарх|пардохт|чанд/i.test(text) ? 'tj' : 'ru';
      const reply = buildBotReply(text, detectedLang);
      await sendTelegramApiMessage(chatId, reply.reply);
    }

    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Karimov UC Shop server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
