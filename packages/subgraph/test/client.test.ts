import { HatsSubgraphClient } from "../src/index";

describe("Client Tests", () => {
  let client: HatsSubgraphClient;

  beforeAll(() => {
    client = new HatsSubgraphClient();
  });

  test("Test fetchHat", async () => {
    const res = await client.fetchHat({
      hatId: BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      ),
      chainId: 10,
    });

    console.log(res);

    expect(1).toBe(1);
  });
});
