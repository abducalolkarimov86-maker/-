export type Language = 'ru' | 'tj';

export type PackageCategory = 'all' | 'starter' | 'popular' | 'elite';

export type ImageTier = 'starter' | 'popular' | 'elite';

export interface UcPackage {
  id: string;
  ucAmount: number;
  baseUc: number;
  bonusUc: number;
  priceTjs: number;
  category: Exclude<PackageCategory, 'all'>;
  imageTier: ImageTier;
  tagRu: string;
  tagTj: string;
  descriptionRu: string;
  descriptionTj: string;
}

export interface CartItem {
  packageId: string;
  quantity: number;
}

export type OrderStatus = 'awaiting_payment' | 'processing' | 'completed' | 'cancelled';

export interface OrderItemSummary {
  packageId: string;
  ucAmount: number;
  quantity: number;
  unitPriceTjs: number;
  lineTotalTjs: number;
}

export interface UcOrder {
  orderId: string;
  playerId: string;
  playerNickname: string;
  telegramUsername: string;
  items: OrderItemSummary[];
  totalUc: number;
  totalTjs: number;
  paymentMethod: 'DC';
  dcRecipientName: string;
  dcRecipientPhone: string;
  status: OrderStatus;
  createdAt: string;
}

export interface BotReply {
  reply: string;
  quickActions: Array<{ label: string; command: string }>;
  matchedOrder?: Omit<UcOrder, 'telegramUsername'>;
}

export interface ShopPublicConfig {
  ownerName: string;
  dcPhone: string;
  telegramBotConfigured: boolean;
  telegramBotUsername: string;
}
