"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  WalletOutlined,
  BankOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

// Define your menu items with keys that match your routes
const menuItems = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
  },
  {
    key: "/portfolio",
    icon: <WalletOutlined />,
    label: <Link href="/portfolio">Portfolio</Link>,
  },
  {
    key: "/transactions",
    icon: <BankOutlined />,
    label: <Link href="/transactions">Transactions</Link>,
  },
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: <Link href="/settings">Settings</Link>,
  },
];

export default function Sidebar() {
  // Local state to track when the component has mounted.
  // This prevents hydration mismatches due to client-only values.
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Until the component has mounted on the client,
  // return null (or a placeholder) to avoid mismatches.
  if (!mounted) {
    return null;
  }

  // Normalize the selected key:
  // For example, if the current route is "/" (or empty),
  // we want to highlight the Portfolio menu item.
  let normalizedPath = pathname;
  if (pathname === "/" || pathname === "") {
    normalizedPath = "/portfolio";
  }
  const selectedKeys = [normalizedPath];

  return (
    <Sider collapsible style={{ background: "#1b1e35" }} defaultCollapsed={false}>
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
      <Menu
        theme="dark"
        mode="inline"
        style={{ background: "#1b1e35" }}
        selectedKeys={selectedKeys} // This will match the current route
        items={menuItems}
      />
    </Sider>
  );
}
