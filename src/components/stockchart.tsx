"use client";

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

type TradingViewChartProps = {
  symbol: string; // e.g. 'BTCUSDT', 'ETHUSDT', etc.
  chartType?: string; // e.g. 'price' or 'change'
};

export default function TradingViewChart({ symbol, chartType = "price" }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Load the TradingView script only once
  useEffect(() => {
    if (scriptLoadedRef.current) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      initTradingViewWidget(symbol);
    };

    containerRef.current?.appendChild(script);
  }, []);

  // Reinitialize widget if the symbol changes
  useEffect(() => {
    if (scriptLoadedRef.current && window.TradingView) {
      initTradingViewWidget(symbol);
    }
  }, [symbol]);

  function initTradingViewWidget(symbolValue: string) {
    if (!chartRef.current) return;

    // Clear previous chart
    chartRef.current.innerHTML = '';

    // Example: Adjust widget config based on chartType (you can customize this logic)
    const widgetConfig = {
      container_id: 'tv_chart_container',
      width: '100%',
      height: 400,
      symbol: symbolValue,
      interval: chartType === "change" ? 'D' : '60', // For example, use a daily interval for 24h change charts
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#f1f3f6',
      hide_side_toolbar: false,
      allow_symbol_change: true,
      withdateranges: true,
      enable_publishing: false,
    };

    new window.TradingView.widget(widgetConfig);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: 400 }}>
      <div
        id="tv_chart_container"
        ref={chartRef}
        style={{ width: '100%', height: 400 }}
      />
    </div>
  );
}
