import { HatsClient, hatIdDecimalToHex } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { HATS_ABI } from "../src/abi/Hats";
import { HATS_V1 } from "../src/constants";
import { treeIdDecimalToHex } from "../src/index";
import { createAnvil } from "@viem/anvil";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type {
  CreateHatResult,
  MintTopHatResult,
  BatchCreateHatsResult,
  BatchMintHatsResult,
  RenounceHatResult,
  ChangeHatDetailsResult,
  ChangeHatEligibilityResult,
  ChangeHatToggleResult,
  ChangeHatImageURIResult,
  ChangeHatMaxSupplyResult,
  MakeHatImmutableResult,
  SetHatStatusResult,
  TransferHatResult,
  SetHatWearerStatusResult,
  RequestLinkTopHatToTreeResult,
  ApproveLinkTopHatToTreeResult,
  UnlinkTopHatFromTreeResult,
  RelinkTopHatWithinTreeResult,
} from "../src/types";
import type { Anvil } from "@viem/anvil";
import "dotenv/config";

describe("Basic tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let address1: Address;
  let address2: Address;
  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;

  let topHatId_1: bigint;
  let topHatId_2: bigint;
  let topHatDomain_1: number;
  let topHatDomain_2: number;
  let hatId_1_1: bigint;
  let hatId_1_2: bigint;
  let hatId_1_3: bigint;

  let anvil: Anvil;

  describe("Hats client is initialized", () => {
    beforeAll(async () => {
      anvil = createAnvil({
        forkUrl: process.env.SEPOLIA_RPC,
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
        chain: sepolia,
        transport: http("http://127.0.0.1:8545"),
      });

      walletClient = createWalletClient({
        chain: sepolia,
        transport: http("http://127.0.0.1:8545"),
      });

      hatsClient = new HatsClient({
        chainId: sepolia.id,
        publicClient: publicClient,
        walletClient: walletClient,
      });
    }, 30000);

    afterAll(async () => {
      await anvil.stop();
    }, 30000);

    describe("Tree is created", () => {
      let res: MintTopHatResult;
      let expectedTopHatId: bigint;

      beforeAll(async () => {
        try {
          let expectedTopHatDomain = await publicClient.readContract({
            address: HATS_V1,
            abi: HATS_ABI,
            functionName: "lastTopHatId",
          });
          expectedTopHatDomain += 1;
          expectedTopHatId = BigInt(
            treeIdDecimalToHex(expectedTopHatDomain).padEnd(66, "0")
          );

          res = await hatsClient.mintTopHat({
            target: address1,
            details: "Tophat SDK",
            imageURI: "Tophat URI",
            account: account1,
          });

          topHatId_1 = res.hatId;
          topHatDomain_1 = await hatsClient.getTopHatDomain(topHatId_1);
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test mintTopHat return value", () => {
        expect(res.status).toBe("success");
        expect(res.hatId).toEqual(expectedTopHatId);
      });

      test("Test top-hat is created", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [topHatId_1],
        });

        expect(res[0]).toBe("Tophat SDK");
        expect(res[5]).toBe("Tophat URI");
      });
    });

    describe("Hat 1.1 is created", () => {
      let res: CreateHatResult;
      let expectedHatId: bigint;

      beforeAll(async () => {
        try {
          expectedHatId = await publicClient.readContract({
            address: HATS_V1,
            abi: HATS_ABI,
            functionName: "getNextId",
            args: [topHatId_1],
          });

          res = await hatsClient.createHat({
            admin: topHatId_1,
            maxSupply: 3,
            eligibility: address1,
            toggle: address1,
            mutable: true,
            details: "1.1 details",
            imageURI: "1.1 URI",
            account: account1,
          });

          hatId_1_1 = res.hatId;
        } catch (err) {
          console.log("err", err);
        }
      }, 30000);

      test("Test createHat return value", async () => {
        expect(res.status).toBe("success");
        expect(res.hatId).toBe(expectedHatId);
      });

      test("Test hat is created", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [hatId_1_1],
        });

        expect(res[0]).toBe("1.1 details");
        expect(res[1]).toBe(3);
        expect(res[2]).toBe(0);
        expect(res[3]).toBe(address1);
        expect(res[4]).toBe(address1);
        expect(res[5]).toBe("1.1 URI");
        expect(res[6]).toBe(0);
        expect(res[7]).toBe(true);
        expect(res[8]).toBe(true);
      });

      test("test viewHat SDK function", async () => {
        const res = await hatsClient.viewHat(hatId_1_1);

        expect(res.details).toBe("1.1 details");
        expect(res.maxSupply).toBe(3);
        expect(res.supply).toBe(0);
        expect(res.eligibility).toBe(address1);
        expect(res.toggle).toBe(address1);
        expect(res.imageUri).toBe("1.1 URI");
        expect(res.numChildren).toBe(0);
        expect(res.mutable).toBe(true);
        expect(res.active).toBe(true);
      });

      test("Test getAdmin result", async () => {
        const res = await hatsClient.getAdmin(hatId_1_1);

        expect(res).toBe(topHatId_1);
      });

      test("test isWearerOfHat SDK function", async () => {
        const resTopHat = await hatsClient.isWearerOfHat({
          hatId: topHatId_1,
          wearer: address1,
        });

        const resChildHat = await hatsClient.isWearerOfHat({
          hatId: hatId_1_1,
          wearer: address1,
        });

        expect(resTopHat).toBe(true);
        expect(resChildHat).toBe(false);
      });

      test("test isAdminOfHat SDK function", async () => {
        const resTopHat = await hatsClient.isAdminOfHat({
          hatId: topHatId_1,
          user: address1,
        });

        const resChildHat = await hatsClient.isAdminOfHat({
          hatId: hatId_1_1,
          user: address1,
        });

        let nextTopHatDomain = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "lastTopHatId",
        });
        nextTopHatDomain += 1;
        const nextTopHatId = BigInt(
          treeIdDecimalToHex(nextTopHatDomain).padEnd(66, "0")
        );

        const resOtherTreeHat = await hatsClient.isAdminOfHat({
          hatId: nextTopHatId,
          user: address1,
        });

        expect(resTopHat).toBe(true);
        expect(resChildHat).toBe(true);
        expect(resOtherTreeHat).toBe(false);
      });

      test("test isActive SDK function", async () => {
        const res = await hatsClient.isActive(topHatId_1);

        expect(res).toBe(true);
      });

      test("test isInGoodStanding SDK function", async () => {
        const resTopHatWearer = await hatsClient.isInGoodStanding({
          hatId: topHatId_1,
          wearer: address1,
        });

        const resChildHatWearer = await hatsClient.isInGoodStanding({
          hatId: hatId_1_1,
          wearer: address1,
        });

        expect(resTopHatWearer).toBe(true);
        expect(resChildHatWearer).toBe(true);
      });

      test("test isEligible SDK function", async () => {
        const resTopHatWearer = await hatsClient.isEligible({
          hatId: topHatId_1,
          wearer: address1,
        });

        const resChildHatWearer = await hatsClient.isEligible({
          hatId: hatId_1_1,
          wearer: address1,
        });

        expect(resTopHatWearer).toBe(true);
        expect(resChildHatWearer).toBe(true);
      });

      test("test predictNextChildrenHatIDs SDK function", async () => {
        const predicedHatNextHatId = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "getNextId",
          args: [topHatId_1],
        });
        const res1 = await hatsClient.predictNextChildrenHatIDs({
          admin: topHatId_1,
          numChildren: 1,
        });
        expect(res1[0]).toBe(predicedHatNextHatId);

        const topHatIDHex = hatIdDecimalToHex(topHatId_1);
        const expectedID1_2 = BigInt(
          topHatIDHex.substring(0, 13) + "2" + topHatIDHex.substring(14)
        );
        const expectedID1_3 = BigInt(
          topHatIDHex.substring(0, 13) + "3" + topHatIDHex.substring(14)
        );

        const res2 = await hatsClient.predictNextChildrenHatIDs({
          admin: topHatId_1,
          numChildren: 2,
        });

        expect(res2[0]).toBe(expectedID1_2);
        expect(res2[1]).toBe(expectedID1_3);
      });

      test("test getHatLevel SDK function", async () => {
        const res = await hatsClient.getHatLevel(hatId_1_1);

        expect(res).toBe(1);
      });

      test("test getLocalHatLevel SDK function", async () => {
        const res = await hatsClient.getLocalHatLevel(hatId_1_1);

        expect(res).toBe(1);
      });

      test("test getTopHatDomain SDK function", async () => {
        const res = await hatsClient.getTopHatDomain(hatId_1_1);

        expect(res).toBe(
          parseInt(
            topHatId_1.toString(16).padStart(64, "0").substring(0, 8),
            16
          )
        );
      });
    });

    describe("Hat 1.1 is minted", () => {
      beforeAll(async () => {
        try {
          await hatsClient.mintHat({
            account: account1,
            hatId: hatId_1_1,
            wearer: address1,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test hat 1.1 minted", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [address1, hatId_1_1],
        });

        expect(res).toBe(true);
      });
    });

    describe("Hat 1.1 is renounced", () => {
      let res: RenounceHatResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.renounceHat({
            account: account1,
            hatId: hatId_1_1,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test renounceHat result value", () => {
        expect(res.status).toBe("success");
      });

      test("Test hat 1.1 is renounced", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [address1, hatId_1_1],
        });

        expect(res).toBe(false);
      });
    });

    describe("Change Hat 1.1 details", () => {
      let res: ChangeHatDetailsResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.changeHatDetails({
            account: account1,
            hatId: hatId_1_1,
            newDetails: "Hat 1.1 new details",
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test changeHatDetails return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test Hat 1.1 new details", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [hatId_1_1],
        });

        expect(res[0]).toBe("Hat 1.1 new details");
      });
    });

    describe("Change Hat 1.1 eligibility", () => {
      let res: ChangeHatEligibilityResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.changeHatEligibility({
            account: account1,
            hatId: hatId_1_1,
            newEligibility: "0x0000000000000000000000000000000000000001",
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test changeHatEligibility return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test Hat 1.1 new eligibility", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [hatId_1_1],
        });

        expect(res[3]).toBe("0x0000000000000000000000000000000000000001");
      });
    });

    describe("Change Hat 1.1 toggle", () => {
      let res: ChangeHatToggleResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.changeHatToggle({
            account: account1,
            hatId: hatId_1_1,
            newToggle: "0x0000000000000000000000000000000000000001",
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test changeHatToggle return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test Hat 1.1 new toggle", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [hatId_1_1],
        });

        expect(res[4]).toBe("0x0000000000000000000000000000000000000001");
      });
    });

    describe("Change Hat 1.1 image URI", () => {
      let res: ChangeHatImageURIResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.changeHatImageURI({
            account: account1,
            hatId: hatId_1_1,
            newImageURI: "Hat 1.1 new image URI",
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test changeHatImageURI return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test Hat 1.1 new image URI", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [hatId_1_1],
        });

        expect(res[5]).toBe("Hat 1.1 new image URI");
      });
    });

    describe("Change Hat 1.1 max supply", () => {
      let res: ChangeHatMaxSupplyResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.changeHatMaxSupply({
            account: account1,
            hatId: hatId_1_1,
            newMaxSupply: 10,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test changeHatMaxSupply return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test Hat 1.1 new max supply", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [hatId_1_1],
        });

        expect(res[1]).toBe(10);
      });
    });

    describe("Make Hat 1.1 immutable", () => {
      let res: MakeHatImmutableResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.makeHatImmutable({
            account: account1,
            hatId: hatId_1_1,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test makeHatImmutable return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test Hat 1.1 immutable", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [hatId_1_1],
        });

        expect(res[7]).toBe(false);
      });
    });

    describe("Batch Create Hats 1.2 and 1.3", () => {
      let res: BatchCreateHatsResult;
      beforeAll(async () => {
        try {
          res = await hatsClient.batchCreateHats({
            admins: [topHatId_1, topHatId_1],
            maxSupplies: [3, 5],
            eligibilityModules: [address1, address1],
            toggleModules: [address1, address1],
            mutables: [true, false],
            details: ["1.2 details", "1.3 details"],
            imageURIs: ["1.2 URI", "1.3 URI"],
            account: account1,
          });

          hatId_1_2 = res.hatIds[0];
          hatId_1_3 = res.hatIds[1];
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test batchCreateHats result value", () => {
        expect(res.status).toBe("success");
      });

      test("Test hat 1.2 is created", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [hatId_1_2],
        });

        expect(res[0]).toBe("1.2 details");
        expect(res[1]).toBe(3);
        expect(res[2]).toBe(0);
        expect(res[3]).toBe(address1);
        expect(res[4]).toBe(address1);
        expect(res[5]).toBe("1.2 URI");
        expect(res[6]).toBe(0);
        expect(res[7]).toBe(true);
        expect(res[8]).toBe(true);
      });

      test("Test hat 1.3 is created", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [hatId_1_3],
        });

        expect(res[0]).toBe("1.3 details");
        expect(res[1]).toBe(5);
        expect(res[2]).toBe(0);
        expect(res[3]).toBe(address1);
        expect(res[4]).toBe(address1);
        expect(res[5]).toBe("1.3 URI");
        expect(res[6]).toBe(0);
        expect(res[7]).toBe(false);
        expect(res[8]).toBe(true);
      });

      test("Test getChildrenHats", async () => {
        const res = await hatsClient.getChildrenHats(topHatId_1);

        expect(res[0]).toBe(hatId_1_1);
        expect(res[1]).toBe(hatId_1_2);
        expect(res[2]).toBe(hatId_1_3);
      });
    });

    describe("Batch mint hats 1.2 and 1.3", () => {
      let res: BatchMintHatsResult;

      beforeAll(async () => {
        res = await hatsClient.batchMintHats({
          account: account1,
          hatIds: [hatId_1_2, hatId_1_3],
          wearers: [address1, address2],
        });
      }, 30000);

      test("Test batchMintHats result value", () => {
        expect(res.status).toBe("success");
      });

      test("Test Hat 1.2 is minted", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [address1, hatId_1_2],
        });

        expect(res).toBe(true);
      });

      test("Test Hat 1.3 is minted", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [address2, hatId_1_3],
        });

        expect(res).toBe(true);
      });
    });

    describe("Hat 1.3 becomes inactive", () => {
      let res: SetHatStatusResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.setHatStatus({
            account: account1,
            hatId: hatId_1_3,
            newStatus: false,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test setHatStatus result value", () => {
        expect(res.status).toBe("success");
      });

      test("Test hat 1.3 is inactive", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "isActive",
          args: [hatId_1_3],
        });

        expect(res).toBe(false);
      });
    });

    describe("Transfer hat 1.2", () => {
      let res: TransferHatResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.transferHat({
            account: account1,
            hatId: hatId_1_2,
            from: address1,
            to: address2,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test transferHat result value", () => {
        expect(res.status).toBe("success");
      });

      test("Test Hat 1.2 was transfered", async () => {
        const res1 = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [address2, hatId_1_2],
        });

        const res2 = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [address1, hatId_1_2],
        });

        expect(res1).toBe(true);
        expect(res2).toBe(false);
      });
    });

    describe("Wearer becomes non eligible for hat 1.2", () => {
      let res: SetHatWearerStatusResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.setHatWearerStatus({
            account: account1,
            hatId: hatId_1_2,
            wearer: address2,
            eligible: false,
            standing: true,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test setHatWearerStatus result value", () => {
        expect(res.status).toBe("success");
      });

      test("Test hat 1.2 burned", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [address2, hatId_1_2],
        });

        expect(res).toBe(false);
      });
    });

    describe("Tree 2 is created", () => {
      let res: MintTopHatResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.mintTopHat({
            target: address2,
            details: "Tophat 2",
            imageURI: "Tophat 2 URI",
            account: account2,
          });

          topHatId_2 = res.hatId;
          topHatDomain_2 = await hatsClient.getTopHatDomain(topHatId_2);
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test top-hat is created", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [topHatId_2],
        });

        expect(res[0]).toBe("Tophat 2");
        expect(res[5]).toBe("Tophat 2 URI");
      });
    });

    describe("Tree 2 requests to link to Tree 1, hat 1.1", () => {
      let res: RequestLinkTopHatToTreeResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.requestLinkTopHatToTree({
            account: account2,
            topHatDomain: topHatDomain_2,
            requestedAdminHat: hatId_1_1,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test requestLinkTopHatToTree return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test link request", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "linkedTreeRequests",
          args: [topHatDomain_2],
        });

        expect(res).toBe(hatId_1_1);
      });

      test("Test getLinkageRequest request", async () => {
        const res = await hatsClient.getLinkageRequest(topHatDomain_2);

        expect(res).toBe(hatId_1_1);
      });
    });

    describe("Tree 1 accepts linkage", () => {
      let res: ApproveLinkTopHatToTreeResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.approveLinkTopHatToTree({
            account: account1,
            topHatDomain: topHatDomain_2,
            newAdminHat: hatId_1_1,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test approveLinkTopHatToTree return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test tree linked", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "linkedTreeAdmins",
          args: [topHatDomain_2],
        });

        expect(res).toBe(hatId_1_1);
      });

      test("Test getLinkedTreeAdmin result", async () => {
        const res = await hatsClient.getLinkedTreeAdmin(topHatDomain_2);

        expect(res).toBe(hatId_1_1);
      });

      test("Test getHatLevel result", async () => {
        const res = await hatsClient.getHatLevel(topHatId_2);
        expect(res).toBe(2);
      });

      test("Test getTippyTopHatDomain result", async () => {
        const res = await hatsClient.getTippyTopHatDomain(topHatDomain_2);
        expect(res).toBe(topHatDomain_1);
      });

      test("Test getAdmin result", async () => {
        const res = await hatsClient.getAdmin(topHatId_2);

        expect(res).toBe(hatId_1_1);
      });

      test("Test linked top-hat values", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [topHatId_2],
        });

        expect(res[0]).toBe("Tophat 2");
        expect(res[5]).toBe("Tophat 2 URI");
        expect(res[3]).toBe("0x0000000000000000000000000000000000000000");
        expect(res[4]).toBe("0x0000000000000000000000000000000000000000");
      });
    });

    describe("Tree 1 relinks tree 2", () => {
      let res: RelinkTopHatWithinTreeResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.relinkTopHatWithinTree({
            account: account1,
            topHatDomain: topHatDomain_2,
            newAdminHat: hatId_1_2,
            newDetails: "Tophat 2 details relinked",
            newImageURI: "Tophat 2 URI relinked",
            newEligibility: address1,
            newToggle: address1,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test relinkTopHatWithinTree return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test tree relinked", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "linkedTreeAdmins",
          args: [topHatDomain_2],
        });

        expect(res).toBe(hatId_1_2);
      });

      test("Test relinked top-hat values", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [topHatId_2],
        });

        expect(res[0]).toBe("Tophat 2 details relinked");
        expect(res[5]).toBe("Tophat 2 URI relinked");
        expect(res[3]).toBe(address1);
        expect(res[4]).toBe(address1);
      });
    });

    describe("Tree 1 unlinks tree 2", () => {
      let res: UnlinkTopHatFromTreeResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.unlinkTopHatFromTree({
            account: account1,
            topHatDomain: topHatDomain_2,
            wearer: address2,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test approveLinkTopHatToTree return value", () => {
        expect(res.status).toBe("success");
      });

      test("Test tree 2 ulinked", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "linkedTreeAdmins",
          args: [topHatDomain_2],
        });

        expect(res).toBe(
          BigInt(
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test unlinked top-hat values", async () => {
        const res = await publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [topHatId_2],
        });

        expect(res[0]).toBe("Tophat 2 details relinked");
        expect(res[5]).toBe("Tophat 2 URI relinked");
        expect(res[3]).toBe("0x0000000000000000000000000000000000000000");
        expect(res[4]).toBe("0x0000000000000000000000000000000000000000");
      });
    });
  });
});
