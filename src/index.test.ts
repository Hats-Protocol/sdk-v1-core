import { HatsClient } from "./index";

test("yo", async () => {
  const hatsClient = new HatsClient({ chainId: 5 });
  const res = await hatsClient.getHat({
    hatId: "0x0000000100000000000000000000000000000000000000000000000000000000",
  });
  console.log("returned", res);
});
