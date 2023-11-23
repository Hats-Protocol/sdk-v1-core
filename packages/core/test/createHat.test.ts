import { HatsClient } from "../src/index";
import {
  NotAdminError,
  InvalidAdminError,
  ZeroAddressError,
} from "../src/errors";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";
import { HATS_ABI } from "../src/abi/Hats";
import { HATS_V1 } from "../src/constants";
import { createAnvil } from "@viem/anvil";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type { CreateHatResult, MintTopHatResult } from "../src/types";
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

      beforeAll(async () => {
        try {
          res = await hatsClient.mintTopHat({
            target: address1,
            details: "Tophat SDK",
            imageURI: "Tophat URI",
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

    describe("Hat is created with zero eligibility", () => {
      test("Test createHat throws", async () => {
        await expect(async () => {
          await hatsClient.createHat({
            admin: topHatId,
            maxSupply: 3,
            eligibility: "0x0000000000000000000000000000000000000000",
            toggle: address1,
            mutable: true,
            details: "1.1 details",
            imageURI: "1.1 URI",
            account: account1,
          });
        }).rejects.toThrow(ZeroAddressError);
      });
    });

    describe("Hat is created with zero toggle", () => {
      test("Test createHat throws", async () => {
        await expect(async () => {
          await hatsClient.createHat({
            admin: topHatId,
            maxSupply: 3,
            eligibility: address1,
            toggle: "0x0000000000000000000000000000000000000000",
            mutable: true,
            details: "1.1 details",
            imageURI: "1.1 URI",
            account: account1,
          });
        }).rejects.toThrow(ZeroAddressError);
      });
    });

    describe("Hat is created with invalid admin ID", () => {
      test("Test createHat throws", async () => {
        await expect(async () => {
          await hatsClient.createHat({
            admin: BigInt(
              "0x0000000100000010000000000000000000000000000000000000000000000000"
            ),
            maxSupply: 3,
            eligibility: address1,
            toggle: address1,
            mutable: true,
            details: "1.1 details",
            imageURI: "1.1 URI",
            account: account1,
          });
        }).rejects.toThrow(InvalidAdminError);
      });
    });

    describe("Hat is created by a non admin", () => {
      test("Test createHat throws", async () => {
        await expect(async () => {
          await hatsClient.createHat({
            admin: topHatId,
            maxSupply: 3,
            eligibility: address1,
            toggle: address1,
            mutable: true,
            details: "1.1 details",
            imageURI: "1.1 URI",
            account: account2,
          });
        }).rejects.toThrow(NotAdminError);
      });
    });

    describe("Hat is created", () => {
      let res: CreateHatResult;
      let expectedHatId: bigint;

      beforeAll(async () => {
        try {
          expectedHatId = await publicClient.readContract({
            address: HATS_V1,
            abi: HATS_ABI,
            functionName: "getNextId",
            args: [topHatId],
          });

          res = await hatsClient.createHat({
            admin: topHatId,
            maxSupply: 3,
            eligibility: address1,
            toggle: address1,
            mutable: true,
            details: "Hat details",
            imageURI: "Hat URI",
            account: account1,
          });
        } catch (err) {
          console.log("err", err);
        }
      }, 30000);

      test("Test createHat return value", async () => {
        expect(res.status).toBe("success");
        expect(res.hatId).toBe(expectedHatId);
      });

      test("Test hat properties", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [expectedHatId],
        });

        expect(res[0]).toBe("Hat details");
        expect(res[1]).toBe(3);
        expect(res[2]).toBe(0);
        expect(res[3]).toBe(address1);
        expect(res[4]).toBe(address1);
        expect(res[5]).toBe("Hat URI");
        expect(res[6]).toBe(0);
        expect(res[7]).toBe(true);
        expect(res[8]).toBe(true);
      });
    });
  });
});
