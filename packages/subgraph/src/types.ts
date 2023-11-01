export interface Hat {
  id: string;
  prettyId?: string;
  status?: boolean;
  createdAt?: string;
  details?: string;
  maxSupply?: string;
  eligibility?: `0x${string}`;
  toggle?: `0x${string}`;
  mutable?: boolean;
  imageUri?: string;
  levelAtLocalTree?: number;
  currentSupply?: string;
  tree?: Tree;
  wearers?: Wearer[];
  badStandings?: Wearer[];
  admin?: Hat;
  subHats?: Hat[];
  linkRequestFromTree?: Tree[];
  linkedTrees?: Tree[];
  claimableBy?: ClaimsHatter[];
  claimableForBy?: ClaimsHatter[];
  events?: HatsEvent[];
}

export interface HatConfig {
  prettyId?: boolean;
  status?: boolean;
  createdAt?: boolean;
  details?: boolean;
  maxSupply?: boolean;
  eligibility?: boolean;
  toggle?: boolean;
  mutable?: boolean;
  imageUri?: boolean;
  levelAtLocalTree?: boolean;
  currentSupply?: boolean;
  tree?: TreeConfig;
  wearers?: WearerConfig;
  badStandings?: WearerConfig;
  admin?: HatConfig;
  subHats?: HatConfig;
  linkRequestFromTree?: TreeConfig;
  linkedTrees?: TreeConfig;
  claimableBy?: ClaimsHatterConfig;
  claimableForBy?: ClaimsHatterConfig;
  events?: HatsEventConfig;
}

export interface Wearer {
  id: string;
  currentHats?: Hat[];
  mintEvent?: HatsEvent[];
  burnEvent?: HatsEvent[];
}

export interface WearerConfig {
  currentHats?: HatConfig;
  mintEvent?: HatsEventConfig;
  burnEvent?: HatsEventConfig;
}

export interface Tree {
  id: number;
  hats?: Hat[];
  childOfTree?: Tree;
  parentOfTrees?: Tree[];
  linkedToHat?: Hat;
  linkRequestFromTree?: Tree[];
  requestedLinkToTree?: Tree;
  requestedLinkToHat?: Hat;
  events?: HatsEvent[];
}

export interface TreeConfig {
  hats?: HatConfig;
  childOfTree?: TreeConfig;
  parentOfTrees?: TreeConfig;
  linkedToHat?: HatConfig;
  linkRequestFromTree?: TreeConfig;
  requestedLinkToTree?: TreeConfig;
  requestedLinkToHat?: HatConfig;
  events?: HatsEventConfig;
}

export interface HatsEvent {
  id: string;
  timestamp?: bigint;
  blockNumber?: number;
  transactionID?: string;
  hat?: Hat;
  tree?: Tree;
}

export interface HatsEventConfig {
  timestamp?: boolean;
  blockNumber?: boolean;
  transactionID?: boolean;
  hat?: HatConfig;
  tree?: TreeConfig;
}

export interface ClaimsHatter {
  id: string;
  claimableHats?: Hat[];
  claimableForHats?: Hat[];
}

export interface ClaimsHatterConfig {
  claimableHats?: HatConfig;
  claimableForHats?: HatConfig;
}

export interface Filters {
  first?: {
    hat?: {
      wearers?: number;
      badStandings?: number;
      subHats?: number;
      linkRequestFromTree?: number;
      linkedTrees?: number;
      claimableBy?: number;
      claimableForBy?: number;
      events?: number;
    };
    wearer?: {
      currentHats?: number;
      mintEvent?: number;
      burnEvent?: number;
    };
    tree?: {
      hats?: number;
      parentOfTrees?: number;
      linkRequestFromTree?: number;
      events?: number;
    };
    claimsHatter?: {
      claimableHats?: number;
      claimableForHats?: number;
    };
  };
}

export type GqlObjType =
  | "Hat"
  | "Tree"
  | "Wearer"
  | "HatsEvent"
  | "ClaimsHatter";
