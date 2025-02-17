"use client";
declare global {
  interface Window {
    ethereum?: any;
  }
}
export {};

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import {
  Layout,
  Menu,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Form,
  Input,
  Select,
  message,
} from "antd";
import { WalletOutlined, AreaChartOutlined, SwapOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ethers } from "ethers";
import TradingViewChart from "@/components/stockchart";

const { Header, Sider, Content } = Layout;
const { Option } = Select;

// ===========================
// Type definitions
// ===========================
interface Transaction {
  coin: string;
  transaction_amount: number;
  transaction_id: string;
  date: string;
  status: string;
  fees: number;
}

interface BalanceData {
  total_balance_btc: number;
  total_balance_usd: number;
}

interface ChartDataPoint {
  timestamp: string; // e.g. "2022-03-01"
  price: number;
}

interface QuickExchangeFields {
  haveCoin: string;
  haveAmount: number;
  wantCoin: string;
}

// ---------------------------
// Mapping for chart symbols
// ---------------------------
const cryptoChartMapping: Record<string, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  DOGE: "DOGEUSDT",
  ADA: "ADAUSDT",
};

export const pageTitle = "Portfolio";

const Dashboard: NextPage = () => {
  // ---------------------------
  // State
  // ---------------------------
  const [collapsed, setCollapsed] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  // New state for selected crypto for market chart and quick exchange.
  const [selectedChartCrypto, setSelectedChartCrypto] = useState<string>("BTC");
  // Form instance for quick exchange
  const [form] = Form.useForm();

  // ---------------------------
  // Fetch data from FastAPI
  // ---------------------------
  async function fetchTransactions() {
    // Use connectedAccount if available; otherwise, use "demo"
    const walletAddress = connectedAccount || "demo";
    try {
      const res = await fetch(`http://127.0.0.1:8000/transactions?wallet_address=${walletAddress}`);
      const data = await res.json();
      console.log("Fetched transactions:", data);
      const transactionsArray = Array.isArray(data)
        ? data
        : data.transactions || [];
      setTransactions(transactionsArray);
    } catch (err) {
      console.error(err);
      message.error("Failed to load transactions.");
    }
  }

  async function fetchBalance() {
    try {
      const res = await fetch("http://127.0.0.1:8000/balance");
      const data = await res.json();
      setBalanceData(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load balance.");
    }
  }

  async function fetchChartData() {
    try {
      const res = await fetch("http://127.0.0.1:8000/chart");
      const data = await res.json();
      setChartData(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load chart data.");
    }
  }

  useEffect(() => {
    // Fetch initial data using the current wallet (or demo)
    fetchTransactions();
    fetchBalance();
    fetchChartData();
  }, [connectedAccount]);

  // ---------------------------
  // Connect to MetaMask
  // ---------------------------
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
        }
      } catch (err) {
        console.error(err);
        message.error("Failed to connect MetaMask.");
      }
    } else {
      message.warning("MetaMask not found! Please install it.");
    }
  };

  // ---------------------------
  // Table columns for transactions
  // ---------------------------
  const columns: ColumnsType<Transaction> = [
    {
      title: "Coin",
      dataIndex: "coin",
      key: "coin",
      width: 100,
    },
    {
      title: "Amount",
      dataIndex: "transaction_amount",
      key: "transaction_amount",
      render: (val: number) => `$${val.toFixed(2)}`,
      width: 120,
    },
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
      width: 130,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 130,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
    },
    {
      title: "Fees",
      dataIndex: "fees",
      key: "fees",
      render: (val: number) => val.toFixed(5),
      width: 80,
    },
  ];

  // ---------------------------
  // Quick Exchange
  // ---------------------------
  const handleQuickExchange = async (values: QuickExchangeFields) => {
    try {
      // Use connectedAccount if available; otherwise, use "demo"
      const walletAddress = connectedAccount || "demo";
      const payload = { wallet_address: walletAddress, ...values };
      const response = await fetch("http://127.0.0.1:8000/quick_exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Exchange request failed");
      }
      const data = await response.json();
      message.success(data.message);
      // After exchange, refresh transactions to show new simulated activity.
      fetchTransactions();
    } catch (error) {
      console.error(error);
      message.error("Exchange failed. Check console for details.");
    }
  };

  // ---------------------------
  // Layout toggle (for sider)
  // ---------------------------
  const onCollapse = (collapsedVal: boolean) => {
    setCollapsed(collapsedVal);
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={onCollapse} style={{ background: "#1b1e1e" }}>
        <div
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: 600,
            textAlign: "center",
            padding: "16px 0",
          }}
        >
          ZenVault
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: "#000", paddingLeft: 16, display: "flex", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#FFF" }}>Crypto Dashboard</h2>
        </Header>

        <Content style={{ margin: "16px", color: "#FFF" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="BTC Balance" precision={4} value={balanceData?.total_balance_btc ?? 0} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="USD Balance" precision={2} value={balanceData?.total_balance_usd ?? 0} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button type="primary" onClick={connectWallet} style={{ marginTop: 8 }}>
                {connectedAccount
                  ? `Connected: ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`
                  : "Connect Wallet"}
              </Button>
            </Col>
          </Row>

          {/* Market Chart and Quick Exchange */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} md={14}>
              <Card title="Market Chart">
                <Select
                  value={selectedChartCrypto}
                  onChange={(value) => {
                    setSelectedChartCrypto(value);
                    // Optionally update quick exchange form default:
                    form.setFieldsValue({ haveCoin: value });
                  }}
                  style={{ width: 120, marginBottom: 16 }}
                >
                  <Option value="BTC">BTC</Option>
                  <Option value="ETH">ETH</Option>
                  <Option value="DOGE">DOGE</Option>
                  <Option value="ADA">ADA</Option>
                </Select>
                <TradingViewChart
                  symbol={cryptoChartMapping[selectedChartCrypto]}
                  chartType="price"
                />
              </Card>
            </Col>

            <Col xs={24} md={10}>
              <Card title="Quick Exchange">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleQuickExchange}
                  initialValues={{ haveCoin: selectedChartCrypto, wantCoin: "USDT", haveAmount: 1 }}
                >
                  <Form.Item name="haveCoin" label="I have:">
                    <Select>
                      <Option value="BTC">BTC</Option>
                      <Option value="ETH">ETH</Option>
                      <Option value="USDT">USDT</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="haveAmount"
                    label="Amount"
                    rules={[{ required: true, message: "Enter the amount you have" }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item name="wantCoin" label="I want:">
                    <Select>
                      <Option value="BTC">BTC</Option>
                      <Option value="ETH">ETH</Option>
                      <Option value="USDT">USDT</Option>
                    </Select>
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Exchange
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>

          {/* Transactions Table */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card title="Recent Activities">
                <Table
                  dataSource={transactions}
                  columns={columns}
                  rowKey={(record) => record.transaction_id}
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 600 }}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
