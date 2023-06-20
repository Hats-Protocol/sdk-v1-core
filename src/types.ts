export type Hat = {
  details: string;
  maxSupply: number;
  supply: number;
  eligibility: `0x${string}`;
  toggle: `0x${string}`;
  imageUri: string;
  numChildren: number;
  mutable: boolean;
  active: boolean;
};

interface TransactionResult {
  status: "success" | "reverted";
  transactionHash: `0x${string}`;
}

export interface CreateHatResult extends TransactionResult {
  hatId: bigint;
}

export interface MintTopHatResult extends TransactionResult {
  hatId: bigint;
}
