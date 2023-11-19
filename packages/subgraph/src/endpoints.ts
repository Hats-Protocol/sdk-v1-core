import type { EndpointsConfig } from "./types";

export const DEFAULT_ENDPOINTS_CONFIG: EndpointsConfig = {
  1: {
    endpoint:
      "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-ethereum",
  },
  5: {
    endpoint:
      "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-goerli",
  },
  10: {
    endpoint:
      "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-optimism",
  },
  100: {
    endpoint:
      "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-gnosis-chain",
  },
  137: {
    endpoint:
      "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-polygon",
  },
  42161: {
    endpoint:
      "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-arbitrum",
  },
  424: {
    endpoint:
      "https://api.goldsky.com/api/public/project_clp1niaem0pe001qjhju6b9sz/subgraphs/hats-v1-pgn/1.0.0/gn",
  },
  11155111: {
    endpoint:
      "https://api.studio.thegraph.com/query/55784/hats-v1-sepolia/version/latest",
  },
};
