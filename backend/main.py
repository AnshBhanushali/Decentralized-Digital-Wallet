from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

# For wallet verification via signature
from eth_account.messages import encode_defunct
from eth_account import Account

app = FastAPI()

# Allow CORS for local development (adjust as needed)
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use ["*"] to allow all origins if required
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# MODELS
# -----------------------

class Transaction(BaseModel):
    coin: str
    transaction_amount: float
    transaction_id: str
    date: str
    status: str
    fees: float

class Balance(BaseModel):
    total_balance_btc: float
    total_balance_usd: float

class ChartDataPoint(BaseModel):
    timestamp: str
    price: float

class WalletConnectResponse(BaseModel):
    message: str
    wallet_address: str

class TransactionsResponse(BaseModel):
    wallet_address: str
    transactions: List[Transaction]

class QuickExchangeRequest(BaseModel):
    wallet_address: str
    haveCoin: str
    haveAmount: float
    wantCoin: str

class QuickExchangeResponse(BaseModel):
    message: str
    exchangedAmount: float

# For verifying wallet signature (MetaMask)
class WalletVerificationRequest(BaseModel):
    wallet_address: str
    message_text: str  # The original message that was signed
    signature: str     # The signature produced by MetaMask

class WalletVerificationResponse(BaseModel):
    message: str
    verified: bool
    wallet_address: str

# -----------------------
# MOCK DATA
# -----------------------

# User wallets for portfolio endpoint
USER_WALLETS = {
    "user1": {
        "BTC": 0.5,
        "ETH": 2.0,
        "DOGE": 5000.0
    },
    "user2": {
        "BTC": 0.1,
        "ADA": 1000.0
    }
}

# Mapping from ticker symbol to CoinGecko coin ID
TICKER_TO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "DOGE": "dogecoin",
    "ADA": "cardano"
}

COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

# Simulated transactions (keyed by wallet address)
fake_transactions_db = {
    "0x123": [
        Transaction(
            transaction_id="tx1",
            coin="BTC",
            transaction_amount=0.5,
            date="2023-01-01T12:00:00",
            status="Completed",
            fees=0.12
        ),
        Transaction(
            transaction_id="tx2",
            coin="ETH",
            transaction_amount=2.0,
            date="2023-01-02T13:00:00",
            status="Completed",
            fees=0.05
        )
    ],
    "0xabc": [
        Transaction(
            transaction_id="tx3",
            coin="DOGE",
            transaction_amount=1000,
            date="2023-01-03T14:00:00",
            status="Pending",
            fees=0.001
        )
    ]
}

# Dummy balance data
fake_balance_db = Balance(
    total_balance_btc=355.056,
    total_balance_usd=4533899.30
)

# Dummy chart data
fake_chart_data = [
    ChartDataPoint(timestamp="2022-03-01", price=38000),
    ChartDataPoint(timestamp="2022-03-02", price=39000),
    ChartDataPoint(timestamp="2022-03-03", price=37000),
    ChartDataPoint(timestamp="2022-03-04", price=40000),
    ChartDataPoint(timestamp="2022-03-05", price=41000),
    ChartDataPoint(timestamp="2022-03-06", price=39500),
    ChartDataPoint(timestamp="2022-03-07", price=42000),
]

# -----------------------
# ENDPOINTS
# -----------------------

@app.get("/")
def root() -> Dict[str, Any]:
    return {"message": "Crypto Portfolio API is running!"}

