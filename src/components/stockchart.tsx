"use client";

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

type TradingViewChartProps = {
  symbol: string; // e.g. "BTCUSDT", "ETHUSDT", etc.
  chartType?: string; // e.g. "price" or "change"
};

export default function TradingViewChart({
  symbol,
  chartType = "price",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  // Generate a unique container id based on symbol and chart type.
  const uniqueContainerId = `tv_chart_container_${symbol.replace(/\W/g, "")}_${chartType}`;

  // Load the TradingView script only once.
  useEffect(() => {
    if (scriptLoadedRef.current) {
      initTradingViewWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      initTradingViewWidget();
    };
    script.onerror = () => {
      console.error("Failed to load TradingView script");
    };

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    } else {
      console.error("Container ref not found");
    }
  }, []);

  // Reinitialize the widget when symbol or chartType changes.
  useEffect(() => {
    if (scriptLoadedRef.current && window.TradingView) {
      initTradingViewWidget();
    }
  }, [symbol, chartType]);

  function initTradingViewWidget() {
    if (!containerRef.current) {
      console.error("Container ref is not available");
      return;
    }

    // Clear any previous content and insert a new div with the unique id.
    containerRef.current.innerHTML = `<div id="${uniqueContainerId}" style="width:100%; height:400px;"></div>`;

    // Configure the widget. Note the symbol now has the exchange prefix "BINANCE:".
    const widgetConfig = {
      container_id: uniqueContainerId,
      width: "100%",
      height: 400,
      symbol: `BINANCE:${symbol}`, // Now includes exchange prefix.
      interval: chartType === "change" ? "D" : "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#f1f3f6",
      hide_side_toolbar: false,
      allow_symbol_change: true,
      withdateranges: true,
      enable_publishing: false,
    };

    try {
      new window.TradingView.widget(widgetConfig);
    } catch (error) {
      console.error("Error initializing TradingView widget:", error);
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", minHeight: 400 }}
    >
      {/* TradingView widget will be injected here */}
    </div>
  );
}
