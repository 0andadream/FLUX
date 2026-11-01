"use client";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider, type State } from "wagmi";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

export function Providers({ children, initialState }: { children: React.ReactNode; initialState?: State }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#8b7cff",
            accentColorForeground: "#ffffff",
            borderRadius: "small",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
