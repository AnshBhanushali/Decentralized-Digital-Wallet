"use client";

import React, { useState } from "react";
import { Button, Modal, message } from "antd";
import { ethers } from "ethers";

const MetaMaskConnect: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          message.success("Wallet connected successfully.");
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
        message.error("Failed to connect MetaMask.");
      }
    } else {
      // If MetaMask is not found, open the modal
      setModalVisible(true);
    }
  };

  const handleModalOk = () => {
    // Redirect to MetaMask installation page (Chrome Web Store)
    window.open("https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn", "_blank");
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "16px" }}>
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <Button type="primary" onClick={connectWallet}>
          Connect MetaMask
        </Button>
      )}
      <Modal
        title="MetaMask Not Found"
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Install MetaMask"
        cancelText="Cancel"
      >
        <p>MetaMask is required to connect your wallet. Please install the MetaMask extension from the Chrome Web Store.</p>
      </Modal>
    </div>
  );
};

export default MetaMaskConnect;
