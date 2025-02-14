"use client";
declare global {
  interface Window {
    ethereum?: any;
  }
}

export {};
import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
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
} from 'antd';
import { WalletOutlined, AreaChartOutlined, SwapOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ethers } from 'ethers';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

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

const { Header, Sider, Content } = Layout;
const { Option } = Select;

/**
 * This page acts as your entire crypto dashboard:
 *  - Connect wallet
 *  - Display BTC / USD balances
 *  - Transactions table
 *  - Quick exchange form
 *  - Price chart
 */
const Dashboard: NextPage = () => {
  // ---------------------------
  // State
  // ---------------------------
  const [collapsed, setCollapsed] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  // Form
  const [form] = Form.useForm();

  // ---------------------------
  // Fetch data from FastAPI
  // ---------------------------
  async function fetchTransactions() {
    try {
      const res = await fetch('http://127.0.0.1:8000/transactions');
      const data = await res.json();
      console.log('Fetched transactions:', data);
      // Ensure that the data is an array.
      // Adjust the logic below if your API response shape is different.
      const transactionsArray = Array.isArray(data)
        ? data
        : data.transactions || [];
      setTransactions(transactionsArray);
    } catch (err) {
      console.error(err);
      message.error('Failed to load transactions.');
    }
  }

  async function fetchBalance() {
    try {
      const res = await fetch('http://127.0.0.1:8000/balance');
      const data = await res.json();
      setBalanceData(data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load balance.');
    }
  }

  async function fetchChartData() {
    try {
      const res = await fetch('http://127.0.0.1:8000/chart');
      const data = await res.json();
      setChartData(data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load chart data.');
    }
  }

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
    fetchChartData();
  }, []);

  // ---------------------------
  // Connect to MetaMask
  // ---------------------------
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
        }
      } catch (err) {
        console.error(err);
        message.error('Failed to connect MetaMask.');
      }
    } else {
      message.warning('MetaMask not found! Please install it.');
    }
  };

  // ---------------------------
  // Table columns
  // ---------------------------
  const columns: ColumnsType<Transaction> = [
    {
      title: 'Coin',
      dataIndex: 'coin',
      key: 'coin',
      width: 100,
    },
    {
      title: 'Amount',
      dataIndex: 'transaction_amount',
      key: 'transaction_amount',
      render: (val: number) => `$${val.toFixed(2)}`,
      width: 120,
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      width: 130,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 130,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: 'Fees',
      dataIndex: 'fees',
      key: 'fees',
      render: (val: number) => val.toFixed(5),
      width: 80,
    },
  ];

  // ---------------------------
  // Quick Exchange
  // ---------------------------
  interface QuickExchangeFields {
    haveCoin: string;
    haveAmount: number;
    wantCoin: string;
  }

  const handleQuickExchange = async (values: QuickExchangeFields) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/quick_exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error('Exchange request failed');
      }
      const data = await response.json();
      message.success(data.message);
    } catch (error) {
      console.error(error);
      message.error('Exchange failed. Check console for details.');
    }
  };

  // ---------------------------
  // Layout toggle (for sider)
  // ---------------------------
  const onCollapse = (collapsedVal: boolean) => {
    setCollapsed(collapsedVal);
  };

  // ---------------------------
  // Menu items for the sidebar using the items prop
  // ---------------------------


  // ---------------------------
  // Render
  // ---------------------------
  return (
    <Layout style={{ minHeight: '100vh' }}>

      <Layout>
        <Header style={{ background: '#0000', paddingLeft: 16, display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#FFF' }}>Crypto Dashboard</h2>
        </Header>

        <Content style={{ margin: '16px',color: '#FFF' }}>
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
                  ? `Connected: ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`
                  : 'Connect Wallet'}
              </Button>
            </Col>
          </Row>

          {/* Chart and Transaction Table */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} md={14}>
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

            <Col xs={24} md={10}>
              <Card title="Market Chart" style={{ marginBottom: 16 }}>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Quick Exchange">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleQuickExchange}
                  initialValues={{ haveCoin: 'BTC', wantCoin: 'USDT', haveAmount: 1 }}
                >
                  <Form.Item name="haveCoin" label="I have :">
                    <Select>
                      <Option value="BTC">BTC</Option>
                      <Option value="ETH">ETH</Option>
                      <Option value="USDT">USDT</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="haveAmount"
                    label="Amount"
                    rules={[{ required: true, message: 'Enter the amount you have' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item name="wantCoin" label="I want :">
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
