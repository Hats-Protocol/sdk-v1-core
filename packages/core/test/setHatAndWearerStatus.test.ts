import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { NotToggleError, NotEligibilityError } from "../src/errors";
import { createAnvil } from "@viem/anvil";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import type { CreateHatResult, MintTopHatResult } from "../src/types";
import type { Anvil } from "@viem/anvil";
import "dotenv/config";

describe("mintHat tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let address1: Address;
  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;

  let topHatId: bigint;
  let childHatId: bigint;

  let anvil: Anvil;

  describe("Hats client is initialized", () => {
    beforeAll(async () => {
      anvil = createAnvil({
        forkUrl: process.env.SEPOLIA_RPC,
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

    describe("Tree and Hat are created", () => {
      let resTopHat: MintTopHatResult;
      let resCreateHat: CreateHatResult;
      beforeEach(async () => {
        try {
          resTopHat = await hatsClient.mintTopHat({
            target: address1,
            details: "Tophat SDK",
            imageURI: "Tophat URI",
            account: account1,
          });

          topHatId = resTopHat.hatId;

          resCreateHat = await hatsClient.createHat({
            admin: topHatId,
            maxSupply: 2,
            eligibility: address1,
            toggle: address1,
            mutable: true,
            details: "Hat details",
            imageURI: "Hat URI",
            account: account1,
          });

          childHatId = resCreateHat.hatId;
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test set hat status by non toggle", async () => {
        await expect(async () => {
          await hatsClient.setHatStatus({
            hatId: childHatId,
            newStatus: false,
            account: account2,
          });
        }).rejects.toThrow(NotToggleError);
      });

      test("Test set hat wearer status by non eligibility", async () => {
        await expect(async () => {
          await hatsClient.setHatWearerStatus({
            hatId: childHatId,
            wearer: address1,
            eligible: false,
            standing: false,
            account: account2,
          });
        }).rejects.toThrow(NotEligibilityError);
      });
    });
  });
});
