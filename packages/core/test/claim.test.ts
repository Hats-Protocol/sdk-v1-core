import { HatsClient } from "../src/index";
import {
  NotAdminError,
  HatNotClaimableError,
  HatNotClaimableForError,
  NotExplicitlyEligibleError,
} from "../src/errors";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";
import { HATS_ABI } from "../src/abi/Hats";
import { HATS_V1 } from "../src/constants";
import { HatsModulesClient } from "@hatsprotocol/modules-sdk";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type { CreateHatResult, MintTopHatResult } from "../src/types";

describe("Claiming Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let hatsModulesClient: HatsModulesClient;
  let address1: Address;
  let address2: Address;
  let address3: Address;
  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;
  let account3: PrivateKeyAccount;

  let topHatId: bigint;
  let claimsHatterHatId: bigint;
  let claimableHatId: bigint;
  let claimableForHatId: bigint;
  let eligibilityConditionHatId: bigint;
  let claimsHatterInstance: Address;
  let hatWearingModuleInstance: Address;

  describe("Hats client is initialized", () => {
    beforeAll(async () => {
      address1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
      account1 = privateKeyToAccount(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      );
      address2 = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
      account2 = privateKeyToAccount(
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
      );
      address3 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
      account3 = privateKeyToAccount(
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
      );

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

    describe("Tree is created", () => {
      beforeAll(async () => {
        topHatId =
          9462941280169874567928122295543890366446637692311740940867367197474816n;
        claimsHatterHatId =
          9462941691546013898229632834286186005784263937995707349262333034627072n;

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

        hatWearingModuleInstance = "0xe7fae71797bd984bdd034713bd7063e2515f02eb";
        claimableHatId =
          9462941691552290999965019515050021795207471604411809704706797069139968n;
        claimableForHatId =
          9462941691558568101700406195813857584630679270827912060151261103652864n;
        claimsHatterInstance = "0xc33770d8535910a67c7ea65ebb14f58ece63ed44";
      }, 30000);

      describe("Single Claiming Tests", () => {
        beforeAll(async () => {
          await hatsClient.claimHat({
            account: account2,
            hatId: claimableHatId,
          });
        });

        test("Test claim successful", async () => {
          const isWearer = await hatsClient.isWearerOfHat({
            wearer: address2,
            hatId: claimableHatId,
          });
          expect(isWearer).toBe(true);
        }, 30000);

        test("Test claim reverts for non explicitly eligible account", async () => {
          await expect(async () => {
            await hatsClient.claimHat({
              account: account1,
              hatId: claimableHatId,
            });
          }).rejects.toThrow(NotExplicitlyEligibleError);
        });

        test("Test claim reverts for a non claimable hat", async () => {
          await expect(async () => {
            await hatsClient.claimHat({
              account: account1,
              hatId: eligibilityConditionHatId,
            });
          }).rejects.toThrow(HatNotClaimableError);
        });
      });

      describe("Single Claiming-For Tests", () => {
        beforeAll(async () => {
          await hatsClient.claimHatFor({
            account: account1,
            hatId: claimableForHatId,
            wearer: address3,
          });
        });

        test("Test claim successful", async () => {
          const isWearer = await hatsClient.isWearerOfHat({
            wearer: address3,
            hatId: claimableForHatId,
          });
          expect(isWearer).toBe(true);
        }, 30000);

        test("Test claim-for reverts for non explicitly eligible account", async () => {
          await expect(async () => {
            await hatsClient.claimHat({
              account: account1,
              hatId: claimableHatId,
            });
          }).rejects.toThrow(NotExplicitlyEligibleError);
        });

        test("Test claim-for reverts for a non claimable-for hat", async () => {
          await expect(async () => {
            await hatsClient.claimHat({
              account: account1,
              hatId: eligibilityConditionHatId,
            });
          }).rejects.toThrow(HatNotClaimableError);
        });
      });
    });
  });
});
