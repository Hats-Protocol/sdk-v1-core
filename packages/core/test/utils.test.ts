import {
  hatIdDecimalToHex,
  hatIdHexToDecimal,
  treeIdDecimalToHex,
  treeIdHexToDecimal,
  treeIdToTopHatId,
  hatIdToTreeId,
  hatIdDecimalToIp,
  hatIdIpToDecimal,
} from "../src/index";

describe("Utils tests", () => {
  test("Test hatIdDecimalToHex", () => {
    const id1 =
      "0x0000000100000000000000000000000000000000000000000000000000000000";
    const id2 =
      "0x0000000100010000000000000000000000000000000000000000000000000000";
    const id3 =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const id4 =
      "0x0000000100010001000100010001000100010001000100010001000100010001";

    expect(hatIdDecimalToHex(BigInt(id1))).toBe(id1);
    expect(hatIdDecimalToHex(BigInt(id2))).toBe(id2);
    expect(hatIdDecimalToHex(BigInt(id3))).toBe(id3);
    expect(hatIdDecimalToHex(BigInt(id4))).toBe(id4);
  });

  test("Test hatIdHexToDecimal", () => {
    const id1 =
      "0x0000000100000000000000000000000000000000000000000000000000000000";
    const id2 =
      "0x0000000100010000000000000000000000000000000000000000000000000000";
    const id3 =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const id4 =
      "0x0000000100010001000100010001000100010001000100010001000100010001";

    expect(hatIdHexToDecimal(id1)).toBe(BigInt(id1));
    expect(hatIdHexToDecimal(id2)).toBe(BigInt(id2));
    expect(hatIdHexToDecimal(id3)).toBe(BigInt(id3));
    expect(hatIdHexToDecimal(id4)).toBe(BigInt(id4));
  });

  test("Test treeIdDecimalToHex", () => {
    const id1 = 1;
    const id2 = 12;
    const id3 = 1112;
    const id4 = 0;

    expect(treeIdDecimalToHex(id1)).toBe("0x00000001");
    expect(treeIdDecimalToHex(id2)).toBe("0x0000000c");
    expect(treeIdDecimalToHex(id3)).toBe("0x00000458");
    expect(treeIdDecimalToHex(id4)).toBe("0x00000000");
  });

  test("Test treeIdHexToDecimal", () => {
    const id1 = "0x00000001";
    const id2 = "0x0000000c";
    const id3 = "0x00000458";
    const id4 = "0x00000000";

    expect(treeIdHexToDecimal(id1)).toBe(1);
    expect(treeIdHexToDecimal(id2)).toBe(12);
    expect(treeIdHexToDecimal(id3)).toBe(1112);
    expect(treeIdHexToDecimal(id4)).toBe(0);
  });

  test("Test treeIdToTopHatId", () => {
    const id1 = 1;
    const id2 = 12;
    const id3 = 1112;
    const id4 = 0;

    expect(treeIdToTopHatId(id1)).toBe(
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(treeIdToTopHatId(id2)).toBe(
      BigInt(
        "0x0000000c00000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(treeIdToTopHatId(id3)).toBe(
      BigInt(
        "0x0000045800000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(treeIdToTopHatId(id4)).toBe(
      BigInt(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      )
    );
  });

  test("Test hatIdToTreeId", () => {
    const id1 = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const id2 = BigInt(
      "0x0000000c00000000000000000000000000000000000000000000000000000000"
    );
    const id3 = BigInt(
      "0x0000045800000000000000000000000000000000000000000000000000000000"
    );
    const id4 = BigInt(
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );

    expect(hatIdToTreeId(id1)).toBe(1);
    expect(hatIdToTreeId(id2)).toBe(12);
    expect(hatIdToTreeId(id3)).toBe(1112);
    expect(hatIdToTreeId(id4)).toBe(0);
  });

  test("Test hatIdDecimalToIp", () => {
    const id1 = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const id2 = BigInt(
      "0x0000000c00000000000000000000000000000000000000000000000000000000"
    );
    const id3 = BigInt(
      "0x0000045800000000000000000000000000000000000000000000000000000000"
    );
    const id4 = BigInt(
      "0x0000000100010001000000000000000000000000000000000000000000000000"
    );
    const id5 = BigInt(
      "0x0000000100010001000100010001000100010001000100010001000100010001"
    );

    expect(hatIdDecimalToIp(id1)).toBe("1");
    expect(hatIdDecimalToIp(id2)).toBe("12");
    expect(hatIdDecimalToIp(id3)).toBe("1112");
    expect(hatIdDecimalToIp(id4)).toBe("1.1.1");
    expect(hatIdDecimalToIp(id5)).toBe("1.1.1.1.1.1.1.1.1.1.1.1.1.1.1");
  });

  test("Test hatIdIpToDecimal", () => {
    const id1 = "1.1";
    const id2 = "1";
    const id3 = "16";
    const id4 = "1.1.16";
    const id5 = "2.3.4.5.6.7.10";

    expect(hatIdIpToDecimal(id1)).toBe(
      BigInt(
        "0x0000000100010000000000000000000000000000000000000000000000000000"
      )
    );
    expect(hatIdIpToDecimal(id2)).toBe(
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(hatIdIpToDecimal(id3)).toBe(
      BigInt(
        "0x0000001000000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(hatIdIpToDecimal(id4)).toBe(
      BigInt(
        "0x0000000100010010000000000000000000000000000000000000000000000000"
      )
    );
    expect(hatIdIpToDecimal(id5)).toBe(
      BigInt(
        "0x0000000200030004000500060007000a00000000000000000000000000000000"
      )
    );
  });
});
