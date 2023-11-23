import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";
import { HATS_ABI } from "../src/abi/Hats";
import { HATS_V1 } from "../src/constants";
import {
  HatNotExistError,
  AllHatsWornError,
  NotEligibleError,
  NotActiveError,
  NotAdminError,
  AlreadyWearingError,
} from "../src/errors";
import { createAnvil } from "@viem/anvil";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type { CreateHatResult, MintTopHatResult } from "../src/types";
import type { Anvil } from "@viem/anvil";

describe("mintHat tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let address1: Address;
  let address2: Address;
  let address3: Address;
  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;

  let topHatId: bigint;
  let childHatId: bigint;

  let anvil: Anvil;

  describe("Hats client is initialized", () => {
    beforeAll(async () => {
      anvil = createAnvil({
        forkUrl: "https://goerli.infura.io/v3/ffca6b624a4c42eaaa1f01ed03053ef9",
        startTimeout: 20000,
      });
      await anvil.start();

      address1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
      address2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      address3 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
      account1 = privateKeyToAccount(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      );
      account2 = privateKeyToAccount(
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
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
    }, 30000);

    afterAll(async () => {
      await anvil.stop();
    }, 30000);

    describe("Tree and Hat are created", () => {
      let resTopHat: MintTopHatResult;
      let resCreateHat: CreateHatResult;
      beforeEach(async () => {
        try {
          resTopHat = await hatsClient.mintTopHat({
            target: address1,
            details: "Tophat SDK",
            imageURI: "Tophat URI",
            account: account1,
          });

          topHatId = resTopHat.hatId;

          resCreateHat = await hatsClient.createHat({
            admin: topHatId,
            maxSupply: 2,
            eligibility: address1,
            toggle: address1,
            mutable: true,
            details: "Hat details",
            imageURI: "Hat URI",
            account: account1,
          });

          childHatId = resCreateHat.hatId;
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test mint to non existent Hat", async () => {
        const nextHatId = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "getNextId",
          args: [topHatId],
        });

        await expect(async () => {
          await hatsClient.mintHat({
            hatId: nextHatId,
            wearer: address1,
            account: account1,
          });
        }).rejects.toThrow(HatNotExistError);
      });

      test("Test mint when max supply reached", async () => {
        await hatsClient.mintHat({
          hatId: childHatId,
          wearer: address1,
          account: account1,
        });

        await hatsClient.mintHat({
          hatId: childHatId,
          wearer: address2,
          account: account1,
        });

        await expect(async () => {
          await hatsClient.mintHat({
            hatId: childHatId,
            wearer: address3,
            account: account1,
          });
        }).rejects.toThrow(AllHatsWornError);
      });

      test("Test mint for non eligible address", async () => {
        await hatsClient.setHatWearerStatus({
          account: account1,
          hatId: childHatId,
          wearer: address1,
          eligible: false,
          standing: false,
        });

        await expect(async () => {
          await hatsClient.mintHat({
            hatId: childHatId,
            wearer: address1,
            account: account1,
          });
        }).rejects.toThrow(NotEligibleError);
      });

      test("Test mint for non active hat", async () => {
        await hatsClient.setHatStatus({
          account: account1,
          hatId: childHatId,
          newStatus: false,
        });

        await expect(async () => {
          await hatsClient.mintHat({
            hatId: childHatId,
            wearer: address1,
            account: account1,
          });
        }).rejects.toThrow(NotActiveError);
      });

      test("Test mint for by non admin", async () => {
        await expect(async () => {
          await hatsClient.mintHat({
            hatId: childHatId,
            wearer: address1,
            account: account2,
          });
        }).rejects.toThrow(NotAdminError);
      });

      test("Test mint to someone already wearing", async () => {
        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId,
          wearer: address1,
        });

        await expect(async () => {
          await hatsClient.mintHat({
            account: account1,
            hatId: childHatId,
            wearer: address1,
          });
        }).rejects.toThrow(AlreadyWearingError);
      });
    });
  });
});
