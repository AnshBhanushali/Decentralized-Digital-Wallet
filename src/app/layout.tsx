"use client";

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  WalletOutlined,
  BankOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import './globals.css';

const { Sider, Content, Header } = Layout;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Layout style={{ minHeight: '100vh' }}>
          {/* ---------- Sidebar ---------- */}
          <Sider collapsible style={{ background: '#1b1e35' }} defaultCollapsed={false}>
            <div
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: 600,
                textAlign: 'center',
                padding: '16px 0',
              }}
            >
              ZenVault
            </div>
            <Menu
              theme="dark"
              mode="inline"
              style={{ background: '#1b1e35' }}
              defaultSelectedKeys={['1']}
              items={[
                {
                  key: '1',
                  icon: <DashboardOutlined />,
                  label: 'Dashboard',
                },
                {
                  key: '2',
                  icon: <WalletOutlined />,
                  label: 'Portfolio',
                },
                {
                  key: '3',
                  icon: <BankOutlined />,
                  label: 'Transactions',
                },
                {
                  key: '4',
                  icon: <SettingOutlined />,
                  label: 'Settings',
                },
              ]}
            />
          </Sider>

          {/* ---------- Main Content ---------- */}
          <Layout>
            <Header
              style={{
                padding: '0 16px',
                background: '#1b1e35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <div style={{ color: '#fff' }}>Hello, Jane Doe</div>
            </Header>
            <Content style={{ margin: '16px' }}>{children}</Content>
          </Layout>
        </Layout>
      </body>
    </html>
  );
}
