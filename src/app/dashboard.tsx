"use client";

import React, { useEffect, useState } from "react";
import { Layout, Input, Avatar, Card, Row, Col, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;

export default function dashboard() {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const response = await fetch("http://127.0.0.1:8000/market_overview");
        const data = await response.json();
        setMarketData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setLoading(false);
      }
    }
    fetchMarketData();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Header
          style={{
            backgroundColor: "#1f2128",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Input
              placeholder="Search..."
              style={{
                width: 200,
                backgroundColor: "#2a2c35",
                border: "none",
                color: "#fff",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <BellOutlined style={{ fontSize: 20, color: "#fff" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#fff" }}>Courtney Henry</span>
              <Avatar src="/user-avatar.png" />
            </div>
          </div>
        </Header>

        <Content style={{ margin: "16px", backgroundColor: "#181a20" }}>
          {loading ? (
            <Spin
              size="large"
              style={{ display: "block", margin: "auto", padding: "50px 0" }}
            />
          ) : (
            <>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
