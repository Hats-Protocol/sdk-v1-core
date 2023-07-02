import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
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
  let childHatId1: bigint;
  let childHatId2: bigint;

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
      let resCreateHat1: CreateHatResult;
      let resCreateHat2: CreateHatResult;
      beforeEach(async () => {
        try {
          resTopHat = await hatsClient.mintTopHat({
            target: address1,
            details: "Tophat SDK",
            imageURI: "Tophat URI",
            account: account1,
          });

          topHatId = resTopHat.hatId;

          resCreateHat1 = await hatsClient.createHat({
            admin: topHatId,
            maxSupply: 3,
            eligibility: address1,
            toggle: address1,
            mutable: true,
            details: "Hat details",
            imageURI: "Hat URI",
            account: account1,
          });

          childHatId1 = resCreateHat1.hatId;

          resCreateHat2 = await hatsClient.createHat({
            admin: topHatId,
            maxSupply: 3,
            eligibility: address1,
            toggle: address1,
            mutable: false,
            details: "Hat details",
            imageURI: "Hat URI",
            account: account1,
          });

          childHatId2 = resCreateHat2.hatId;
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test transfre immutable hat", async () => {
        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId2,
          wearer: address1,
        });

        expect(async () => {
          await hatsClient.transferHat({
            hatId: childHatId2,
            from: address1,
            to: address2,
            account: account1,
          });
        }).rejects.toThrow("Hat is immutable, transfer is not allowed");
      });

      test("Test transfer by non admin", async () => {
        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId1,
          wearer: address1,
        });

        expect(async () => {
          await hatsClient.transferHat({
            hatId: childHatId1,
            from: address1,
            to: address2,
            account: account2,
          });
        }).rejects.toThrow("Not Admin");
      });

      test("Test transfer to non eligible wearer", async () => {
        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId1,
          wearer: address1,
        });

        await hatsClient.setHatWearerStatus({
          account: account1,
          hatId: childHatId1,
          wearer: address2,
          eligible: false,
          standing: false,
        });

        expect(async () => {
          await hatsClient.transferHat({
            hatId: childHatId1,
            from: address1,
            to: address2,
            account: account1,
          });
        }).rejects.toThrow("New wearer is not eligible for the hat");
      });

      test("Test transfer non active hat", async () => {
        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId1,
          wearer: address1,
        });

        await hatsClient.setHatStatus({
          account: account1,
          hatId: childHatId1,
          newStatus: false,
        });

        expect(async () => {
          await hatsClient.transferHat({
            hatId: childHatId1,
            from: address1,
            to: address2,
            account: account1,
          });
        }).rejects.toThrow("Hat is not active");
      });

      test("Test transfer to address already wearing the hat", async () => {
        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId1,
          wearer: address1,
        });

        expect(async () => {
          await hatsClient.transferHat({
            hatId: childHatId1,
            from: address1,
            to: address1,
            account: account1,
          });
        }).rejects.toThrow("New wearer is already wearing the hat");
      });

      test("Test transfer by someone not wearing the hat", async () => {
        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId1,
          wearer: address1,
        });

        expect(async () => {
          await hatsClient.transferHat({
            hatId: childHatId1,
            from: address2,
            to: address3,
            account: account1,
          });
        }).rejects.toThrow("From address is not a wearer of the hat");
      });
    });
  });
});
