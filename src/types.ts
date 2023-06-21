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

export interface BatchCreateHatsResult extends TransactionResult {
  hatIds: bigint[];
}

export interface MintHatResult extends TransactionResult {}

export interface RenounceHatResult extends TransactionResult {}

export interface ChangeHatDetailsResult extends TransactionResult {}

export interface ChangeHatEligibilityResult extends TransactionResult {}

export interface ChangeHatToggleResult extends TransactionResult {}

export interface ChangeHatImageURIResult extends TransactionResult {}

export interface ChangeHatMaxSupplyResult extends TransactionResult {}

export interface MakeHatImmutableResult extends TransactionResult {}

export interface BatchMintHatsResult extends TransactionResult {}

export interface SetHatStatusResult extends TransactionResult {}

export interface TransferHatResult extends TransactionResult {}

export interface SetHatWearerStatusResult extends TransactionResult {}
