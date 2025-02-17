"use client";

import React, { useEffect } from "react";
import { Layout, Card, Form, Input, Switch, Select, Button, message } from "antd";
import { ethers } from "ethers";

const { Header, Content } = Layout;
const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  // Load stored settings on mount.
  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "";
    const storedEmail = localStorage.getItem("userEmail") || "";
    const storedWallet = localStorage.getItem("walletAddress") || "";
    const storedDarkMode = localStorage.getItem("darkMode");
    form.setFieldsValue({
      userName: storedName,
      userEmail: storedEmail,
      walletAddress: storedWallet,
      darkMode: storedDarkMode ? storedDarkMode === "true" : true,
    });
  }, [form]);

  // Connect to MetaMask and save the wallet address.
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          form.setFieldsValue({ walletAddress: walletAddress });
          localStorage.setItem("walletAddress", walletAddress);
          message.success("Wallet connected successfully.");
        }
      } catch (error) {
        console.error("MetaMask connection error:", error);
        message.error("Failed to connect MetaMask.");
      }
    } else {
      message.warning("MetaMask not found! Please install it.");
    }
  };

  const handleSaveSettings = (values: any) => {
    // Save settings to localStorage (or send to your backend)
    localStorage.setItem("userName", values.userName);
    localStorage.setItem("userEmail", values.userEmail);
    localStorage.setItem("walletAddress", values.walletAddress || "");
    localStorage.setItem("darkMode", values.darkMode);
    localStorage.setItem("language", values.language);
    message.success("Settings saved successfully.");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{padding: "0 24px" }}>
        <h2 style={{ color: "#FFF", fontSize: '24px' }}>Settings</h2>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Card title="User & Wallet Settings" style={{ maxWidth: 600, margin: "0 auto" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveSettings}
            initialValues={{
              userName: "",
              userEmail: "",
              walletAddress: "",
              darkMode: true,
              language: "en",
            }}
          >
            <Form.Item
              label="Your Name"
              name="userName"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Enter your name" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="userEmail"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item
              label="Wallet Address"
              name="walletAddress"
              tooltip="Your wallet address will be used for on-chain transactions."
            >
              <Input placeholder="0x..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={connectWallet}>
                Connect MetaMask
              </Button>
            </Form.Item>
            <Form.Item label="Dark Mode" name="darkMode" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Language" name="language">
              <Select>
                <Option value="en">English</Option>
                <Option value="es">Spanish</Option>
                <Option value="fr">French</Option>
                <Option value="de">German</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Settings;
