import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, createConfig, injected } from "wagmi";
import { celo } from "wagmi/chains";
import { CELO_RPC } from "./celo";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const walletConnectEnabled = Boolean(projectId);

export const config = projectId
  ? getDefaultConfig({
      appName: "Flux",
      projectId,
      chains: [celo],
      ssr: true,
    })
  : createConfig({
      chains: [celo],
      connectors: [injected()],
      transports: { [celo.id]: http(CELO_RPC) },
      ssr: true,
    });
