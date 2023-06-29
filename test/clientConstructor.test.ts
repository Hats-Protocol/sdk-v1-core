import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http } from "viem";
import { mainnet, goerli } from "viem/chains";

describe("client Constructor tests", () => {
  describe("Hats client is initialized", () => {
    test("Client non matching chain to public client", () => {
      let publicClient = createPublicClient({
        chain: mainnet,
        transport: http("http://127.0.0.1:8545"),
      });

      let walletClient = createWalletClient({
        chain: mainnet,
        transport: http("http://127.0.0.1:8545"),
      });
      expect(() => {
        new HatsClient({
          chainId: goerli.id,
          publicClient: publicClient,
          walletClient: walletClient,
        });
      }).toThrow("Provided chain id should match the public client chain id");
    });

    test("Client non matching chain to wallet client", () => {
      let publicClient = createPublicClient({
        chain: mainnet,
        transport: http("http://127.0.0.1:8545"),
      });

      let walletClient = createWalletClient({
        chain: goerli,
        transport: http("http://127.0.0.1:8545"),
      });
      expect(() => {
        new HatsClient({
          chainId: mainnet.id,
          publicClient: publicClient,
          walletClient: walletClient,
        });
      }).toThrow("Provided chain id should match the wallet client chain id");
    });
  });
});
