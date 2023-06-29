import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { HATS_ABI } from "../src/abi/Hats";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type { CreateHatResult, MintTopHatResult } from "../src/types";

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

  describe("Hats client is initialized", () => {
    beforeAll(() => {
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
        chain: mainnet,
        transport: http("http://127.0.0.1:8545"),
      });

      walletClient = createWalletClient({
        chain: mainnet,
        transport: http("http://127.0.0.1:8545"),
      });

      hatsClient = new HatsClient({
        chainId: mainnet.id,
        publicClient: publicClient,
        walletClient: walletClient,
      });
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
        let nextHatId = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "getNextId",
          args: [topHatId],
        });

        expect(async () => {
          await hatsClient.mintHat({
            hatId: nextHatId,
            wearer: address1,
            account: account1,
          });
        }).rejects.toThrow("Hat does not exist");
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

        expect(async () => {
          await hatsClient.mintHat({
            hatId: childHatId,
            wearer: address3,
            account: account1,
          });
        }).rejects.toThrow("All hats are worn");
      });

      test("Test mint for non eligible address", async () => {
        await hatsClient.setHatWearerStatus({
          account: account1,
          hatId: childHatId,
          wearer: address1,
          eligible: false,
          standing: false,
        });

        expect(async () => {
          await hatsClient.mintHat({
            hatId: childHatId,
            wearer: address1,
            account: account1,
          });
        }).rejects.toThrow("Wearer is not eligible");
      });

      test("Test mint for non active hat", async () => {
        await hatsClient.setHatStatus({
          account: account1,
          hatId: childHatId,
          newStatus: false,
        });

        expect(async () => {
          await hatsClient.mintHat({
            hatId: childHatId,
            wearer: address1,
            account: account1,
          });
        }).rejects.toThrow("Hat is not active");
      });

      test("Test mint for by non admin", async () => {
        expect(async () => {
          await hatsClient.mintHat({
            hatId: childHatId,
            wearer: address1,
            account: account2,
          });
        }).rejects.toThrow("Not Admin");
      });

      test("Test mint to someone already wearing", async () => {
        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId,
          wearer: address1,
        });

        expect(async () => {
          await hatsClient.mintHat({
            account: account1,
            hatId: childHatId,
            wearer: address1,
          });
        }).rejects.toThrow("Already wearing the hat");
      });
    });
  });
});
