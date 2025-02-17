# Crypto Wallet Dashboard

A crypto wallet dashboard built with Next.js and FastAPI that connects to a local Ethereum node using ethers.js. It displays balances, market charts, transactions, and simulates quick token exchanges with demo mode support.

## Features

- **Local Node Connection:** Connects directly to a local Ethereum node (Geth) via ethers.js (no MetaMask required).
- **Real-Time Data:** Fetches crypto prices and market data from CoinGecko.
- **Transaction Management:** Displays recent activities and simulates token exchanges.
- **Demo Mode:** Users without a connected wallet can use demo mode.
- **FastAPI Backend:** Provides endpoints for portfolio data, market overview, and quick exchanges.

## Tech Stack

- **Frontend:** Next.js, React, Ant Design, ethers.js, Recharts
- **Backend:** FastAPI, Python, CoinGecko API
- **Blockchain:** Local Ethereum node via Geth

## Installation

### Frontend

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anshbhanushali/crypto-wallet-dashboard.git
   cd crypto
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

### Backend

1. **Navigate to the backend directory (if separated):**
   ```bash
   cd backend
   ```
2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Return to the root directory:**
   ```bash
   cd ..
   ```

## Running the Application

1. **Start the FastAPI backend:**
   ```bash
   uvicorn backend.main:app --reload
   ```
2. **Run the Next.js frontend:**
   ```bash
   npm run dev
   ```
3. **Access the App:**  
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements.

## License

This project is licensed under the MIT License.
