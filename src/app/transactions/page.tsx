"use client";

import React, { useEffect, useState } from "react";
import { Table, Card, Input, Row, Col, Button, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

interface Transaction {
  transaction_id: string;
  coin: string;
  transaction_amount: number;
  date: string;
  status: string;
  fees: number;
  wallet?: string;
}

// Sample transaction data with a wallet field.
// In a real app, you'll fetch this from your backend.
const transactionsData: Transaction[] = [
  {
    transaction_id: "tx1",
    coin: "BTC",
    transaction_amount: 0.5,
    date: "2023-01-01T12:00:00",
    status: "Completed",
    fees: 0.12,
    wallet: "demo",
  },
  {
    transaction_id: "tx2",
    coin: "ETH",
    transaction_amount: 2.0,
    date: "2023-01-02T13:00:00",
    status: "Completed",
    fees: 0.05,
    wallet: "0x123",
  },
  {
    transaction_id: "tx3",
    coin: "DOGE",
    transaction_amount: 1000,
    date: "2023-01-03T14:00:00",
    status: "Pending",
    fees: 0.001,
    wallet: "0xabc",
  },
  {
    transaction_id: "tx4",
    coin: "BTC",
    transaction_amount: 1.2,
    date: "2023-01-04T15:00:00",
    status: "Completed",
    fees: 0.15,
    wallet: "0x123",
  },
];

const columns: ColumnsType<Transaction> = [
  { title: "Transaction ID", dataIndex: "transaction_id", key: "transaction_id" },
  { title: "Coin", dataIndex: "coin", key: "coin" },
  { 
    title: "Amount", 
    dataIndex: "transaction_amount", 
    key: "transaction_amount", 
    render: (value: number) => `$${value.toFixed(2)}`,
  },
  { title: "Date", dataIndex: "date", key: "date" },
  { title: "Status", dataIndex: "status", key: "status" },
  { 
    title: "Fees", 
    dataIndex: "fees", 
    key: "fees", 
    render: (value: number) => value.toFixed(5),
  },
];

const TransactionPage: React.FC = () => {
  const [wallet, setWallet] = useState<string>("demo");
  const [data, setData] = useState<Transaction[]>([]);
  const [searchText, setSearchText] = useState("");

  // Filter transactions based on selected wallet and search text.
  useEffect(() => {
    const filtered = transactionsData.filter((tx) => {
      // Only include transactions matching the selected wallet.
      const matchesWallet = tx.wallet === wallet;
      // Search by transaction id, coin, or status.
      const lowerSearch = searchText.toLowerCase();
      const matchesSearch =
        tx.transaction_id.toLowerCase().includes(lowerSearch) ||
        tx.coin.toLowerCase().includes(lowerSearch) ||
        tx.status.toLowerCase().includes(lowerSearch);
      return matchesWallet && (searchText === "" || matchesSearch);
    });
    setData(filtered);
  }, [wallet, searchText]);

  return (
    <div style={{ padding: "24px" }}>
      <Card title="Recent Transactions" style={{ marginBottom: "24px"}}>
        <Row justify="space-between" align="middle" style={{ marginBottom: "16px" }}>
          <Col>
            <Select 
              value={wallet}
              onChange={(value) => setWallet(value)}
              style={{ width: 200 }}
            >
              {/* In a real app, you might derive these from the user's available accounts */}
              <Option value="demo">Demo Account</Option>
              <Option value="0x123">0x123</Option>
              <Option value="0xabc">0xabc</Option>
            </Select>
          </Col>
          <Col>
            <Input
              placeholder="Search transactions"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={() => setSearchText("")}>
              Clear Search
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="transaction_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default TransactionPage;
