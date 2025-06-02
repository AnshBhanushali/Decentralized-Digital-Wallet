// src/types.ts
export interface GainerLoser {
    id: string;            // e.g. "btc"
    change_24h: number;    // e.g. 3.45
  }
  
  export interface MarketOverview {
    top_gainer: GainerLoser | null;
    top_loser: GainerLoser | null;
    // …any other fields your backend returns…
  }
  