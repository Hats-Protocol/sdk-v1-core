import type { EndpointsConfig } from "./types";

export const DEFAULT_ENDPOINTS_CONFIG: EndpointsConfig = {
  1: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-ethereum/version/latest",
  },
  10: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-optimism/version/latest",
  },
  100: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-gnosis-chain/version/latest",
  },
  137: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-polygon/version/latest",
  },
  42161: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-arbitrum/version/latest",
  },
  11155111: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-sepolia/version/latest",
  },
  8453: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-base/version/latest",
  },
  42220: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-celo/version/latest",
  },
  84532: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-base-sepolia/version/latest",
  },
};
