import { HatsClient } from "./index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { HATS_ABI } from "./abi/Hats";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";

describe("Client tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let address1: Address;
  let address2: Address;
  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;

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
    }, 30000);

    describe("Tree 1 is created", () => {
      beforeAll(async () => {
        const txHash = await hatsClient.mintTopHat({
          target: address1,
          details: "Tophat SDK",
          imageURI: "Tophat URI",
          account: account1,
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

        expect(res[0]).toBe("Tophat SDK");
        expect(res[5]).toBe("Tophat URI");
      });

      describe("Hat 1.1 is created", () => {
        beforeAll(async () => {
          const txHash = await hatsClient.createHat({
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

        describe("Hat 1.1 is minted", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.mintHat({
              account: account1,
              hatId: BigInt(
                "0x0000000100010000000000000000000000000000000000000000000000000000"
              ),
              wearer: address1,
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
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
          beforeAll(async () => {
            const txHash = await hatsClient.renounceHat({
              account: account1,
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
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatDetails({
              account: account1,
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

            expect(res[0]).toBe("Hat 1.1 new details");
          });
        });

        describe("Change Hat 1.1 eligibility", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatEligibility({
              account: account1,
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

            expect(res[3]).toBe("0x0000000000000000000000000000000000000001");
          });
        });

        describe("Change Hat 1.1 toggle", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatToggle({
              account: account1,
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

            expect(res[4]).toBe("0x0000000000000000000000000000000000000001");
          });
        });

        describe("Change Hat 1.1 image URI", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatImageURI({
              account: account1,
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

            expect(res[5]).toBe("Hat 1.1 new image URI");
          });
        });

        describe("Change Hat 1.1 max supply", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.changeHatMaxSupply({
              account: account1,
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

            expect(res[1]).toBe(10);
          });
        });

        describe("Make Hat 1.1 immutable", () => {
          beforeAll(async () => {
            const txHash = await hatsClient.makeHatImmutable({
              account: account1,
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

            expect(res[7]).toBe(false);
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
              eligibilityModules: [address1, address1],
              toggleModules: [address1, address1],
              mutables: [true, false],
              details: ["1.2 details", "1.3 details"],
              imageURIs: ["1.2 URI", "1.3 URI"],
              account: account1,
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

          describe("Batch mint hats 1.2 and 1.3", () => {
            beforeAll(async () => {
              const txHash = await hatsClient.batchMintHats({
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

              await publicClient.waitForTransactionReceipt({ hash: txHash });
            }, 30000);

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

            describe("Hat 1.2 becomes inactive", () => {
              beforeAll(async () => {
                const txHash = await hatsClient.setHatStatus({
                  account: account1,
                  hatId: BigInt(
                    "0x0000000100020000000000000000000000000000000000000000000000000000"
                  ),
                  newStatus: false,
                });

                await publicClient.waitForTransactionReceipt({ hash: txHash });
              }, 30000);

              test("Test hat 1.2 is inactive", async () => {
                const res = await publicClient.readContract({
                  address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
                  abi: HATS_ABI,
                  functionName: "isActive",
                  args: [
                    BigInt(
                      "0x0000000100020000000000000000000000000000000000000000000000000000"
                    ),
                  ],
                });

                expect(res).toBe(false);
              });
            });

            describe("Wearer becomes non eligible for hat 1.3", () => {
              beforeAll(async () => {
                const txHash = await hatsClient.setHatWearerStatus({
                  account: account1,
                  hatId: BigInt(
                    "0x0000000100030000000000000000000000000000000000000000000000000000"
                  ),
                  wearer: address2,
                  eligible: false,
                  standing: true,
                });

                await publicClient.waitForTransactionReceipt({ hash: txHash });
              }, 30000);

              test("Test hat 1.3 burned", async () => {
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

                expect(res).toBe(false);
              });
            });
          });
        });
      });
    });
  });
});
