import { HatsClient } from "../src/index";
import {
  HatNotClaimableForError,
  NotExplicitlyEligibleError,
} from "../src/errors";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";
import { HatsModulesClient } from "@hatsprotocol/modules-sdk";
import { createAnvil } from "@viem/anvil";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type { Anvil } from "@viem/anvil";

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
      forkUrl: "https://goerli.infura.io/v3/ffca6b624a4c42eaaa1f01ed03053ef9",
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
      chain: goerli,
      transport: http("http://127.0.0.1:8545"),
    });

    walletClient = createWalletClient({
      chain: goerli,
      transport: http("http://127.0.0.1:8545"),
    });

    hatsClient = new HatsClient({
      chainId: goerli.id,
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
        9462942102922153228531143373028481645121890183679673757657298871779328n;

      // mint the criteria hat
      await hatsClient.changeHatMaxSupply({
        account: account1,
        hatId: eligibilityConditionHatId,
        newMaxSupply: 5,
      });
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
        9462941691552290999965019515050021795207471604411809704706797069139968n;
      claimableForHatId =
        9462941691558568101700406195813857584630679270827912060151261103652864n;

      await hatsClient.changeHatMaxSupply({
        account: account1,
        hatId: claimableForHatId,
        newMaxSupply: 5,
      });
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
