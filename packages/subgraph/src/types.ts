export interface Hat {
  id: string;
  prettyId: string;
  status: boolean;
  createdAt?: string;
  details: string;
  maxSupply: string;
  eligibility: `0x${string}`;
  toggle: `0x${string}`;
  mutable: boolean;
  imageUri: string;
  levelAtLocalTree: number;
  currentSupply: string;
  tree: Partial<Tree>;
  wearers: Partial<Wearer>[];
  badStandings: Partial<Wearer>[];
  admin: Partial<Hat>;
  subHats: Partial<Hat>[];
  linkRequestFromTree: Partial<Tree>[];
  linkedTrees: Partial<Tree>[];
  claimableBy: `0x${string}`[];
  claimableForBy: `0x${string}`[];
  events: Partial<HatEvent>[];
}

export interface Wearer {
  id: `0x${string}`;
  chainId: number;
  currentHats: Partial<Hat>[];
}

export interface Tree {
  id: number;
  chainId: number;
  hats: Partial<Hat>[];
  childOfTree: Partial<Tree>;
  parentOfTrees: Partial<Tree>[];
  linkedToHat: Partial<Hat>;
  linkRequestFromTree: Partial<Tree>[];
  requestedLinkToTree: Partial<Tree>;
  requestedLinkToHat: Partial<Hat>;
}

export interface HatEvent {
  id: string;
  timestamp: bigint;
  blockNumber: number;
  transactionID: string;
}

export interface TreeEvent extends HatEvent {
  hat: Partial<Hat>;
}
