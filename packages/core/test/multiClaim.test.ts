import { HatsClient } from "../src/index";
import {
  HatNotClaimableForError,
  NotExplicitlyEligibleError,
} from "../src/errors";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { HatsModulesClient } from "@hatsprotocol/modules-sdk";
import { createAnvil } from "@viem/anvil";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type { Anvil } from "@viem/anvil";
import "dotenv/config";

describe("Claiming Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let hatsModulesClient: HatsModulesClient;
  let address1: Address;
  let address2: Address;
  let address3: Address;
  let account1: PrivateKeyAccount;

  let claimableHatId: bigint;
  let claimableForHatId: bigint;
  let eligibilityConditionHatId: bigint;

  let anvil: Anvil;

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.SEPOLIA_RPC,
      startTimeout: 20000,
    });
    await anvil.start();

    address1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    account1 = privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );
    address2 = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
    address3 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

    publicClient = createPublicClient({
      chain: sepolia,
      transport: http("http://127.0.0.1:8545"),
    });

    walletClient = createWalletClient({
      chain: sepolia,
      transport: http("http://127.0.0.1:8545"),
    });

    hatsClient = new HatsClient({
      chainId: sepolia.id,
      publicClient: publicClient,
      walletClient: walletClient,
    });

    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
    });
    await hatsModulesClient.prepare();
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  describe("Tree is created", () => {
    beforeAll(async () => {
      eligibilityConditionHatId =
        6820866918171528300087652036522097989191031451002833601558643264716800n;

      // mint the criteria hat
      await hatsClient.mintHat({
        account: account1,
        hatId: eligibilityConditionHatId,
        wearer: address2,
      });
      await hatsClient.mintHat({
        account: account1,
        hatId: eligibilityConditionHatId,
        wearer: address3,
      });

      claimableHatId =
        6820866918184082503558425398049769568037446783835038312447571333742592n;
      claimableForHatId =
        6820866918177805401823038717285933778614239117418935957003107299229696n;
    }, 30000);

    describe("Multi Claiming For Tests", () => {
      beforeAll(async () => {
        await hatsClient.multiClaimHatFor({
          account: account1,
          hatId: claimableForHatId,
          wearers: [address2, address3],
        });
      }, 30000);

      test("Test claim successful", async () => {
        const isWearerAddress2 = await hatsClient.isWearerOfHat({
          wearer: address2,
          hatId: claimableForHatId,
        });
        const isWearerAddress3 = await hatsClient.isWearerOfHat({
          wearer: address3,
          hatId: claimableForHatId,
        });
        expect(isWearerAddress2).toBe(true);
        expect(isWearerAddress3).toBe(true);
      }, 30000);

      test("Test claim reverts for non explicitly eligible account", async () => {
        await expect(async () => {
          await hatsClient.multiClaimHatFor({
            account: account1,
            hatId: claimableForHatId,
            wearers: [address1, address3],
          });
        }).rejects.toThrow(NotExplicitlyEligibleError);
      }, 30000);

      test("Test claim reverts for a non claimable-for hat", async () => {
        await expect(async () => {
          await hatsClient.multiClaimHatFor({
            account: account1,
            hatId: claimableHatId,
            wearers: [address2, address3],
          });
        }).rejects.toThrow(HatNotClaimableForError);
      }, 30000);
    });
  });
});
