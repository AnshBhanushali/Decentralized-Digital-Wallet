// src/components/stockchart.tsx
"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    TradingView?: {
      // Tell TypeScript that TradingView.widget can be called with `new`
      widget: { new (config: Record<string, unknown>): void };
    };
  }
}

type TradingViewChartProps = {
  symbol: string;       // e.g. "BTCUSDT"
  chartType?: "price" | "change";
};

export default function TradingViewChart({
  symbol,
  chartType = "price",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Unique container ID
  const uniqueContainerId = `tv_chart_${symbol.replace(/\W/g, "")}_${chartType}`;

  // 1) Load the TradingView script into <head> only once
  useEffect(() => {
    if (scriptLoaded) return;

    // If already added, simply mark as loaded
    if (document.getElementById("tradingview-widget-script")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "tradingview-widget-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load TradingView script");
    };

    document.head.appendChild(script);
  }, [scriptLoaded]);

  // 2) Wait until window.TradingView.widget is available
  const waitForTradingView = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.TradingView && typeof window.TradingView.widget === "function") {
        resolve();
      } else {
        const handle = setInterval(() => {
          if (window.TradingView && typeof window.TradingView.widget === "function") {
            clearInterval(handle);
            resolve();
          }
        }, 50);
      }
    });
  };

  // 3) Initialize (or reinitialize) the widget
  const initTradingViewWidget = useCallback(async () => {
    if (!scriptLoaded || !containerRef.current) return;

    // Wait for the TradingView object to exist
    await waitForTradingView();

    // Clear prior contents and inject a div with the unique ID
    containerRef.current.innerHTML = `<div id="${uniqueContainerId}" style="width:100%; height:400px;"></div>`;

    const widgetConfig: Record<string, unknown> = {
      container_id: uniqueContainerId,
      width: "100%",
      height: 400,
      symbol: `BINANCE:${symbol}`,      // e.g. “BINANCE:BTCUSDT”
      interval: chartType === "change" ? "D" : "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: 1,
      locale: "en",
      toolbar_bg: "#f1f3f6",
      hide_side_toolbar: false,
      allow_symbol_change: true,
      withdateranges: true,
      enable_publishing: false,
    };

    try {
      // Now TypeScript knows widget is new-able
      new window.TradingView!.widget(widgetConfig);
    } catch (err) {
      console.error("Error initializing TradingView widget:", err);
    }
  }, [symbol, chartType, scriptLoaded, uniqueContainerId]);

  // 4) Reinitialize whenever scriptLoaded flips to true, or symbol/chartType changes
  useEffect(() => {
    initTradingViewWidget();
  }, [initTradingViewWidget]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", minHeight: 400 }}
    >
      {/* TradingView widget div will be injected here */}
    </div>
  );
}
