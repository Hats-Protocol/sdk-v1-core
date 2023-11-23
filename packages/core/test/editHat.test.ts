import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";
import {
  ZeroAddressError,
  NotAdminError,
  InvalidMaxSupplyError,
  ImmutableHatError,
  StringTooLongError,
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
  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;

  let topHatId: bigint;
  let childHatId1: bigint;
  let childHatId2: bigint;

  let anvil: Anvil;

  const LONG_STRING = "x".repeat(7001);

  describe("Hats client is initialized", () => {
    beforeAll(async () => {
      anvil = createAnvil({
        forkUrl: "https://goerli.infura.io/v3/ffca6b624a4c42eaaa1f01ed03053ef9",
        startTimeout: 20000,
      });
      await anvil.start();

      address1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
      address2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
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
      let resCreateHat1: CreateHatResult;
      let resCreateHat2: CreateHatResult;
      beforeEach(async () => {
        resTopHat = await hatsClient.mintTopHat({
          target: address1,
          details: "Tophat SDK",
          imageURI: "Tophat URI",
          account: account1,
        });

        topHatId = resTopHat.hatId;

        resCreateHat1 = await hatsClient.createHat({
          admin: topHatId,
          maxSupply: 2,
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
      }, 30000);

      test("Test hat details edit by non admin", async () => {
        await expect(async () => {
          await hatsClient.changeHatDetails({
            hatId: childHatId1,
            newDetails: "new details",
            account: account2,
          });
        }).rejects.toThrow(NotAdminError);
      });

      test("Test hat details edit with too long string", async () => {
        await expect(async () => {
          await hatsClient.changeHatDetails({
            hatId: childHatId1,
            newDetails: LONG_STRING,
            account: account1,
          });
        }).rejects.toThrow(StringTooLongError);
      });

      test("Test immutable hat details edit", async () => {
        await expect(async () => {
          await hatsClient.changeHatDetails({
            hatId: childHatId2,
            newDetails: "new details",
            account: account1,
          });
        }).rejects.toThrow(ImmutableHatError);
      });

      test("Test tophat details edit", async () => {
        await hatsClient.changeHatDetails({
          hatId: topHatId,
          newDetails: "new details",
          account: account1,
        });

        const topHat = await hatsClient.viewHat(topHatId);
        expect(topHat.details).toBe("new details");
      });

      test("Test eligibility edit with zero address", async () => {
        await expect(async () => {
          await hatsClient.changeHatEligibility({
            hatId: childHatId1,
            newEligibility: "0x0000000000000000000000000000000000000000",
            account: account1,
          });
        }).rejects.toThrow(ZeroAddressError);
      });

      test("Test eligibility edit by non admin", async () => {
        await expect(async () => {
          await hatsClient.changeHatEligibility({
            hatId: childHatId1,
            newEligibility: address1,
            account: account2,
          });
        }).rejects.toThrow(NotAdminError);
      });

      test("Test eligibility edit of immutable hat", async () => {
        await expect(async () => {
          await hatsClient.changeHatEligibility({
            hatId: childHatId2,
            newEligibility: address1,
            account: account1,
          });
        }).rejects.toThrow(ImmutableHatError);
      });

      test("Test toggle edit with zero address", async () => {
        await expect(async () => {
          await hatsClient.changeHatToggle({
            hatId: childHatId1,
            newToggle: "0x0000000000000000000000000000000000000000",
            account: account1,
          });
        }).rejects.toThrow(ZeroAddressError);
      });

      test("Test toggle edit by non admin", async () => {
        await expect(async () => {
          await hatsClient.changeHatToggle({
            hatId: childHatId1,
            newToggle: address1,
            account: account2,
          });
        }).rejects.toThrow(NotAdminError);
      });

      test("Test toggle edit of immutable hat", async () => {
        await expect(async () => {
          await hatsClient.changeHatToggle({
            hatId: childHatId2,
            newToggle: address1,
            account: account1,
          });
        }).rejects.toThrow(ImmutableHatError);
      });

      test("Test hat image URI edit by non admin", async () => {
        await expect(async () => {
          await hatsClient.changeHatImageURI({
            hatId: childHatId1,
            newImageURI: "new URI",
            account: account2,
          });
        }).rejects.toThrow(NotAdminError);
      });

      test("Test hat image URI edit with too long string", async () => {
        await expect(async () => {
          await hatsClient.changeHatImageURI({
            hatId: childHatId1,
            newImageURI: LONG_STRING,
            account: account1,
          });
        }).rejects.toThrow(StringTooLongError);
      });

      test("Test immutable hat image URI edit", async () => {
        await expect(async () => {
          await hatsClient.changeHatImageURI({
            hatId: childHatId2,
            newImageURI: "new URI",
            account: account1,
          });
        }).rejects.toThrow(ImmutableHatError);
      });

      test("Test tophat image URI edit", async () => {
        await hatsClient.changeHatImageURI({
          hatId: topHatId,
          newImageURI: "new URI",
          account: account1,
        });

        const topHat = await hatsClient.viewHat(topHatId);
        expect(topHat.imageUri).toBe("new URI");
      });

      test("Test max supply edit by non admin", async () => {
        await expect(async () => {
          await hatsClient.changeHatMaxSupply({
            hatId: childHatId1,
            newMaxSupply: 10,
            account: account2,
          });
        }).rejects.toThrow(NotAdminError);
      });

      test("Test max supply edit of immutable hat", async () => {
        await expect(async () => {
          await hatsClient.changeHatMaxSupply({
            hatId: childHatId2,
            newMaxSupply: 10,
            account: account1,
          });
        }).rejects.toThrow(ImmutableHatError);
      });

      test("Test max supply edit of immutable hat", async () => {
        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId1,
          wearer: address1,
        });

        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId1,
          wearer: address2,
        });

        await expect(async () => {
          await hatsClient.changeHatMaxSupply({
            hatId: childHatId1,
            newMaxSupply: 1,
            account: account1,
          });
        }).rejects.toThrow(InvalidMaxSupplyError);
      });

      test("Test make hat immutable by non admin", async () => {
        await expect(async () => {
          await hatsClient.makeHatImmutable({
            hatId: childHatId1,
            account: account2,
          });
        }).rejects.toThrow(NotAdminError);
      });

      test("Test make hat immutable of already immutable", async () => {
        await expect(async () => {
          await hatsClient.makeHatImmutable({
            hatId: childHatId2,
            account: account1,
          });
        }).rejects.toThrow(ImmutableHatError);
      });
    });
  });
});
