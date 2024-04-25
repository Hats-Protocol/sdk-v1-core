import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { createAnvil } from "@viem/anvil";
import type { Anvil } from "@viem/anvil";
import "dotenv/config";

describe("client Constructor tests", () => {
  let anvil: Anvil;

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.SEPOLIA_RPC,
      startTimeout: 20000,
    });
    await anvil.start();
  });

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  describe("Hats client is initialized", () => {
    test("Client non matching chain to public client", () => {
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http("http://127.0.0.1:8545"),
      });

      const walletClient = createWalletClient({
        chain: mainnet,
        transport: http("http://127.0.0.1:8545"),
      });
      expect(() => {
        new HatsClient({
          chainId: sepolia.id,
          publicClient: publicClient,
          walletClient: walletClient,
        });
      }).toThrow("Provided chain id should match the public client chain id");
    });

    test("Client non matching chain to wallet client", () => {
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http("http://127.0.0.1:8545"),
      });

      const walletClient = createWalletClient({
        chain: sepolia,
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
