import { HatsClient } from "./index";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { HATS_ABI } from "./abi/Hats";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";

describe("Client tests", () => {
  let account: PrivateKeyAccount;
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;

  describe("Hats client is initialized", () => {
    beforeAll(() => {
      const privateKey =
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
      account = privateKeyToAccount(privateKey);

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

    describe("Tree 1 is created", () => {
      beforeAll(async () => {
        const txHash = await hatsClient.mintTopHat({
          target: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          details: "Tophat SDK",
          imageURI: "Tophat URI",
          account: account,
        });

        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }, 30000);

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

        expect(res[0]).toEqual("Tophat SDK");
        expect(res[5]).toEqual("Tophat URI");
      });

      describe("Hat 1.1 is created", () => {
        beforeAll(async () => {
          const txHash = await hatsClient.createHat({
            admin: BigInt(
              "0x0000000100000000000000000000000000000000000000000000000000000000"
            ),
            maxSupply: 3,
            eligibility: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            toggle: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            mutable: true,
            details: "1.1 details",
            imageURI: "1.1 URI",
            account: account,
          });

          await publicClient.waitForTransactionReceipt({ hash: txHash });
        }, 30000);

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

          expect(res[0]).toEqual("1.1 details");
          expect(res[1]).toEqual(3);
          expect(res[2]).toEqual(0);
          expect(res[3]).toEqual("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
          expect(res[4]).toEqual("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
          expect(res[5]).toEqual("1.1 URI");
          expect(res[6]).toEqual(0);
          expect(res[7]).toEqual(true);
          expect(res[8]).toEqual(true);
        });

        test("test viewHat SDK function", async () => {
          const res = await hatsClient.viewHat(
            BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            )
          );

          expect(res.details).toEqual("1.1 details");
          expect(res.maxSupply).toEqual(3);
          expect(res.supply).toEqual(0);
          expect(res.eligibility).toEqual(
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
          );
          expect(res.toggle).toEqual(
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
          );
          expect(res.imageUri).toEqual("1.1 URI");
          expect(res.numChildren).toEqual(0);
          expect(res.mutable).toEqual(true);
          expect(res.active).toEqual(true);
        });

        test("test isWearerOfHat SDK function", async () => {
          const resTopHat = await hatsClient.isWearerOfHat({
            hatId: BigInt(
              "0x0000000100000000000000000000000000000000000000000000000000000000"
            ),
            wearer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          });

          const resChildHat = await hatsClient.isWearerOfHat({
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
            wearer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          });

          expect(resTopHat).toEqual(true);
          expect(resChildHat).toEqual(false);
        });

        test("test isAdminOfHat SDK function", async () => {
          const resTopHat = await hatsClient.isAdminOfHat({
            hatId: BigInt(
              "0x0000000100000000000000000000000000000000000000000000000000000000"
            ),
            user: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          });

          const resChildHat = await hatsClient.isAdminOfHat({
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
            user: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          });

          const resOtherTreeHat = await hatsClient.isAdminOfHat({
            hatId: BigInt(
              "0x0000000200000000000000000000000000000000000000000000000000000000"
            ),
            user: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          });

          expect(resTopHat).toEqual(true);
          expect(resChildHat).toEqual(true);
          expect(resOtherTreeHat).toEqual(false);
        });

        test("test isActive SDK function", async () => {
          const res = await hatsClient.isActive(
            BigInt(
              "0x0000000100000000000000000000000000000000000000000000000000000000"
            )
          );

          expect(res).toEqual(true);
        });

        test("test isInGoodStanding SDK function", async () => {
          const resTopHatWearer = await hatsClient.isInGoodStanding({
            hatId: BigInt(
              "0x0000000100000000000000000000000000000000000000000000000000000000"
            ),
            wearer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          });

          const resChildHatWearer = await hatsClient.isInGoodStanding({
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
            wearer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          });

          expect(resTopHatWearer).toEqual(true);
          expect(resChildHatWearer).toEqual(true);
        });

        test("test isEligible SDK function", async () => {
          const resTopHatWearer = await hatsClient.isEligible({
            hatId: BigInt(
              "0x0000000100000000000000000000000000000000000000000000000000000000"
            ),
            wearer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          });

          const resChildHatWearer = await hatsClient.isEligible({
            hatId: BigInt(
              "0x0000000100010000000000000000000000000000000000000000000000000000"
            ),
            wearer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          });

          expect(resTopHatWearer).toEqual(true);
          expect(resChildHatWearer).toEqual(true);
        });

        test("test predictHatId SDK function", async () => {
          const res = await hatsClient.predictHatId(
            BigInt(
              "0x0000000100000000000000000000000000000000000000000000000000000000"
            )
          );

          expect(res).toEqual(
            BigInt(
              "0x0000000100020000000000000000000000000000000000000000000000000000"
            )
          );
        });

        describe("Hat 1.1 is minted", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.mintHat({
              account: account,
              hatId: BigInt(
                "0x0000000100010000000000000000000000000000000000000000000000000000"
              ),
              wearer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }, 30000);

          test("Test hat 1.1 minted", async () => {
            const res = await publicClient.readContract({
              address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
              abi: HATS_ABI,
              functionName: "isWearerOfHat",
              args: [
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                BigInt(
                  "0x0000000100010000000000000000000000000000000000000000000000000000"
                ),
              ],
            });

            expect(res).toEqual(true);
          });
        });

        describe("Hat 1.1 is renounced", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.renounceHat({
              account: account,
              hatId: BigInt(
                "0x0000000100010000000000000000000000000000000000000000000000000000"
              ),
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }, 30000);

          test("Test hat 1.1 is renounced", async () => {
            const res = await publicClient.readContract({
              address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
              abi: HATS_ABI,
              functionName: "isWearerOfHat",
              args: [
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                BigInt(
                  "0x0000000100010000000000000000000000000000000000000000000000000000"
                ),
              ],
            });

            expect(res).toEqual(false);
          });
        });

        describe("Change Hat 1.1 details", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatDetails({
              account: account,
              hatId: BigInt(
                "0x0000000100010000000000000000000000000000000000000000000000000000"
              ),
              newDetails: "Hat 1.1 new details",
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }, 30000);

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

            expect(res[0]).toEqual("Hat 1.1 new details");
          });
        });

        describe("Change Hat 1.1 eligibility", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatEligibility({
              account: account,
              hatId: BigInt(
                "0x0000000100010000000000000000000000000000000000000000000000000000"
              ),
              newEligibility: "0x0000000000000000000000000000000000000001",
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }, 30000);

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

            expect(res[3]).toEqual(
              "0x0000000000000000000000000000000000000001"
            );
          });
        });

        describe("Change Hat 1.1 toggle", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatToggle({
              account: account,
              hatId: BigInt(
                "0x0000000100010000000000000000000000000000000000000000000000000000"
              ),
              newToggle: "0x0000000000000000000000000000000000000001",
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }, 30000);

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

            expect(res[4]).toEqual(
              "0x0000000000000000000000000000000000000001"
            );
          });
        });

        describe("Change Hat 1.1 image URI", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatImageURI({
              account: account,
              hatId: BigInt(
                "0x0000000100010000000000000000000000000000000000000000000000000000"
              ),
              newImageURI: "Hat 1.1 new image URI",
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }, 30000);

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

            expect(res[5]).toEqual("Hat 1.1 new image URI");
          });
        });

        describe("Change Hat 1.1 max supply", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatMaxSupply({
              account: account,
              hatId: BigInt(
                "0x0000000100010000000000000000000000000000000000000000000000000000"
              ),
              newMaxSupply: 10,
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }, 30000);

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

            expect(res[1]).toEqual(10);
          });
        });

        describe("Make Hat 1.1 immutable", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.makeHatImmutable({
              account: account,
              hatId: BigInt(
                "0x0000000100010000000000000000000000000000000000000000000000000000"
              ),
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }, 30000);

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

            expect(res[7]).toEqual(false);
          });
        });

        describe("Batch Create Hats 1.2 and 1.3", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.batchCreateHats({
              admins: [
                BigInt(
                  "0x0000000100000000000000000000000000000000000000000000000000000000"
                ),
                BigInt(
                  "0x0000000100000000000000000000000000000000000000000000000000000000"
                ),
              ],
              maxSupplies: [3, 5],
              eligibilityModules: [
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
              ],
              toggleModules: [
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
              ],
              mutables: [true, false],
              details: ["1.2 details", "1.3 details"],
              imageURIs: ["1.2 URI", "1.3 URI"],
              account: account,
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }, 30000);

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

            expect(res[0]).toEqual("1.2 details");
            expect(res[1]).toEqual(3);
            expect(res[2]).toEqual(0);
            expect(res[3]).toEqual(
              "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            );
            expect(res[4]).toEqual(
              "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            );
            expect(res[5]).toEqual("1.2 URI");
            expect(res[6]).toEqual(0);
            expect(res[7]).toEqual(true);
            expect(res[8]).toEqual(true);
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

            expect(res[0]).toEqual("1.3 details");
            expect(res[1]).toEqual(5);
            expect(res[2]).toEqual(0);
            expect(res[3]).toEqual(
              "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            );
            expect(res[4]).toEqual(
              "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            );
            expect(res[5]).toEqual("1.3 URI");
            expect(res[6]).toEqual(0);
            expect(res[7]).toEqual(false);
            expect(res[8]).toEqual(true);
          });
        });
      });
    });
  });
});
