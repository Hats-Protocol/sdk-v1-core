import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, goerli } from "viem/chains";
import { HATS_ABI } from "../src/abi/Hats";
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

describe("Basic tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let address1: Address;
  let address2: Address;
  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;

  let publicClientGoerli: PublicClient;
  let hatsClientGoerli: HatsClient;

  describe("Hats client is initialized", () => {
    beforeAll(() => {
      address1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
      address2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
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

      publicClientGoerli = createPublicClient({
        chain: goerli,
        transport: http(
          "https://goerli.infura.io/v3/ffca6b624a4c42eaaa1f01ed03053ef9"
        ),
      });

      hatsClientGoerli = new HatsClient({
        chainId: goerli.id,
        publicClient: publicClientGoerli,
      });
    }, 30000);

    describe("Subgraph getTreeHats", () => {
      let res: bigint[];
      beforeAll(async () => {
        res = await hatsClientGoerli.getTreeHats(179);
      });

      test("Test getTreeHats result", () => {
        expect(res[0]).toBe(
          BigInt(
            "0x000000b300000000000000000000000000000000000000000000000000000000"
          )
        );
        expect(res[1]).toBe(
          BigInt(
            "0x000000b300010000000000000000000000000000000000000000000000000000"
          )
        );
      });
    });

    describe("Subgraph getWearerHats", () => {
      let res: bigint[];
      let wearer: Address = "0x20ba9788Ab1aB8e7dc72341A9D219ECCAAE90d8B";

      beforeAll(async () => {
        res = await hatsClientGoerli.getWearerHats(wearer);
      });

      test("Test getWearerHats result", () => {
        expect(res[0]).toBe(
          BigInt(
            "0x000000b300010000000000000000000000000000000000000000000000000000"
          )
        );
        expect(res[1]).toBe(
          BigInt(
            "0x000000b300020000000000000000000000000000000000000000000000000000"
          )
        );
      });
    });

    describe("Tree 1 is created", () => {
      let res: MintTopHatResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.mintTopHat({
            target: address1,
            details: "Tophat SDK",
            imageURI: "Tophat URI",
            account: account1,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test mintTopHat return value", () => {
        expect(res.status).toBe("success");
        expect(res.hatId).toBe(
          BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test top-hat is created", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100000000000000000000000000000000000000000000000000000000"
            ),
          ],
        });

        expect(res[0]).toBe("Tophat SDK");
        expect(res[5]).toBe("Tophat URI");
      });
    });

    describe("Hat 1.1 is created", () => {
      let res: CreateHatResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.createHat({
            admin: BigInt(
              "0x0000000100000000000000000000000000000000000000000000000000000000"
            ),
            maxSupply: 3,
            eligibility: address1,
            toggle: address1,
            mutable: true,
            details: "1.1 details",
            imageURI: "1.1 URI",
            account: account1,
          });
        } catch (err) {
          console.log("err", err);
        }
      }, 30000);

      test("Test createHat return value", () => {
        expect(res.status).toBe("success");
        expect(res.hatId).toBe(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test hat is created", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
          ],
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
        const res = await hatsClient.viewHat(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );

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
        const res = await hatsClient.getAdmin(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );

        expect(res).toBe(
          BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("test isWearerOfHat SDK function", async () => {
        const resTopHat = await hatsClient.isWearerOfHat({
          hatId: BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          ),
          wearer: address1,
        });

        const resChildHat = await hatsClient.isWearerOfHat({
          hatId: BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          ),
          wearer: address1,
        });

        expect(resTopHat).toBe(true);
        expect(resChildHat).toBe(false);
      });

      test("test isAdminOfHat SDK function", async () => {
        const resTopHat = await hatsClient.isAdminOfHat({
          hatId: BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          ),
          user: address1,
        });

        const resChildHat = await hatsClient.isAdminOfHat({
          hatId: BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          ),
          user: address1,
        });

        const resOtherTreeHat = await hatsClient.isAdminOfHat({
          hatId: BigInt(
            "0x0000000200000000000000000000000000000000000000000000000000000000"
          ),
          user: address1,
        });

        expect(resTopHat).toBe(true);
        expect(resChildHat).toBe(true);
        expect(resOtherTreeHat).toBe(false);
      });

      test("test isActive SDK function", async () => {
        const res = await hatsClient.isActive(
          BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          )
        );

        expect(res).toBe(true);
      });

      test("test isInGoodStanding SDK function", async () => {
        const resTopHatWearer = await hatsClient.isInGoodStanding({
          hatId: BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          ),
          wearer: address1,
        });

        const resChildHatWearer = await hatsClient.isInGoodStanding({
          hatId: BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          ),
          wearer: address1,
        });

        expect(resTopHatWearer).toBe(true);
        expect(resChildHatWearer).toBe(true);
      });

      test("test isEligible SDK function", async () => {
        const resTopHatWearer = await hatsClient.isEligible({
          hatId: BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          ),
          wearer: address1,
        });

        const resChildHatWearer = await hatsClient.isEligible({
          hatId: BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          ),
          wearer: address1,
        });

        expect(resTopHatWearer).toBe(true);
        expect(resChildHatWearer).toBe(true);
      });

      test("test predictHatId SDK function", async () => {
        const res = await hatsClient.predictHatId(
          BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          )
        );

        expect(res).toBe(
          BigInt(
            "0x0000000100020000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("test getHatLevel SDK function", async () => {
        const res = await hatsClient.getHatLevel(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );

        expect(res).toBe(1);
      });

      test("test getLocalHatLevel SDK function", async () => {
        const res = await hatsClient.getLocalHatLevel(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );

        expect(res).toBe(1);
      });

      test("test getTopHatDomain SDK function", async () => {
        const res = await hatsClient.getTopHatDomain(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );

        expect(res).toBe(1);
      });
    });

    describe("Hat 1.1 is minted", () => {
      beforeAll(async () => {
        try {
          await hatsClient.mintHat({
            account: account1,
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
            wearer: address1,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test hat 1.1 minted", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [
            address1,
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [
            address1,
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
          ],
        });

        expect(res[7]).toBe(false);
      });
    });

    describe("Batch Create Hats 1.2 and 1.3", () => {
      let res: BatchCreateHatsResult;
      beforeAll(async () => {
        try {
          res = await hatsClient.batchCreateHats({
            admins: [
              BigInt(
                "0x0000000100000000000000000000000000000000000000000000000000000000"
              ),
              BigInt(
                "0x0000000100000000000000000000000000000000000000000000000000000000"
              ),
            ],
            maxSupplies: [3, 5],
            eligibilityModules: [address1, address1],
            toggleModules: [address1, address1],
            mutables: [true, false],
            details: ["1.2 details", "1.3 details"],
            imageURIs: ["1.2 URI", "1.3 URI"],
            account: account1,
          });
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test batchCreateHats result value", () => {
        expect(res.hatIds[0]).toBe(
          BigInt(
            "0x0000000100020000000000000000000000000000000000000000000000000000"
          )
        );
        expect(res.hatIds[1]).toBe(
          BigInt(
            "0x0000000100030000000000000000000000000000000000000000000000000000"
          )
        );
        expect(res.status).toBe("success");
      });

      test("Test hat 1.2 is created", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            ),
          ],
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000100030000000000000000000000000000000000000000000000000000"
            ),
          ],
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
        const res = await hatsClient.getChildrenHats(
          BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          )
        );

        expect(res[0]).toBe(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );
        expect(res[1]).toBe(
          BigInt(
            "0x0000000100020000000000000000000000000000000000000000000000000000"
          )
        );
        expect(res[2]).toBe(
          BigInt(
            "0x0000000100030000000000000000000000000000000000000000000000000000"
          )
        );
      });
    });

    describe("Batch mint hats 1.2 and 1.3", () => {
      let res: BatchMintHatsResult;

      beforeAll(async () => {
        res = await hatsClient.batchMintHats({
          account: account1,
          hatIds: [
            BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            ),
            BigInt(
              "0x0000000100030000000000000000000000000000000000000000000000000000"
            ),
          ],
          wearers: [address1, address2],
        });
      }, 30000);

      test("Test batchMintHats result value", () => {
        expect(res.status).toBe("success");
      });

      test("Test Hat 1.2 is minted", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [
            address1,
            BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            ),
          ],
        });

        expect(res).toBe(true);
      });

      test("Test Hat 1.3 is minted", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [
            address2,
            BigInt(
              "0x0000000100030000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100030000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "isActive",
          args: [
            BigInt(
              "0x0000000100030000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [
            address2,
            BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            ),
          ],
        });

        const res2 = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [
            address1,
            BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            hatId: BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "isWearerOfHat",
          args: [
            address2,
            BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            ),
          ],
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
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test mintTopHat return value", () => {
        expect(res.status).toBe("success");
        expect(res.hatId).toBe(
          BigInt(
            "0x0000000200000000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test top-hat is created", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000200000000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            topHatDomain: 2,
            requestedAdminHat: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "linkedTreeRequests",
          args: [2],
        });

        expect(res).toBe(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test getLinkageRequest request", async () => {
        const res = await hatsClient.getLinkageRequest(2);

        expect(res).toBe(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );
      });
    });

    describe("Tree 1 accepts linkage", () => {
      let res: ApproveLinkTopHatToTreeResult;

      beforeAll(async () => {
        try {
          res = await hatsClient.approveLinkTopHatToTree({
            account: account1,
            topHatDomain: 2,
            newAdminHat: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "linkedTreeAdmins",
          args: [2],
        });

        expect(res).toBe(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test getLinkedTreeAdmin result", async () => {
        const res = await hatsClient.getLinkedTreeAdmin(2);

        expect(res).toBe(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test getHatLevel result", async () => {
        const res = await hatsClient.getHatLevel(
          BigInt(
            "0x0000000200000000000000000000000000000000000000000000000000000000"
          )
        );

        expect(res).toBe(2);
      });

      test("Test getTippyTopHatDomain result", async () => {
        const res = await hatsClient.getTippyTopHatDomain(2);

        expect(res).toBe(1);
      });

      test("Test getAdmin result", async () => {
        const res = await hatsClient.getAdmin(
          BigInt(
            "0x0000000200000000000000000000000000000000000000000000000000000000"
          )
        );

        expect(res).toBe(
          BigInt(
            "0x0000000100010000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test linked top-hat values", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000200000000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            topHatDomain: 2,
            newAdminHat: BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            ),
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "linkedTreeAdmins",
          args: [2],
        });

        expect(res).toBe(
          BigInt(
            "0x0000000100020000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test relinked top-hat values", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000200000000000000000000000000000000000000000000000000000000"
            ),
          ],
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
            topHatDomain: 2,
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
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "linkedTreeAdmins",
          args: [2],
        });

        expect(res).toBe(
          BigInt(
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          )
        );
      });

      test("Test unlinked top-hat values", async () => {
        const res = await publicClient.readContract({
          address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
          abi: HATS_ABI,
          functionName: "viewHat",
          args: [
            BigInt(
              "0x0000000200000000000000000000000000000000000000000000000000000000"
            ),
          ],
        });

        expect(res[0]).toBe("Tophat 2 details relinked");
        expect(res[5]).toBe("Tophat 2 URI relinked");
        expect(res[3]).toBe("0x0000000000000000000000000000000000000000");
        expect(res[4]).toBe("0x0000000000000000000000000000000000000000");
      });
    });

    describe("Get number of trees", () => {
      let res: number;

      beforeAll(async () => {
        res = await hatsClient.getTreesCount();
      });

      test("Test getTreesCount result", () => {
        expect(res).toBe(2);
      });
    });
  });
});
