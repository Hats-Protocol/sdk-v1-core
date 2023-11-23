import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";
import {
  NotAdminError,
  NoLinkageRequestError,
  CircularLinkageError,
  StringTooLongError,
  InvalidUnlinkError,
  CrossLinkageError,
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
  let account3: PrivateKeyAccount;

  let topHatId1: bigint;
  let topHatId2: bigint;
  let topHatId3: bigint;
  let topHatId4: bigint;

  let topHatDomain1: number;
  let topHatDomain2: number;
  let topHatDomain4: number;

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
      address3 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
      account1 = privateKeyToAccount(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      );
      account2 = privateKeyToAccount(
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
      );
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
    }, 30000);

    afterAll(async () => {
      await anvil.stop();
    }, 30000);

    describe("Tree and Hat are created", () => {
      let resTopHat1: MintTopHatResult;
      let resTopHat2: MintTopHatResult;
      let resTopHat3: MintTopHatResult;
      let resTopHat4: MintTopHatResult;

      let resCreateHat1: CreateHatResult;
      let resCreateHat2: CreateHatResult;

      beforeEach(async () => {
        resTopHat1 = await hatsClient.mintTopHat({
          target: address1,
          details: "Tophat SDK 1",
          imageURI: "Tophat URI 1",
          account: account1,
        });

        topHatId1 = resTopHat1.hatId;
        topHatDomain1 = await hatsClient.getTopHatDomain(topHatId1);

        resTopHat2 = await hatsClient.mintTopHat({
          target: address2,
          details: "Tophat SDK 2",
          imageURI: "Tophat URI 2",
          account: account2,
        });

        topHatId2 = resTopHat2.hatId;
        topHatDomain2 = await hatsClient.getTopHatDomain(topHatId2);

        resTopHat3 = await hatsClient.mintTopHat({
          target: address1,
          details: "Tophat SDK 3",
          imageURI: "Tophat URI 3",
          account: account2,
        });

        topHatId3 = resTopHat3.hatId;

        resTopHat4 = await hatsClient.mintTopHat({
          target: address3,
          details: "Tophat SDK 3",
          imageURI: "Tophat URI 3",
          account: account2,
        });

        topHatId4 = resTopHat4.hatId;
        topHatDomain4 = await hatsClient.getTopHatDomain(topHatId4);

        resCreateHat1 = await hatsClient.createHat({
          admin: topHatId1,
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
          admin: topHatId1,
          maxSupply: 3,
          eligibility: address1,
          toggle: address1,
          mutable: false,
          details: "Hat details",
          imageURI: "Hat URI",
          account: account1,
        });

        childHatId2 = resCreateHat2.hatId;

        await hatsClient.mintHat({
          account: account1,
          hatId: childHatId2,
          wearer: address3,
        });
      }, 30000);

      test("Test linakage request by non admin", async () => {
        await expect(async () => {
          await hatsClient.requestLinkTopHatToTree({
            topHatDomain: topHatDomain2,
            requestedAdminHat: childHatId1,
            account: account1,
          });
        }).rejects.toThrow(NotAdminError);
      }, 30000);

      test("Test approve request when no request happened", async () => {
        await expect(async () => {
          await hatsClient.approveLinkTopHatToTree({
            topHatDomain: topHatDomain2,
            newAdminHat: childHatId1,
            account: account1,
          });
        }).rejects.toThrow(NoLinkageRequestError);
      });

      test("Test approve request by non admin", async () => {
        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          requestedAdminHat: childHatId1,
          account: account2,
        });

        await expect(async () => {
          await hatsClient.approveLinkTopHatToTree({
            topHatDomain: topHatDomain2,
            newAdminHat: childHatId1,
            account: account2,
          });
        }).rejects.toThrow(NotAdminError);
      });

      test("Test approve request with circular linkage", async () => {
        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          requestedAdminHat: childHatId1,
          account: account2,
        });

        await hatsClient.approveLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          newAdminHat: childHatId1,
          account: account1,
        });

        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain1,
          requestedAdminHat: topHatId2,
          account: account1,
        });

        await expect(async () => {
          await hatsClient.approveLinkTopHatToTree({
            topHatDomain: topHatDomain1,
            newAdminHat: topHatId2,
            account: account2,
          });
        }).rejects.toThrow(CircularLinkageError);
      });

      test("Test approve request with too long new details", async () => {
        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          requestedAdminHat: childHatId1,
          account: account2,
        });

        await expect(async () => {
          await hatsClient.approveLinkTopHatToTree({
            topHatDomain: topHatDomain2,
            newAdminHat: childHatId1,
            newDetails: LONG_STRING,
            account: account1,
          });
        }).rejects.toThrow(StringTooLongError);
      });

      test("Test approve request with too long new image URI", async () => {
        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          requestedAdminHat: childHatId1,
          account: account2,
        });

        await expect(async () => {
          await hatsClient.approveLinkTopHatToTree({
            topHatDomain: topHatDomain2,
            newAdminHat: childHatId1,
            newImageURI: LONG_STRING,
            account: account1,
          });
        }).rejects.toThrow(StringTooLongError);
      });

      test("Test unlink by non admin", async () => {
        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          requestedAdminHat: childHatId1,
          account: account2,
        });

        await hatsClient.approveLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          newAdminHat: childHatId1,
          account: account1,
        });

        await expect(async () => {
          await hatsClient.unlinkTopHatFromTree({
            topHatDomain: topHatDomain2,
            account: account2,
            wearer: address2,
          });
        }).rejects.toThrow(NotAdminError);
      });

      test("Test unlink with wrong wearer", async () => {
        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          requestedAdminHat: childHatId1,
          account: account2,
        });

        await hatsClient.approveLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          newAdminHat: childHatId1,
          account: account1,
        });

        await expect(async () => {
          await hatsClient.unlinkTopHatFromTree({
            topHatDomain: topHatDomain2,
            account: account1,
            wearer: address1,
          });
        }).rejects.toThrow(InvalidUnlinkError);
      });

      test("Test relink to different tree", async () => {
        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          requestedAdminHat: childHatId1,
          account: account2,
        });

        await hatsClient.approveLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          newAdminHat: childHatId1,
          account: account1,
        });

        await expect(async () => {
          await hatsClient.relinkTopHatWithinTree({
            topHatDomain: topHatDomain2,
            newAdminHat: topHatId3,
            account: account1,
          });
        }).rejects.toThrow(CrossLinkageError);
      });

      test("Test relink to non local tree", async () => {
        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          requestedAdminHat: childHatId2,
          account: account2,
        });

        await hatsClient.approveLinkTopHatToTree({
          topHatDomain: topHatDomain2,
          newAdminHat: childHatId2,
          account: account3,
        });

        await hatsClient.requestLinkTopHatToTree({
          topHatDomain: topHatDomain4,
          requestedAdminHat: childHatId2,
          account: account3,
        });

        await hatsClient.approveLinkTopHatToTree({
          topHatDomain: topHatDomain4,
          newAdminHat: childHatId2,
          account: account3,
        });

        await expect(async () => {
          await hatsClient.relinkTopHatWithinTree({
            topHatDomain: topHatDomain2,
            newAdminHat: topHatId4,
            account: account3,
          });
        }).rejects.toThrow(CrossLinkageError);
      });
    });
  });
});
