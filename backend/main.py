from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this as needed or use "*" to allow all origins.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USER_WALLETS = {
    "user1": {  # example user
        "BTC": 0.5,
        "ETH": 2.0,
        "DOGE": 5000.0
    },
    "user2": {
        "BTC": 0.1,
        "ADA": 1000.0
    }
}

COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

@app.get("/")
def root() -> Dict[str, Any]:
    return {"message": "Crypto Portfolio API is running!"}

@app.get("/portfolio")
def get_portfolio(user: str = Query(..., description="User ID or username")) -> Dict[str, Any]:
    if user not in USER_WALLETS:
        raise HTTPException(status_code=404, detail=f"User {user} not found.")

    coins = USER_WALLETS[user]
    symbols = [k.lower() for k in coins.keys()]

    # Build query param for CoinGecko
    coinlist = ",".join(symbols)
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
    for coin_symbol, amount in coins.items():
        coin_symbol_lower = coin_symbol.lower()
        if coin_symbol_lower not in price_data:
            continue
        coin_price = price_data[coin_symbol_lower].get("usd", 0)
        coin_change_24h = price_data[coin_symbol_lower].get("usd_24h_change", 0)
        value = amount * coin_price
        total_value += value
        breakdown.append({
            "coin": coin_symbol,
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
