import type { Hex } from "viem";

export function hatIdDecimalToHex(hatId: bigint): Hex {
  return ("0x" + BigInt(hatId).toString(16).padStart(64, "0")) as Hex;
}

export function treeIdDecimalToHex(treeId: number): Hex {
  return ("0x" + treeId.toString(16).padStart(8, "0")) as Hex;
}

export function hatIdHexToDecimal(hatId: string): bigint {
  return BigInt(hatId);
}

export function treeIdHexToDecimal(treeId: string): number {
  return parseInt(treeId, 16);
}

export function hatIdDecimalToIp(hatId: bigint): string {
  const hexId = hatIdDecimalToHex(hatId);
  let ip = treeIdHexToDecimal(hexId.substring(0, 10)).toString();
  for (let i = 10; i < hexId.length; i += 4) {
    const domainAtLevel = hexId.substring(i, i + 4);
    if (domainAtLevel === "0000") {
      break;
    }
    ip += "." + parseInt(domainAtLevel, 16);
  }
  return ip;
}

export function hatIdIpToDecimal(hatId: string): bigint {
  const domains = hatId.split(".");

  let hatIdHex = parseInt(domains[0]).toString(16).padStart(8, "0");
  for (let i = 1; i < domains.length; i++) {
    hatIdHex = hatIdHex + parseInt(domains[i]).toString(16).padStart(4, "0");
  }
  hatIdHex = "0x" + hatIdHex.padEnd(64, "0");

  return BigInt(hatIdHex);
}

export function treeIdToTopHatId(treeId: number): bigint {
  return BigInt(treeIdDecimalToHex(treeId).padEnd(66, "0"));
}

export function hatIdToTreeId(hatId: bigint): number {
  return parseInt(
    "0x" + BigInt(hatId).toString(16).padStart(64, "0").substring(0, 8),
    16
  );
}
