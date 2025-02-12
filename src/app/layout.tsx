"use client";

import React from "react";
import { Layout } from "antd";
import Sidebar from "@/components/Sidebar"; // Import Sidebar component
import "./globals.css";

const { Content, Header } = Layout;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Layout style={{ minHeight: "100vh" }}>
          <Sidebar /> {/* Sidebar is now a separate reusable component */}

          <Layout>
            <Header
              style={{
                padding: "0 16px",
                background: "#1b1e35",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ color: "#fff" }}>Hello, Jane Doe</div>
            </Header>
            <Content style={{ margin: "16px" }}>{children}</Content>
          </Layout>
        </Layout>
      </body>
    </html>
  );
}
