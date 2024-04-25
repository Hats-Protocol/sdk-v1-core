import { HatsClient } from "../src/index";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { createAnvil } from "@viem/anvil";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import { treeIdDecimalToHex } from "../src/utils";
import type { Anvil } from "@viem/anvil";
import "dotenv/config";

describe("copyTree tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsClient: HatsClient;
  let address1: Address;
  let account1: PrivateKeyAccount;

  let anvil: Anvil;

  describe("Hats client is initialized", () => {
    beforeAll(async () => {
      anvil = createAnvil({
        forkUrl: process.env.SEPOLIA_RPC,
        startTimeout: 20000,
      });
      await anvil.start();

      address1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      account1 = privateKeyToAccount(
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

    describe("Tree 1", () => {
      let topHatIdTarget: bigint;

      beforeAll(async () => {
        try {
          const resMintTopHat = await hatsClient.mintTopHat({
            target: address1,
            details: "Target 1 details",
            imageURI: "Target 1 URI",
            account: account1,
          });
          topHatIdTarget = resMintTopHat.hatId;
        } catch (err) {
          console.log(err);
        }
      }, 30000);

      test("Test copy tree", async () => {
        const treeDomainTarget = await hatsClient.getTopHatDomain(
          topHatIdTarget
        );

        const calls = await hatsClient.copyTreeCallData({
          sourceTree: 252,
          targetTree: treeDomainTarget,
        });

        await hatsClient.multicall({
          account: account1,
          calls,
        });

        const hat_x_1Target = await hatsClient.viewHat(
          BigInt(
            treeIdDecimalToHex(treeDomainTarget) +
              "00010000000000000000000000000000000000000000000000000000"
          )
        );
        const hat_x_2Target = await hatsClient.viewHat(
          BigInt(
            treeIdDecimalToHex(treeDomainTarget) +
              "00020000000000000000000000000000000000000000000000000000"
          )
        );
        const hat_x_2_1Target = await hatsClient.viewHat(
          BigInt(
            treeIdDecimalToHex(treeDomainTarget) +
              "00020001000000000000000000000000000000000000000000000000"
          )
        );

        // check 1.1
        expect(hat_x_1Target.details).toBe(
          "ipfs://bafkreic2b6ueqrtpwr34tmhylpew4nystil2zezavnoixdg66n2rsa7fde"
        );
        expect(hat_x_1Target.imageUri).toBe("Target 1 URI");
        expect(hat_x_1Target.maxSupply).toBe(2);
        expect(hat_x_1Target.mutable).toBe(true);
        expect(hat_x_1Target.supply).toBe(1);
        expect(hat_x_1Target.active).toBe(true);
        expect(hat_x_1Target.toggle.toLowerCase()).toBe(
          "0x0000000000000000000000000000000000004a75"
        );
        expect(hat_x_1Target.eligibility.toLowerCase()).toBe(
          "0x0000000000000000000000000000000000004a75"
        );
        expect(hat_x_1Target.numChildren).toBe(0);
        expect(
          await hatsClient.isWearerOfHat({
            wearer: "0x20ba9788ab1ab8e7dc72341a9d219eccaae90d8b",
            hatId: BigInt(
              treeIdDecimalToHex(treeDomainTarget) +
                "00010000000000000000000000000000000000000000000000000000"
            ),
          })
        );

        // check 1.2
        expect(hat_x_2Target.details).toBe(
          "ipfs://bafkreihbk3uzvapm37wiaxjrtw34kjxel5gi2l2ex2l2nn57az3wveguuq"
        );
        expect(hat_x_2Target.imageUri).toBe("Target 1 URI");
        expect(hat_x_2Target.maxSupply).toBe(1);
        expect(hat_x_2Target.mutable).toBe(true);
        expect(hat_x_2Target.supply).toBe(0);
        expect(hat_x_2Target.active).toBe(true);
        expect(hat_x_2Target.toggle.toLowerCase()).toBe(
          "0x0000000000000000000000000000000000004a75"
        );
        expect(hat_x_2Target.eligibility.toLowerCase()).toBe(
          "0x0000000000000000000000000000000000004a75"
        );
        expect(hat_x_2Target.numChildren).toBe(1);

        // check 1.2.1
        expect(hat_x_2_1Target.details).toBe(
          "ipfs://bafkreiehg6qx2tii2o4lt2c4aonhaicdd57iyi74eqy5he5bpybbvklnzi"
        );
        expect(hat_x_2_1Target.imageUri).toBe("Target 1 URI");
        expect(hat_x_2_1Target.maxSupply).toBe(3);
        expect(hat_x_2_1Target.mutable).toBe(true);
        expect(hat_x_2_1Target.supply).toBe(1);
        expect(hat_x_2_1Target.active).toBe(true);
        expect(hat_x_2_1Target.toggle.toLowerCase()).toBe(
          "0x0000000000000000000000000000000000004a75"
        );
        expect(hat_x_2_1Target.eligibility.toLowerCase()).toBe(
          "0x0000000000000000000000000000000000004a75"
        );
        expect(hat_x_2_1Target.numChildren).toBe(0);
        expect(
          await hatsClient.isWearerOfHat({
            wearer: "0x20ba9788ab1ab8e7dc72341a9d219eccaae90d8b",
            hatId: BigInt(
              treeIdDecimalToHex(treeDomainTarget) +
                "00020001000000000000000000000000000000000000000000000000"
            ),
          })
        );
      }, 30000);
    });
  });
});
