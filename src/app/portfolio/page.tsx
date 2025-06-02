// ─── src/app/portfolio/page.tsx ─────────────────────────────────────────────────────

"use client";

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Select } from "antd";
import TradingViewChart from "@/components/stockchart";
import type { MarketOverview, GainerLoser } from "@/types";

// ─── Transaction table setup ────────────────────────────────────────────────────────────
interface Transaction {
  key: string;
  name: string;
  date: string;
  amount: number;
}

const columns = [
  {
    title: "Transaction",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (amount: number) => <span>${amount}</span>,
  },
];

const sampleTransactions: Transaction[] = [
  { key: "1", name: "Buy BTC", date: "Aug 28, 08:00", amount: 1200 },
  { key: "2", name: "Buy ETH", date: "Aug 27, 10:15", amount: 800 },
  { key: "3", name: "Sell ADA", date: "Aug 26, 16:30", amount: 350 },
];
// ───────────────────────────────────────────────────────────────────────────────────────

const cryptoSymbols = [
  { label: "Bitcoin (BTC)", value: "BTCUSDT" },
  { label: "Ethereum (ETH)", value: "ETHUSDT" },
  { label: "Dogecoin (DOGE)", value: "DOGEUSDT" },
  { label: "Cardano (ADA)", value: "ADAUSDT" },
];

const chartTypeOptions = [
  { label: "Price Chart", value: "price" },
  { label: "24h Change", value: "change" },
];

const symbolToCoinId: Record<string, string> = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  DOGEUSDT: "dogecoin",
  ADAUSDT: "cardano",
};

export default function Portfolio() {
  // ─── State ───────────────────────────────────────────────────────────────────────────
  const [symbol, setSymbol] = useState<string>("BTCUSDT");
  const [chartType, setChartType] = useState<"price" | "change">("price");

  // Data from FastAPI backend:
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [backendLoading, setBackendLoading] = useState<boolean>(true);

  // CoinGecko data:
  const [coinData, setCoinData] = useState<{ price: number; change_24h: number } | null>(
    null
  );
  const [coinLoading, setCoinLoading] = useState<boolean>(true);
  // ───────────────────────────────────────────────────────────────────────────────────────

  // ─── Fetch market overview from backend on mount ───────────────────────────────────────
  useEffect(() => {
    async function loadMarketOverview() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/market_overview`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: MarketOverview = await res.json();
        setMarketOverview(data);
      } catch (err) {
        console.error("Error fetching market overview:", err);
        setMarketOverview(null);
      } finally {
        setBackendLoading(false);
      }
    }
    loadMarketOverview();
  }, []);
  // ───────────────────────────────────────────────────────────────────────────────────────

  // ─── Fetch coin data from CoinGecko whenever `symbol` changes ──────────────────────────
  useEffect(() => {
    async function loadCoinData() {
      setCoinLoading(true);
      const coinId = symbolToCoinId[symbol];
      if (!coinId) {
        setCoinData(null);
        setCoinLoading(false);
        return;
      }

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const raw = await response.json();
        if (raw[coinId]) {
          setCoinData({
            price: raw[coinId].usd,
            change_24h: raw[coinId].usd_24h_change,
          });
        } else {
          setCoinData(null);
        }
      } catch (error) {
        console.error("Error fetching coin data:", error);
        setCoinData(null);
      } finally {
        setCoinLoading(false);
      }
    }
    loadCoinData();
  }, [symbol]);
  // ───────────────────────────────────────────────────────────────────────────────────────

  // ─── Show loading or error states ───────────────────────────────────────────────────────
  if (backendLoading || coinLoading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", paddingTop: 50 }}>
        Loading data...
      </div>
    );
  }

  if (!marketOverview || !coinData) {
    return (
      <div style={{ color: "#fff", textAlign: "center", paddingTop: 50 }}>
        Could not load data.
      </div>
    );
  }
  // ───────────────────────────────────────────────────────────────────────────────────────

  // ─── Prepare display values ─────────────────────────────────────────────────────────────
  const currentPrice = coinData.price;
  const coinChange = coinData.change_24h;

  const formatGainerLoser = (item: GainerLoser | null): string => {
    if (!item) return "N/A";
    const sign = item.change_24h >= 0 ? "+" : "";
    return `${item.id.toUpperCase()} ${sign}${item.change_24h.toFixed(2)}%`;
  };

  const topGainer = formatGainerLoser(marketOverview.top_gainer);
  const topLoser = formatGainerLoser(marketOverview.top_loser);
  // ───────────────────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ width: "100%" }}>
      <h1 style={{ color: "#fff" }}>Portfolio</h1>

      {/* ─── Live Crypto Chart Card ────────────────────────────────────────────────────── */}
      <Card className="black-card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ color: "#fff", margin: 0 }}>Live Crypto Chart</h2>
          <Select
            style={{ width: 200 }}
            value={symbol}
            onChange={(val: string) => setSymbol(val)}
            options={cryptoSymbols}
          />
          <Select
            style={{ width: 200 }}
            value={chartType}
            onChange={(val: "price" | "change") => setChartType(val)}
            options={chartTypeOptions}
          />
        </div>
        <TradingViewChart symbol={symbol} chartType={chartType} />
      </Card>

      {/* ─── Overview Cards ─────────────────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="black-card">
            <h4 style={{ color: "#a6a8b6" }}>Current Price</h4>
            <h2 style={{ marginTop: 8 }}>${currentPrice.toFixed(2)}</h2>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="black-card">
            <h4 style={{ color: "#a6a8b6" }}>24h Change</h4>
            <h2
              style={{
                marginTop: 8,
                color: coinChange >= 0 ? "#56fca2" : "#ff6370",
              }}
            >
              {coinChange >= 0
                ? `+${coinChange.toFixed(2)}%`
                : `${coinChange.toFixed(2)}%`}
            </h2>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="black-card">
            <h4 style={{ color: "#a6a8b6" }}>Top Gainer</h4>
            <h2 style={{ marginTop: 8 }}>{topGainer}</h2>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="black-card">
            <h4 style={{ color: "#a6a8b6" }}>Top Loser</h4>
            <h2 style={{ marginTop: 8, color: "#ff6370" }}>{topLoser}</h2>
          </Card>
        </Col>
      </Row>

      {/* ─── Recent Transactions Table ──────────────────────────────────────────────────── */}
      <Card
        className="black-card"
        style={{ marginTop: 24, backgroundColor: "#1F1F1F", color: "#fff" }}
        title={<h3 style={{ color: "#fff", margin: 0 }}>Recent Transactions</h3>}
      >
        <Table
          columns={columns}
          dataSource={sampleTransactions}
          pagination={false}
          style={{ backgroundColor: "#1F1F1F", color: "#fff" }}
        />
      </Card>
    </div>
  );
}
