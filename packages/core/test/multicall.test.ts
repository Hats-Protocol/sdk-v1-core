import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";
import { NotAdminError } from "../src/errors";
import { hatIdDecimalToHex } from "../src/utils";
import { createAnvil } from "@viem/anvil";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type { MintTopHatResult } from "../src/types";
import type { Anvil } from "@viem/anvil";

describe("createHat tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let address1: Address;
  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;
  let topHatId: bigint;

  let anvil: Anvil;

  describe("Hats client is initialized", () => {
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

    describe("Tree is created", () => {
      let res: MintTopHatResult;

      beforeEach(async () => {
        try {
          res = await hatsClient.mintTopHat({
            target: address1,
            details: "Tophat multicall details",
            imageURI: "Tophat multicall URI",
            account: account1,
          });

          topHatId = res.hatId;
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test mintTopHat return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test create two hats", async () => {
        const topHatIDHex = hatIdDecimalToHex(topHatId);
        const expectedID1_1 = BigInt(
          topHatIDHex.substring(0, 13) + "1" + topHatIDHex.substring(14)
        );
        const expectedID1_2 = BigInt(
          topHatIDHex.substring(0, 13) + "2" + topHatIDHex.substring(14)
        );

        const createHatData1_1 = hatsClient.createHatCallData({
          admin: topHatId,
          details: "1.1 details",
          maxSupply: 3,
          eligibility: address1,
          toggle: address1,
          mutable: true,
          imageURI: "1.1 image URI",
        });

        const createHatData1_2 = hatsClient.createHatCallData({
          admin: topHatId,
          details: "1.2 details",
          maxSupply: 5,
          eligibility: address1,
          toggle: address1,
          mutable: true,
          imageURI: "1.2 image URI",
        });

        expect(async () => {
          await hatsClient.multicall({
            account: account2,
            calls: [createHatData1_1, createHatData1_2],
          });
        }).rejects.toThrow(NotAdminError);

        expect(async () => {
          await hatsClient.multicallPreFlightCheck({
            account: account2,
            calls: [createHatData1_1, createHatData1_2],
          });
        }).rejects.toThrow(NotAdminError);

        const res = await hatsClient.multicall({
          account: account1,
          calls: [createHatData1_1, createHatData1_2],
        });

        expect(res.status).toBe("success");
        expect(res.hatsCreated[0]).toBe(expectedID1_1);
        expect(res.hatsCreated[1]).toBe(expectedID1_2);
        const hat_1_1 = await hatsClient.viewHat(expectedID1_1);
        const hat_1_2 = await hatsClient.viewHat(expectedID1_2);

        expect(hat_1_1.details).toBe("1.1 details");
        expect(hat_1_2.details).toBe("1.2 details");
      });

      test("Test create hat and mint", async () => {
        const topHatIDHex = hatIdDecimalToHex(topHatId);
        const expectedChildID = BigInt(
          topHatIDHex.substring(0, 13) + "1" + topHatIDHex.substring(14)
        );

        const createHatCallData = hatsClient.createHatCallData({
          admin: topHatId,
          details: "1.1 details",
          maxSupply: 3,
          eligibility: address1,
          toggle: address1,
          mutable: true,
          imageURI: "1.1 image URI",
        });

        const mintHatCallData = hatsClient.mintHatCallData({
          hatId: expectedChildID,
          wearer: address1,
        });

        expect(async () => {
          await hatsClient.multicall({
            account: account2,
            calls: [createHatCallData, mintHatCallData],
          });
        }).rejects.toThrow(NotAdminError);

        expect(async () => {
          await hatsClient.multicallPreFlightCheck({
            account: account2,
            calls: [createHatCallData, mintHatCallData],
          });
        }).rejects.toThrow(NotAdminError);

        const res = await hatsClient.multicall({
          account: account1,
          calls: [createHatCallData, mintHatCallData],
        });

        expect(res.status).toBe("success");
        expect(res.hatsCreated[0]).toBe(expectedChildID);
        expect(res.hatsMinted[0].hatId).toBe(expectedChildID);
        expect(res.hatsMinted[0].wearer).toBe(address1);
        const hat_1_1 = await hatsClient.viewHat(expectedChildID);
        expect(hat_1_1.details).toBe("1.1 details");
      });

      test("Test create hat and mint with multicall calldata", async () => {
        const topHatIDHex = hatIdDecimalToHex(topHatId);
        const expectedChildID = BigInt(
          topHatIDHex.substring(0, 13) + "1" + topHatIDHex.substring(14)
        );

        const createHatCallData = hatsClient.createHatCallData({
          admin: topHatId,
          details: "1.1 details",
          maxSupply: 3,
          eligibility: address1,
          toggle: address1,
          mutable: true,
          imageURI: "1.1 image URI",
        });

        const mintHatCallData = hatsClient.mintHatCallData({
          hatId: expectedChildID,
          wearer: address1,
        });

        const multicallCallData = hatsClient.multicallCallData([
          createHatCallData.callData,
          mintHatCallData.callData,
        ]);

        const res = await hatsClient.multicall({
          account: account1,
          calls: [multicallCallData],
        });

        expect(res.status).toBe("success");
        expect(res.hatsCreated[0]).toBe(expectedChildID);
        expect(res.hatsMinted[0].hatId).toBe(expectedChildID);
        expect(res.hatsMinted[0].wearer).toBe(address1);
        const hat_1_1 = await hatsClient.viewHat(expectedChildID);
        expect(hat_1_1.details).toBe("1.1 details");
      });
    });
  });
});
