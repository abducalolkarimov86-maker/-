import type { Language, OrderStatus } from './types.ts';

export interface Translations {
  navCatalog: string;
  navPayment: string;
  navBot: string;
  navCheck: string;
  cartButton: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  stripOwnerLabel: string;
  stripDcLabel: string;
  stripSpeedLabel: string;
  stripSpeedValue: string;
  stripBotLabel: string;
  stripBotValue: string;
  catalogTitle: string;
  catalogSubtitle: string;
  filterAll: string;
  filterStarter: string;
  filterPopular: string;
  filterElite: string;
  searchPlaceholder: string;
  bonusLabel: string;
  buyNow: string;
  addToCart: string;
  inCartCount: string;
  emptySearch: string;
  paymentSectionTitle: string;
  paymentSectionSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  dcCardTitle: string;
  recipientLabel: string;
  phoneLabel: string;
  copyNumber: string;
  copied: string;
  lookupTitle: string;
  lookupPlaceholder: string;
  lookupButton: string;
  lookupEmpty: string;
  lookupNotFound: string;
  botTitle: string;
  botSubtitle: string;
  botInputPlaceholder: string;
  botSend: string;
  botOpenTelegram: string;
  botShareTelegram: string;
  botGreeting: string;
  cartTitle: string;
  cartEmpty: string;
  cartEmptyHint: string;
  cartTotalUc: string;
  cartTotalTjs: string;
  playerIdLabel: string;
  playerIdPlaceholder: string;
  playerIdHint: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  telegramLabel: string;
  telegramPlaceholder: string;
  submitOrder: string;
  submittingOrder: string;
  receiptTitle: string;
  receiptSubtitle: string;
  receiptOrderId: string;
  receiptSendToBot: string;
  receiptNewOrder: string;
  footerTagline: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ru: {
    navCatalog: 'Каталог UC',
    navPayment: 'Оплата DC',
    navBot: 'Telegram Бот',
    navCheck: 'Проверка заказа',
    cartButton: 'Корзина',
    heroTitle: 'Официальный магазин UC для PUBG Mobile',
    heroSubtitle:
      'Мгновенное пополнение по Player ID без входа в аккаунт. Владелец магазина — Каримов Абдучалол. Быстрая оплата через кошелёк Dushanbe City (DC) на номер 021090008 и круглосуточный Telegram-бот поддержки.',
    heroPrimaryCta: 'Выбрать пакет UC',
    heroSecondaryCta: 'Помощь Telegram-бота',
    stripOwnerLabel: 'Продавец',
    stripDcLabel: 'Кошелёк DC',
    stripSpeedLabel: 'Зачисление',
    stripSpeedValue: '1–5 минут по Player ID',
    stripBotLabel: 'Поддержка',
    stripBotValue: 'Telegram-бот 24/7',
    catalogTitle: 'Пакеты UC для PUBG Mobile',
    catalogSubtitle:
      'Честные цены в сомони (TJS). Выберите нужный набор и оформите пополнение по Player ID.',
    filterAll: 'Все пакеты',
    filterStarter: 'Стартовые',
    filterPopular: 'Популярные',
    filterElite: 'Крупные',
    searchPlaceholder: 'Поиск по количеству UC...',
    bonusLabel: 'бонус',
    buyNow: 'Купить сейчас',
    addToCart: 'В корзину',
    inCartCount: 'В корзине',
    emptySearch: 'Пакеты по вашему запросу не найдены.',
    paymentSectionTitle: 'Оплата через DC и проверка заказа',
    paymentSectionSubtitle:
      'Перевод принимается на кошелёк Dushanbe City (DC) на имя Каримов Абдучалол, номер 021090008.',
    step1Title: '01. Выберите UC и укажите Player ID',
    step1Desc:
      'Добавьте нужный пакет в корзину и введите числовой ID вашего профиля PUBG Mobile (пароль не требуется).',
    step2Title: '02. Переведите сумму на DC 021090008',
    step2Desc:
      'Откройте приложение Dushanbe City, переведите точную сумму в сомони на номер 021090008 (Каримов Абдучалол) и укажите номер заказа в комментарии.',
    step3Title: '03. Получите UC за 1–5 минут',
    step3Desc:
      'После подтверждения оплаты или отправки чека в Telegram-бот UC зачисляются напрямую на ваш игровой счёт.',
    dcCardTitle: 'Реквизиты для оплаты Dushanbe City (DC)',
    recipientLabel: 'Получатель',
    phoneLabel: 'Номер телефона DC',
    copyNumber: 'Скопировать',
    copied: 'Скопировано',
    lookupTitle: 'Проверка статуса заказа',
    lookupPlaceholder: 'Номер заказа (UC-...) или Player ID',
    lookupButton: 'Проверить',
    lookupEmpty: 'Введите номер заказа или Player ID, чтобы увидеть текущий статус.',
    lookupNotFound: 'Заказы с такими данными пока не найдены.',
    botTitle: 'Telegram-бот помощи',
    botSubtitle:
      'Отвечает на русском и таджикском языках: подскажет цены UC, инструкцию оплаты DC (021090008) и проверит ваш заказ.',
    botInputPlaceholder: 'Спросите про цены, DC 021090008 или введите UC-...',
    botSend: 'Отправить',
    botOpenTelegram: 'Открыть в Telegram',
    botShareTelegram: 'Отправить заявку в Telegram',
    botGreeting:
      'Здравствуйте! Я бот-помощник магазина Каримова Абдучалола. Выберите быстрый вопрос ниже или напишите номер заказа (UC-...).',
    cartTitle: 'Оформление заказа UC',
    cartEmpty: 'Ваша корзина пока пуста',
    cartEmptyHint: 'Выберите пакет UC из каталога, чтобы перейти к оплате через DC.',
    cartTotalUc: 'Итого UC',
    cartTotalTjs: 'К оплате (DC)',
    playerIdLabel: 'PUBG Mobile Player ID',
    playerIdPlaceholder: 'Например: 5123456789',
    playerIdHint: 'От 8 до 13 цифр из вашего профиля PUBG Mobile.',
    nicknameLabel: 'Игровой никнейм (необязательно)',
    nicknamePlaceholder: 'Ваш ник в игре',
    telegramLabel: 'Ваш Telegram (необязательно)',
    telegramPlaceholder: '@username или номер',
    submitOrder: 'Оформить заказ',
    submittingOrder: 'Создание заказа...',
    receiptTitle: 'Заказ оформлен',
    receiptSubtitle: 'Переведите указанную сумму на DC 021090008 (Каримов Абдучалол).',
    receiptOrderId: 'Номер заказа',
    receiptSendToBot: 'Проверить в боте',
    receiptNewOrder: 'Оформить ещё заказ',
    footerTagline: 'Пополнение PUBG Mobile UC по Player ID · Оплата DC: 021090008',
  },
  tj: {
    navCatalog: 'Каталоги UC',
    navPayment: 'Пардохти DC',
    navBot: 'Telegram Бот',
    navCheck: 'Санҷиши фармоиш',
    cartButton: 'Сабад',
    heroTitle: 'Мағозаи расмии UC барои PUBG Mobile',
    heroSubtitle:
      'Пуркунии фаврӣ тавассути Player ID бе воридшавӣ ба аккаунт. Соҳиби мағоза — Каримов Абдучалол. Пардохти осон бо ҳамёни Dushanbe City (DC) ба рақами 021090008 ва боти ёрирасони Telegram 24/7.',
    heroPrimaryCta: 'Интихоби бастаи UC',
    heroSecondaryCta: 'Кӯмаки Telegram-бот',
    stripOwnerLabel: 'Фурӯшанда',
    stripDcLabel: 'Ҳамёни DC',
    stripSpeedLabel: 'Воридшавӣ',
    stripSpeedValue: '1–5 дақиқа бо Player ID',
    stripBotLabel: 'Дастгирӣ',
    stripBotValue: 'Telegram-бот 24/7',
    catalogTitle: 'Бастаҳои UC барои PUBG Mobile',
    catalogSubtitle:
      'Нархҳои дақиқ бо сомонӣ (TJS). Бастаи лозимиро интихоб карда, бо Player ID фармоиш диҳед.',
    filterAll: 'Ҳама бастаҳо',
    filterStarter: 'Ибтидоӣ',
    filterPopular: 'Маъмул',
    filterElite: 'Калон',
    searchPlaceholder: 'Ҷустуҷӯ аз рӯи миқдори UC...',
    bonusLabel: 'бонус',
    buyNow: 'Харидан',
    addToCart: 'Ба сабад',
    inCartCount: 'Дар сабад',
    emptySearch: 'Бастае бо чунин дархост ёфт нашуд.',
    paymentSectionTitle: 'Пардохт бо DC ва санҷиши фармоиш',
    paymentSectionSubtitle:
      'Интиқол ба ҳамёни Dushanbe City (DC) ба номи Каримов Абдучалол, рақами 021090008 қабул карда мешавад.',
    step1Title: '01. Бастаи UC ва Player ID-ро ворид кунед',
    step1Desc:
      'Бастаи лозимиро ба сабад илова карда, ID-и рақамии профили PUBG Mobile-и худро нависед (парол лозим нест).',
    step2Title: '02. Маблағро ба DC 021090008 фиристед',
    step2Desc:
      'Барномаи Dushanbe City-ро кушоед, маблағро ба рақами 021090008 (Каримов Абдучалол) интиқол диҳед ва рақами фармоишро дар шарҳ нависед.',
    step3Title: '03. UC-ро дар 1–5 дақиқа гиред',
    step3Desc:
      'Пас аз тасдиқи пардохт ё фиристодани чек ба Telegram-бот, UC фавран ба аккаунти шумо мегузарад.',
    dcCardTitle: 'Маълумот барои пардохти Dushanbe City (DC)',
    recipientLabel: 'Қабулкунанда',
    phoneLabel: 'Рақами телефони DC',
    copyNumber: 'Нусха гирифтан',
    copied: 'Нусха шуд',
    lookupTitle: 'Санҷиши ҳолати фармоиш',
    lookupPlaceholder: 'Рақами фармоиш (UC-...) ё Player ID',
    lookupButton: 'Санҷидан',
    lookupEmpty: 'Барои дидани ҳолат рақами фармоиш ё Player ID-ро ворид кунед.',
    lookupNotFound: 'Бо ин маълумот фармоиш ёфт нашуд.',
    botTitle: 'Telegram-боти ёрирасон',
    botSubtitle:
      'Бо забони тоҷикӣ ва русӣ ҷавоб медиҳад: нархҳои UC, дастури пардохти DC (021090008) ва санҷиши фармоиш.',
    botInputPlaceholder: 'Дар бораи нарх, DC 021090008 ё UC-... пурсед',
    botSend: 'Фиристодан',
    botOpenTelegram: 'Кушодан дар Telegram',
    botShareTelegram: 'Фиристодани фармоиш ба Telegram',
    botGreeting:
      'Салом! Ман боти ёрирасони мағозаи Каримов Абдучалол ҳастам. Саволи зудро интихоб кунед ё рақами фармоишро (UC-...) нависед.',
    cartTitle: 'Бақайдгирии фармоиши UC',
    cartEmpty: 'Сабади шумо холӣ аст',
    cartEmptyHint: 'Барои пардохт бо DC як бастаи UC-ро аз каталог интихоб кунед.',
    cartTotalUc: 'Ҳамагӣ UC',
    cartTotalTjs: 'Барои пардохт (DC)',
    playerIdLabel: 'PUBG Mobile Player ID',
    playerIdPlaceholder: 'Масалан: 5123456789',
    playerIdHint: 'Аз 8 то 13 рақам аз профили PUBG Mobile.',
    nicknameLabel: 'Ном дар бозӣ (ихтиёрӣ)',
    nicknamePlaceholder: 'Ники шумо дар бозӣ',
    telegramLabel: 'Telegram-и шумо (ихтиёрӣ)',
    telegramPlaceholder: '@username ё рақам',
    submitOrder: 'Тасдиқи фармоиш',
    submittingOrder: 'Сабти фармоиш...',
    receiptTitle: 'Фармоиш сабт шуд',
    receiptSubtitle: 'Маблағи нишондодашударо ба DC 021090008 (Каримов Абдучалол) фиристед.',
    receiptOrderId: 'Рақами фармоиш',
    receiptSendToBot: 'Санҷиш дар бот',
    receiptNewOrder: 'Фармоиши нав',
    footerTagline: 'Пуркунии PUBG Mobile UC бо Player ID · Пардохти DC: 021090008',
  },
};

export function formatOrderStatus(status: OrderStatus, lang: Language): string {
  if (lang === 'tj') {
    switch (status) {
      case 'awaiting_payment':
        return 'Интизори пардохти DC';
      case 'processing':
        return 'Дар ҳоли коркард';
      case 'completed':
        return 'Анҷом ёфт';
      case 'cancelled':
        return 'Бекор шуд';
    }
  }
  switch (status) {
    case 'awaiting_payment':
      return 'Ожидает оплаты DC';
    case 'processing':
      return 'В обработке';
    case 'completed':
      return 'Выполнен';
    case 'cancelled':
      return 'Отменён';
  }
}
