export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  broker: string | null;
  currency: string;
  starting_balance: number;
  current_balance: number;
  is_funded: boolean;
  tier_label: string;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  account_id: string;
  setup_id: string | null;
  asset: string;
  direction: TradeDirection;
  entry_price: number;
  stop_price: number | null;
  target_price: number | null;
  exit_price: number | null;
  size: number | null;
  pnl: number | null;
  rr_planned: number | null;
  rr_realized: number | null;
  confidence: number | null;
  notes: string | null;
  status: TradeStatus;
  opened_at: string;
  closed_at: string | null;
}
