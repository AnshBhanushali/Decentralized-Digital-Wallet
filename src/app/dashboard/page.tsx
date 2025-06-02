"use client";

import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import {
  Layout,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Form,
  Input,
  Select,
  Modal,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ethers } from "ethers";
import TradingViewChart from "@/components/stockchart";

const { Header, Content } = Layout;
const { Option } = Select;

// ─── Step 1: Define interfaces for backend responses ────────────────────────────────
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

// We had ChartDataPoint and QuickExchangeFields before, but if 'chartData' is unused,
// and we're submitting the Quick Exchange form manually, you can drop them if you never
// reference `chartData` or post Quick Exchange from this page. For now, we'll keep QuickExchangeFields:

interface QuickExchangeFields {
  haveCoin: string;
  haveAmount: number;
  wantCoin: string;
}

// ─── Step 2: Mapping for TradingViewChart ───────────────────────────────────────────
const cryptoChartMapping: Record<string, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  DOGE: "DOGEUSDT",
  ADA: "ADAUSDT",
};



const Dashboard: NextPage = () => {
  // ───── State ─────────────────────────────────────────────────────────────────────
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);

  // Market Chart / quick exchange
  const [selectedChartCrypto, setSelectedChartCrypto] = useState<"BTC" | "ETH" | "DOGE" | "ADA">(
    "BTC"
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm<QuickExchangeFields>();
  // ─────────────────────────────────────────────────────────────────────────────────────

  // ─── Step 3: Base URL for backend calls ───────────────────────────────────────────────
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  // ─────────────────────────────────────────────────────────────────────────────────────

  // ─── Step 4: Table columns ───────────────────────────────────────────────────────────
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
  // ─────────────────────────────────────────────────────────────────────────────────────

  // ─── Step 5: Inline fetch calls inside useEffect ─────────────────────────────────────
  useEffect(() => {
    // Fetch transactions
    (async () => {
      const walletAddress = connectedAccount || "demo";
      try {
        const res = await fetch(
          `${API_BASE_URL}/transactions?wallet_address=${walletAddress}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr: Transaction[] = Array.isArray(data) ? data : data.transactions || [];
        setTransactions(arr);
      } catch (err) {
        console.error("Error loading transactions:", err);
        message.error("Failed to load transactions.");
      }
    })();

    // Fetch balance
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/balance`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BalanceData = await res.json();
        setBalanceData(data);
      } catch (err) {
        console.error("Error loading balance:", err);
        message.error("Failed to load balance.");
      }
    })();
  }, [connectedAccount, API_BASE_URL]);
  // ─────────────────────────────────────────────────────────────────────────────────────

  // ─── Step 6: MetaMask/Wallet connection logic ────────────────────────────────────────
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
          message.success("Wallet connected successfully.");
        }
      } catch (err) {
        console.error("MetaMask connection error:", err);
        message.error("Failed to connect MetaMask.");
      }
    } else {
      setModalVisible(true);
    }
  };

  const handleModalOk = () => {
    window.open(
      "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
      "_blank"
    );
    setModalVisible(false);
  };
  const handleModalCancel = () => setModalVisible(false);
  // ─────────────────────────────────────────────────────────────────────────────────────

  // ─── Step 7: Quick Exchange handler ──────────────────────────────────────────────────
  const handleQuickExchange = async (values: QuickExchangeFields) => {
    try {
      const walletAddress = connectedAccount || "demo";
      const payload = {
        wallet_address: walletAddress,
        haveCoin: values.haveCoin,
        haveAmount: values.haveAmount,
        wantCoin: values.wantCoin,
      };
      const response = await fetch(`${API_BASE_URL}/quick_exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Exchange request failed");
      const data = await response.json();
      message.success(data.message);
      // Refresh transactions after exchange:
      const res2 = await fetch(
        `${API_BASE_URL}/transactions?wallet_address=${walletAddress}`
      );
      if (res2.ok) {
        const newTx: Transaction[] = Array.isArray(await res2.json())
          ? await res2.json()
          : (await (await res2.json()).transactions) || [];
        setTransactions(newTx);
      }
    } catch (error) {
      console.error("Quick Exchange error:", error);
      message.error("Exchange failed. Check console for details.");
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────────────

  // ─── Step 8: Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Header style={{ paddingLeft: 16, display: "flex", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#FFF" }}>Crypto Dashboard</h2>
        </Header>

        <Content style={{ margin: "16px", color: "#FFF" }}>
          {/* Balance & Connect Wallet row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="BTC Balance"
                  precision={4}
                  value={balanceData?.total_balance_btc ?? 0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="USD Balance"
                  precision={2}
                  value={balanceData?.total_balance_usd ?? 0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button type="primary" onClick={connectWallet} style={{ marginTop: 8 }}>
                {connectedAccount
                  ? `Connected: ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(
                      -4
                    )}`
                  : "Connect Wallet"}
              </Button>
            </Col>
          </Row>

          {/* MetaMask Not Found Modal */}
          <Modal
            title="MetaMask Not Found"
            open={modalVisible}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            okText="Install MetaMask"
            cancelText="Cancel"
          >
            <p>
              MetaMask is required to connect your wallet. Please install the MetaMask
              extension from the Chrome Web Store to proceed.
            </p>
          </Modal>

          {/* Market Chart & Quick Exchange */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} md={14}>
              <Card title="Market Chart">
                <Select
                  value={selectedChartCrypto}
                  onChange={(value: typeof selectedChartCrypto) => {
                    setSelectedChartCrypto(value);
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
                <Form<QuickExchangeFields>
                  form={form}
                  layout="vertical"
                  onFinish={handleQuickExchange}
                  initialValues={{
                    haveCoin: selectedChartCrypto,
                    wantCoin: "USDT",
                    haveAmount: 1,
                  }}
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

          {/* Recent Activities Table */}
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
