type GqlHat = {
  id: string;
  status: boolean;
  details: string;
  maxSupply: number;
  currentSupply: number;
  eligibility: string;
  toggle: string;
  mutable: boolean;
};

type GqlTreeHats = bigint[];

export type { GqlHat, GqlTreeHats };
