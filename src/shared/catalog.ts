import type { UcPackage } from '../types.ts';

export const SHOP_OWNER_NAME = 'Каримов Абдучалол';
export const SHOP_DC_PHONE = '021090008';

export const UC_PACKAGES: UcPackage[] = [
  {
    id: 'uc-60',
    ucAmount: 60,
    baseUc: 60,
    bonusUc: 0,
    priceTjs: 11,
    category: 'starter',
    imageTier: 'starter',
    tagRu: 'Базовый набор',
    tagTj: 'Бастаи ибтидоӣ',
    descriptionRu: 'Быстрый старт для открытия ящиков и мелких покупок в игре.',
    descriptionTj: 'Оғози зуд барои кушодани қуттиҳо ва харидҳои хурд дар бозӣ.',
  },
  {
    id: 'uc-325',
    ucAmount: 325,
    baseUc: 300,
    bonusUc: 25,
    priceTjs: 52,
    category: 'popular',
    imageTier: 'starter',
    tagRu: 'Выбор игроков',
    tagTj: 'Интихоби бозигарон',
    descriptionRu: 'Включает 25 бонусных UC. Подходит для наборов и скинов.',
    descriptionTj: '25 UC бонус дорад. Барои хариди скинҳо ва бастаҳо мувофиқ аст.',
  },
  {
    id: 'uc-660',
    ucAmount: 660,
    baseUc: 600,
    bonusUc: 60,
    priceTjs: 102,
    category: 'popular',
    imageTier: 'popular',
    tagRu: 'Хит для Royale Pass',
    tagTj: 'Беҳтарин барои Royale Pass',
    descriptionRu: 'Идеально для активации полного Royale Pass и рулеток.',
    descriptionTj: 'Барои фаъол кардани Royale Pass-и пурра беҳтарин интихоб аст.',
  },
  {
    id: 'uc-1800',
    ucAmount: 1800,
    baseUc: 1500,
    bonusUc: 300,
    priceTjs: 255,
    category: 'popular',
    imageTier: 'popular',
    tagRu: '+300 UC бонус',
    tagTj: '+300 UC бонус',
    descriptionRu: 'Крупный баланс с ощутимой выгодой для апгрейда оружия.',
    descriptionTj: 'Тавозуни калон бо бонуси хуб барои беҳтар кардани силоҳҳо.',
  },
  {
    id: 'uc-3850',
    ucAmount: 3850,
    baseUc: 3000,
    bonusUc: 850,
    priceTjs: 505,
    category: 'elite',
    imageTier: 'elite',
    tagRu: '+850 UC бонус',
    tagTj: '+850 UC бонус',
    descriptionRu: 'Выгодный пакет для коллекционных костюмов и X-Suits.',
    descriptionTj: 'Бастаи муфид барои либосҳои коллексионӣ ва X-Suits.',
  },
  {
    id: 'uc-8100',
    ucAmount: 8100,
    baseUc: 6000,
    bonusUc: 2100,
    priceTjs: 995,
    category: 'elite',
    imageTier: 'elite',
    tagRu: 'Максимальный +2100 UC',
    tagTj: 'Максимум +2100 UC',
    descriptionRu: 'Максимальная выгода и мгновенное зачисление по Player ID.',
    descriptionTj: 'Фоидаи максималӣ ва воридшавии фаврӣ тавассути Player ID.',
  },
];

export function findPackageById(packageId: string): UcPackage | undefined {
  return UC_PACKAGES.find((pkg) => pkg.id === packageId);
}
