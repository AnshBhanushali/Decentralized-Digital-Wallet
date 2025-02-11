// src/app/page.tsx
"use client";

import React from 'react';
import { Card, Row, Col, Table } from 'antd';

interface Transaction {
  key: string;
  name: string;
  date: string;
  amount: number;
}

const columns = [
  {
    title: 'Transaction',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (amount: number) => <span>${amount}</span>,
  },
];

const data: Transaction[] = [
  {
    key: '1',
    name: 'Buy BTC',
    date: 'Aug 28, 08:00',
    amount: 1200,
  },
  {
    key: '2',
    name: 'Buy ETH',
    date: 'Aug 27, 10:15',
    amount: 800,
  },
  {
    key: '3',
    name: 'Sell ADA',
    date: 'Aug 26, 16:30',
    amount: 350,
  },
];

export default function Page() {
  return (
    <div style={{ width: '100%' }}>
      {/* Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <h4 style={{ color: '#a6a8b6' }}>Portfolio Value</h4>
            <h2 style={{ marginTop: 8 }}>$45,720</h2>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <h4 style={{ color: '#a6a8b6' }}>24h Change</h4>
            <h2 style={{ marginTop: 8, color: '#56fca2' }}>+3.2%</h2>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <h4 style={{ color: '#a6a8b6' }}>Top Gainer</h4>
            <h2 style={{ marginTop: 8 }}>BTC +5%</h2>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <h4 style={{ color: '#a6a8b6' }}>Top Loser</h4>
            <h2 style={{ marginTop: 8, color: '#ff6370' }}>ETH -2.5%</h2>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Card style={{ marginTop: 24 }} title="Recent Transactions">
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>
    </div>
  );
}
