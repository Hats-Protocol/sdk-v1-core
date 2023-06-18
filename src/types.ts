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
