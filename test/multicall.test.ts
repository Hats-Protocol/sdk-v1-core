import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";
import { HATS_ABI } from "../src/abi/Hats";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type { MintTopHatResult, MultiCallResult } from "../src/types";
import { hatIdDecimalToHex } from "../src/client/utils";

describe("createHat tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let address1: Address;
  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;

  let topHatId: bigint;

  describe("Hats client is initialized", () => {
    beforeAll(() => {
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

    describe("Tree is created", () => {
      let res: MintTopHatResult;

      beforeAll(async () => {
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
    });

    describe("Multi create two hats", () => {
      let res: MultiCallResult;
      let expectedID1_1: bigint;
      let expectedID1_2: bigint;

      beforeAll(async () => {
        try {
          const topHatIDHex = hatIdDecimalToHex(topHatId);
          expectedID1_1 = BigInt(
            topHatIDHex.substring(0, 13) + "1" + topHatIDHex.substring(14)
          );
          expectedID1_2 = BigInt(
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

          res = await hatsClient.multicall({
            account: account1,
            calls: [createHatData1_1, createHatData1_2],
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test multicall transaction success", () => {
        expect(res.status).toBe("success");
      });

      test("Test multicall transaction success", () => {
        expect(res.hatsCreated[0]).toBe(expectedID1_1);
        expect(res.hatsCreated[1]).toBe(expectedID1_2);
      });

      test("Test hats were created", async () => {
        const hat_1_1 = await hatsClient.viewHat(expectedID1_1);
        const hat_1_2 = await hatsClient.viewHat(expectedID1_2);

        expect(hat_1_1.details).toBe("1.1 details");
        expect(hat_1_2.details).toBe("1.2 details");
      });
    });
  });
});
