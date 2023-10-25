import { HatsSubgraphClient } from "../src/index";

describe("Client Tests", () => {
  let client: HatsSubgraphClient;

  beforeAll(() => {
    client = new HatsSubgraphClient();
  });

  test("Test fetchHat", async () => {
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
  //test("Test fetchTree", async () => {
  //  const res = await client.fetchTree({
  //    treeId: 1,
  //    chainId: 10,
  //  });
  //
  //  console.log(res);
  //
  //  expect(1).toBe(1);
  //});
});
