from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for development (so your Next.js app can fetch from localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact domain(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/dashboard")
def get_dashboard_data():
    return {
        "coins": [
            {"name": "Bitcoin", "symbol": "BTC", "price": 52291, "change": 0.25},
            {"name": "Litecoin", "symbol": "LTC", "price": 8291, "change": 0.25},
            {"name": "Ethereum", "symbol": "ETH", "price": 28291, "change": 0.25},
            {"name": "Solana", "symbol": "SOL", "price": 14291, "change": -0.25},
        ],
        "chart": {
            "currentPrice": 35352.02,
            "history": [  # Example array of historical prices
                40000, 38000, 37000, 35000, 34000, 36000, 35352
            ]
        },
        "portfolio": [
            {"name": "Ethereum", "price": 3245.03, "change": -13.4},
            {"name": "Bitcoin", "price": 3245.03, "change": -8.0},
            {"name": "Litecoin", "price": 3245.03, "change": 14.25},
            {"name": "Solana", "price": 3245.03, "change": -2.0},
            {"name": "Binance Coin", "price": 3245.03, "change": 12.0},
        ],
        "liveMarket": [
            {
                "name": "Bitcoin",
                "change": 12.00,
                "marketCap": "$3.560M",
                "volume24h": "$65.20M",
                "price": 48032.32
            },
            {
                "name": "Ethereum",
                "change": -1.20,
                "marketCap": "$2.300M",
                "volume24h": "$45.10M",
                "price": 37214.60
            },
        ]
    }
