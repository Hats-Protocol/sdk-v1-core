import { HatsClient } from "./index";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";

describe("client tests", () => {
  const publicClient = createPublicClient({
    chain: goerli,
    transport: http(
      "https://goerli.infura.io/v3/ffca6b624a4c42eaaa1f01ed03053ef9"
    ),
  });

  const privateKey =
    "0x0cd5a37fea0e9c4f0c99b3b3f2da638f4ce98a09a8f2e54cfda2033965905f66";
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    chain: goerli,
    transport: http(
      "https://goerli.infura.io/v3/ffca6b624a4c42eaaa1f01ed03053ef9"
    ),
  });

  const hatsClient = new HatsClient({
    chainId: 5,
    publicClient: publicClient,
    walletClient: walletClient,
  });

  test("subgraph hat", async () => {
    const res = await hatsClient.getHat({
      hatId:
        "0x0000000100000000000000000000000000000000000000000000000000000000",
    });
  });

  test("viewHat", async () => {
    const res = await hatsClient.viewHat({
      hatId:
        "0x000000B300000000000000000000000000000000000000000000000000000000",
    });

    expect(res.active).toEqual(true);
    expect(res.details).toEqual("SDK Tests Tree");
    expect(res.eligibility).toEqual(
      "0x0000000000000000000000000000000000000000"
    );
    expect(res.toggle).toEqual("0x0000000000000000000000000000000000000000");
    expect(res.imageUri).toEqual(
      "ipfs://bafybeigcimbqwfajsnhoq7fqnbdllz7kye7cpdy3adj2sob3wku2llu5bi"
    );
    expect(res.numChildren).toEqual(0);
    expect(res.mutable).toEqual(false);
    expect(res.maxSupply).toEqual(1);
    expect(res.supply).toEqual(1);
  });

  test("isWearerOfHat", async () => {
    const res1 = await hatsClient.isWearerOfHat({
      address: "0x60EdE337dDe466c0839553579c81BFe1e795BFd2",
      hatId:
        "0x000000B300000000000000000000000000000000000000000000000000000000",
    });

    const res2 = await hatsClient.isWearerOfHat({
      address: "0x60EdE337dDe466c0839553579c81BFe1e795BFd3",
      hatId:
        "0x000000B300000000000000000000000000000000000000000000000000000000",
    });

    expect(res1).toEqual(true);
    expect(res2).toEqual(false);
  });

  test("isAdminOfHat", async () => {
    const res1 = await hatsClient.isAdminOfHat({
      address: "0x60EdE337dDe466c0839553579c81BFe1e795BFd2",
      hatId:
        "0x000000B300000000000000000000000000000000000000000000000000000000",
    });

    const res2 = await hatsClient.isWearerOfHat({
      address: "0x60EdE337dDe466c0839553579c81BFe1e795BFd3",
      hatId:
        "0x000000B300000000000000000000000000000000000000000000000000000000",
    });

    expect(res1).toEqual(true);
    expect(res2).toEqual(false);
  });

  test("isActive", async () => {
    const res1 = await hatsClient.isActive(
      "0x000000B300000000000000000000000000000000000000000000000000000000"
    );

    const res2 = await hatsClient.isActive(
      "0x000000B300010000000000000000000000000000000000000000000000000000"
    );

    expect(res1).toEqual(true);
    expect(res2).toEqual(false);
  });

  test("isInGoodStanding", async () => {
    const res1 = await hatsClient.isInGoodStanding({
      address: "0x60EdE337dDe466c0839553579c81BFe1e795BFd2",
      hatId:
        "0x000000B300000000000000000000000000000000000000000000000000000000",
    });

    expect(res1).toEqual(true);
  });

  test("isEligible", async () => {
    const res1 = await hatsClient.isEligible({
      address: "0x60EdE337dDe466c0839553579c81BFe1e795BFd2",
      hatId:
        "0x000000B300000000000000000000000000000000000000000000000000000000",
    });

    expect(res1).toEqual(true);
  });

  //test("mintTopHat", async () => {
  //  await hatsClient.mintTopHat({
  //    target: "0x60EdE337dDe466c0839553579c81BFe1e795BFd2",
  //    details: "From SDK",
  //    imageURI: "",
  //    account: account,
  //  });
  //});

  //test("createHat", async () => {
  //  await hatsClient.createHat({
  //    account: account,
  //    admin:
  //      "4879750346754265802834729730750553151928323140479843619079753455108096",
  //    details: "First Hat",
  //    maxSupply: 5,
  //    eligibility: "0x60EdE337dDe466c0839553579c81BFe1e795BFd2",
  //    toggle: "0x60EdE337dDe466c0839553579c81BFe1e795BFd2",
  //    mutable: true,
  //    imageURI: "",
  //  });
  //});
});