@app.get("/portfolio")
def get_portfolio(user: str = Query(..., description="User ID or username")) -> Dict[str, Any]:
    if user not in USER_WALLETS:
        raise HTTPException(status_code=404, detail=f"User {user} not found.")
    coins = USER_WALLETS[user]
    # Map ticker symbols to CoinGecko IDs and ensure they're lowercase
    coin_ids = [TICKER_TO_ID.get(coin, coin).lower() for coin in coins.keys()]
    coinlist = ",".join(coin_ids)
    params = {
        "ids": coinlist,
        "vs_currencies": "usd",
        "include_24hr_change": "true"
    }
    response = requests.get(f"{COINGECKO_BASE_URL}/simple/price", params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch prices from CoinGecko.")
    price_data = response.json()
    total_value = 0.0
    breakdown = []
    for ticker, amount in coins.items():
        coin_id = TICKER_TO_ID.get(ticker, ticker).lower()
        if coin_id not in price_data:
            continue
        coin_price = price_data[coin_id].get("usd", 0)
        coin_change_24h = price_data[coin_id].get("usd_24hr_change", 0)
        value = amount * coin_price
        total_value += value
        breakdown.append({
            "coin": ticker,
            "amount": amount,
            "price": coin_price,
            "value": value,
            "change_24h": coin_change_24h
        })
    return {
        "user": user,
        "total_value": total_value,
        "coins": breakdown
    }

@app.get("/market_overview")
def get_market_overview() -> Dict[str, Any]:
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": 50,
        "page": 1,
        "sparkline": "false",
        "price_change_percentage": "24h"
    }
    resp = requests.get(f"{COINGECKO_BASE_URL}/coins/markets", params=params)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch market data from CoinGecko.")
    data = resp.json()
    if not data:
        return {"top_gainer": None, "top_loser": None}
    top_gainer = max(data, key=lambda c: c.get("price_change_percentage_24h", 0))
    top_loser = min(data, key=lambda c: c.get("price_change_percentage_24h", 0))
    return {
        "top_gainer": {
            "id": top_gainer.get("id"),
            "symbol": top_gainer.get("symbol"),
            "current_price": top_gainer.get("current_price"),
            "change_24h": top_gainer.get("price_change_percentage_24h"),
        },
        "top_loser": {
            "id": top_loser.get("id"),
            "symbol": top_loser.get("symbol"),
            "current_price": top_loser.get("current_price"),
            "change_24h": top_loser.get("price_change_percentage_24h"),
        }
    }

@app.get("/chart", response_model=List[ChartDataPoint])
def get_chart_data() -> List[ChartDataPoint]:
    return fake_chart_data

@app.post("/connect_wallet", response_model=WalletConnectResponse)
def connect_wallet(wallet_address: str = Query(..., description="Wallet address from MetaMask")):
    # In a real app, MetaMask handles connection on the client side.
    return WalletConnectResponse(message="Wallet connected successfully", wallet_address=wallet_address)

@app.get("/transactions", response_model=TransactionsResponse)
def get_transactions(wallet_address: str = Query(..., description="Wallet address to fetch transactions for")) -> TransactionsResponse:
    transactions = fake_transactions_db.get(wallet_address, [])
    return TransactionsResponse(wallet_address=wallet_address, transactions=transactions)

@app.post("/quick_exchange", response_model=QuickExchangeResponse)
def quick_exchange(request: QuickExchangeRequest) -> QuickExchangeResponse:
    # Define mock rates (USD per unit)
    rates = {
        "BTC": 40000.0,
        "ETH": 3000.0,
        "USDT": 1.0,
        "DOGE": 0.25,
        "ADA": 1.2
    }
    if request.haveCoin not in rates or request.wantCoin not in rates:
        raise HTTPException(status_code=400, detail="Unsupported coin for exchange.")
    rate = rates[request.haveCoin] / rates[request.wantCoin]
    exchanged = request.haveAmount * rate
    return QuickExchangeResponse(
        message=f"Successfully exchanged {request.haveAmount} {request.haveCoin} to {exchanged:.2f} {request.wantCoin} (mocked).",
        exchangedAmount=exchanged
    )

@app.post("/verify_wallet", response_model=WalletVerificationResponse)
def verify_wallet(request: WalletVerificationRequest) -> WalletVerificationResponse:
    """
    Verifies a wallet connection by checking a signed message.
    The client (MetaMask) should sign a specific message and send the signature,
    the original message, and the wallet address to this endpoint.
    """
    try:
        message_obj = encode_defunct(text=request.message_text)
        recovered_address = Account.recover_message(message_obj, signature=request.signature)
        if recovered_address.lower() != request.wallet_address.lower():
            raise HTTPException(status_code=400, detail="Invalid signature. Verification failed.")
        return WalletVerificationResponse(
            message="Wallet verified successfully.",
            verified=True,
            wallet_address=request.wallet_address
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
