export function hatIdToHex(hatId: bigint): string {
  return "0x" + BigInt(hatId).toString(16).padStart(64, "0");
}

export function treeIdToHex(treeId: number): string {
  return "0x" + treeId.toString(16).padStart(8, "0");
}
