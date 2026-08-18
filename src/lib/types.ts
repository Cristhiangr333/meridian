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

export interface PsychologyLog {
  id: string;
  user_id: string;
  log_date: string;
  sleep_hours: number | null;
  confidence: number | null;
  stress: number | null;
  focus: number | null;
  motivation: number | null;
  notes: string | null;
  created_at: string;
}

export interface Setup {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_metric: string;
  target_value: number | null;
  current_value: number | null;
  deadline: string | null;
  status: "active" | "achieved" | "abandoned";
  created_at: string;
}
