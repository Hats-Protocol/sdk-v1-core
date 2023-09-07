import { GraphQLClient } from "graphql-request";

const ENDPOINT_PER_CHAIN: {
  [chainId: number]: string;
} = {
  1: "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-ethereum",
  5: "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-goerli",
  10: "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-optimism",
  100: "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-gnosis-chain",
  137: "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-polygon",
  42161:
    "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-v1-arbitrum",
};

export const getGraphqlClient = (
  chainId: number
): GraphQLClient | undefined => {
  const gqlEndpoint = ENDPOINT_PER_CHAIN[chainId];
  if (!gqlEndpoint) return;

  return new GraphQLClient(gqlEndpoint);
};
