"use client";

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Select } from "antd";
import TradingViewChart from "@/components/stockchart";

interface Transaction {
  key: string;
  name: string;
  date: string;
  amount: number;
}

// Table columns definition
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

// Dummy transaction data (replace with backend data if needed)
const data: Transaction[] = [
  {
    key: "1",
    name: "Buy BTC",
    date: "Aug 28, 08:00",
    amount: 1200,
  },
  {
    key: "2",
    name: "Buy ETH",
    date: "Aug 27, 10:15",
    amount: 800,
  },
  {
    key: "3",
    name: "Sell ADA",
    date: "Aug 26, 16:30",
    amount: 350,
  },
];

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

// Map from symbol to CoinGecko coin id
const symbolToCoinId: Record<string, string> = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  DOGEUSDT: "dogecoin",
  ADAUSDT: "cardano",
};

export default function Page() {
  // State for selected crypto symbol (for the chart)
  const [symbol, setSymbol] = useState("BTCUSDT");
  // State for chart type (if needed by the chart widget)
  const [chartType, setChartType] = useState("price");

  // ---- State for data from Python backend (for top gainer/loser) ----
  const [marketOverview, setMarketOverview] = useState<any>(null);
  const [backendLoading, setBackendLoading] = useState(true);

  // ---- New state for dynamic coin data ----
  const [coinData, setCoinData] = useState<{ price: number; change_24h: number } | null>(null);
  const [coinLoading, setCoinLoading] = useState(true);

  // Fetch market overview from backend once on mount
  useEffect(() => {
    async function loadMarketOverview() {
      try {
        const resMarket = await fetch("http://localhost:8000/market_overview");
        const marketData = await resMarket.json();
        setMarketOverview(marketData);
      } catch (err) {
        console.error("Error fetching market overview:", err);
      } finally {
        setBackendLoading(false);
      }
    }
    loadMarketOverview();
  }, []);

  // Fetch dynamic data for the selected coin from CoinGecko whenever symbol changes
  useEffect(() => {
    async function loadCoinData() {
      setCoinLoading(true);
      const coinId = symbolToCoinId[symbol];
      if (!coinId) {
        setCoinData(null);
        setCoinLoading(false);
        return;
      }

      // FIX #1: Correctly use backticks for string interpolation
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data[coinId]) {
          setCoinData({
            price: data[coinId].usd,
            change_24h: data[coinId].usd_24h_change,
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

  // Show loading if either backend or coin data is still loading
  if (backendLoading || coinLoading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", paddingTop: 50 }}>
        Loading data...
      </div>
    );
  }

  // Fallback for missing data
  if (!coinData || !marketOverview) {
    return (
      <div style={{ color: "#fff", textAlign: "center", paddingTop: 50 }}>
        Could not load data.
      </div>
    );
  }

  // Dynamic data for the selected coin
  const currentPrice = coinData.price; // current price of selected coin
  const coinChange = coinData.change_24h; // 24h change for selected coin

  // Market overview from backend for top gainer/loser
  const topGainer = marketOverview.top_gainer
    ? `${marketOverview.top_gainer.id?.toUpperCase()} +${marketOverview.top_gainer.change_24h.toFixed(2)}%`
    : "N/A";
  const topLoser = marketOverview.top_loser
    ? `${marketOverview.top_loser.id?.toUpperCase()} ${marketOverview.top_loser.change_24h.toFixed(2)}%`
    : "N/A";

  return (
    <div style={{ width: "100%" }}>
      {/* ---------- Live Chart Card (Dark Card) ---------- */}
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
          {/* Symbol selection */}
          <Select
            style={{ width: 200 }}
            value={symbol}
            onChange={(val) => setSymbol(val)}
            options={cryptoSymbols}
          />
          {/* Chart type toggle */}
          <Select
            style={{ width: 200 }}
            value={chartType}
            onChange={(val) => setChartType(val)}
            options={chartTypeOptions}
          />
        </div>
        {/* TradingViewChart now receives both symbol and chartType */}
        <TradingViewChart symbol={symbol} chartType={chartType} />
      </Card>

      {/* ---------- Overview Cards (Dark Cards) ---------- */}
      <Row gutter={[16, 16]}>
        {/* Current Price */}
        <Col xs={24} sm={12} md={6}>
          <Card className="black-card">
            <h4 style={{ color: "#a6a8b6" }}>Current Price</h4>
            <h2 style={{ marginTop: 8 }}>
              ${currentPrice ? currentPrice.toFixed(2) : "0.00"}
            </h2>
          </Card>
        </Col>

        {/* 24h Change */}
        <Col xs={24} sm={12} md={6}>
          <Card className="black-card">
            <h4 style={{ color: "#a6a8b6" }}>24h Change</h4>
            <h2
              style={{
                marginTop: 8,
                // FIX #2: Properly interpolate +/– sign
                color: coinChange >= 0 ? "#56fca2" : "#ff6370",
              }}
            >
              {coinChange >= 0
                ? `+${coinChange.toFixed(2)}%`
                : `${coinChange.toFixed(2)}%`}
            </h2>
          </Card>
        </Col>

        {/* Top Gainer (from backend) */}
        <Col xs={24} sm={12} md={6}>
          <Card className="black-card">
            <h4 style={{ color: "#a6a8b6" }}>Top Gainer</h4>
            <h2 style={{ marginTop: 8 }}>{topGainer}</h2>
          </Card>
        </Col>

        {/* Top Loser (from backend) */}
        <Col xs={24} sm={12} md={6}>
          <Card className="black-card">
            <h4 style={{ color: "#a6a8b6" }}>Top Loser</h4>
            <h2 style={{ marginTop: 8, color: "#ff6370" }}>{topLoser}</h2>
          </Card>
        </Col>
      </Row>

      {/* ---------- Recent Transactions (Dark-Themed Table) ---------- */}
      <Card
        className="black-card"
        style={{
          marginTop: 24,
          backgroundColor: "#1F1F1F",
          color: "#fff",
        }}
        title={
          <h3 style={{ color: "#fff", margin: 0 }}>Recent Transactions</h3>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          style={{ backgroundColor: "#1F1F1F", color: "#fff" }}
        />
      </Card>
    </div>
  );
}
