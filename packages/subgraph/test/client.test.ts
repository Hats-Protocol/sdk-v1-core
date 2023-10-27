import { HatsSubgraphClient } from "../src/index";

describe("Client Tests", () => {
  let client: HatsSubgraphClient;

  beforeAll(() => {
    client = new HatsSubgraphClient();
  });

  /*
  test("Test getHat", async () => {
    const res = await client.getHat({
      chainId: 10,
      hatId: BigInt(
        "0x0000000100020001000100000000000000000000000000000000000000000000"
      ),
      props: {
        prettyId: true,
        eligibility: true,
        admin: {
          prettyId: true,
          eligibility: true,
          subHats: { prettyId: true, eligibility: true },
        },
      },
    });

    console.log(JSON.stringify(res, null, 2));

    expect(1).toBe(1);
  }, 30000);
  */

  /*
  test("Test getHats", async () => {
    const res = await client.getHats({
      chainId: 10,
      hatIds: [
        BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        BigInt(
          "0x0000000100020001000000000000000000000000000000000000000000000000"
        ),
      ],
      props: {
        prettyId: true,
        admin: {
          prettyId: true,
          subHats: {
            prettyId: true,
          },
        },
      },
    });

    console.log(JSON.stringify(res, null, 2));

    expect(1).toBe(1);
  });
*/
  /*
  test("Test getTree", async () => {
    const res = await client.getTree({
      chainId: 10,
      treeId: 1,
      props: {
        hats: {
          prettyId: true,
          admin: {
            prettyId: true,
          },
        },
      },
      firstHats: 1,
    });

    console.log(JSON.stringify(res, null, 2));

    expect(1).toBe(1);
  });
*/
  /*
  test("Test getTreesPaginated", async () => {
    const res = await client.getTreesPaginated({
      chainId: 10,
      props: {
        hats: {
          prettyId: true,
          admin: {
            prettyId: true,
          },
        },
      },
      page: 3,
      perPage: 10,
      firstHats: 1,
    });

    console.log(JSON.stringify(res, null, 2));

    expect(1).toBe(1);
  });
  */
  /*
  test("Test getTrees", async () => {
    const res = await client.getTrees({
      chainId: 10,
      props: {
        hats: {
          prettyId: true,
          admin: {
            prettyId: true,
          },
        },
      },
      treeIds: [1, 2],
      firstHats: 1,
    });

    console.log(JSON.stringify(res, null, 2));

    expect(1).toBe(1);
  });
  */
  /*
  test("Test getWearer", async () => {
    const res = await client.getWearer({
      chainId: 10,
      props: {
        currentHats: {
          prettyId: true,
        },
        mintEvent: {
          hat: {
            prettyId: true,
          },
        },
      },
      wearerAddress: "0xEb2ee1250DC8C954dA4efF4DF0E4467A1ca6af6c",
    });

    console.log(JSON.stringify(res, null, 2));

    expect(1).toBe(1);
  });
  */

  test("Test getWearersOfHatPaginated", async () => {
    const res = await client.getWearersOfHatPaginated({
      chainId: 10,
      props: {},
      hatId: BigInt(
        "0x0000000100020001000100000000000000000000000000000000000000000000"
      ),
      page: 0,
      perPage: 2,
    });

    console.log(JSON.stringify(res, null, 2));

    expect(1).toBe(1);
  });
});
