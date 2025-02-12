from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Allow CORS for local dev from Next.js
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

class ExchangeRequest(BaseModel):
    haveCoin: str
    haveAmount: float
    wantCoin: str

class ExchangeResponse(BaseModel):
    message: str
    exchangedAmount: float


# -----------------------
# MOCK DATA
# -----------------------
fake_transactions_db = [
    Transaction(
        coin="BTC", transaction_amount=659.10,
        transaction_id="#14525156", date="Mar 21, 2022",
        status="Completed", fees=0.12000
    ),
    Transaction(
        coin="USDT", transaction_amount=551.10,
        transaction_id="#03483195", date="Mar 29, 2022",
        status="Declined", fees=1.23450
    ),
    Transaction(
        coin="BTC", transaction_amount=297.10,
        transaction_id="#85200197", date="Mar 30, 2022",
        status="Pending", fees=7.5732
    ),
    Transaction(
        coin="BTC", transaction_amount=523.10,
        transaction_id="#00078867", date="Apr 01, 2022",
        status="Completed", fees=0.49687
    )
]

fake_balance_db = Balance(
    total_balance_btc=355.056,
    total_balance_usd=4533899.30
)

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
@app.get("/transactions", response_model=List[Transaction])
def get_transactions():
    """Returns a list of example transactions."""
    return fake_transactions_db

@app.get("/balance", response_model=Balance)
def get_balance():
    """Returns a dummy total balance data."""
    return fake_balance_db

@app.get("/chart", response_model=List[ChartDataPoint])
def get_chart_data():
    """Returns mock data points for chart display."""
    return fake_chart_data

@app.post("/quick_exchange", response_model=ExchangeResponse)
def quick_exchange(request: ExchangeRequest):
    """
    Mocks an exchange.  
    In reality, you'd calculate exchange rates, fees, etc.
    """
    # For demonstration, let's pretend the rate is 400 USD for 1 "haveCoin".
    # If wantCoin is also BTC, you'd do a different ratio. This is just a mock.
    mockRate = 400.0
    if request.haveCoin == "USDT":
        # If user has USDT, maybe the rate is 1 USDT = 1 USD
        mockRate = 1.0

    # Calculate how much we get
    exchanged = request.haveAmount * mockRate

    return ExchangeResponse(
        message=(
            f"Successfully exchanged {request.haveAmount} {request.haveCoin} "
            f"to approx {exchanged} {request.wantCoin} (mocked)."
        ),
        exchangedAmount=exchanged
    )
