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
  events?: HatEvent[];
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
  events?: HatEventConfig;
}

export interface Wearer {
  currentHats?: Hat[];
  mintEvent?: HatMintedEvent[];
  burnEvent?: HatBurnedEvent[];
}

export interface WearerConfig {
  currentHats?: HatConfig;
  mintEvent?: HatMintedEventConfig;
  burnEvent?: HatBurnedEventConfig;
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
  events?: TreeEvent[];
}

export interface TreeConfig {
  hats?: HatConfig;
  childOfTree?: TreeConfig;
  parentOfTrees?: TreeConfig;
  linkedToHat?: HatConfig;
  linkRequestFromTree?: TreeConfig;
  requestedLinkToTree?: TreeConfig;
  requestedLinkToHat?: HatConfig;
  events?: TreeEventConfig;
}

export interface HatEvent {
  id: string;
  timestamp?: bigint;
  blockNumber?: number;
  transactionID?: string;
}

export interface HatEventConfig {
  timestamp?: boolean;
  blockNumber?: boolean;
  transactionID?: boolean;
}

export interface TreeEvent extends HatEvent {
  hat?: Hat;
}

export interface TreeEventConfig extends HatEventConfig {
  hat?: HatConfig;
}

export interface HatMintedEvent extends HatEvent {
  hat?: Hat;
}

export interface HatMintedEventConfig extends HatEventConfig {
  hat?: HatConfig;
}

export interface HatBurnedEvent extends HatEvent {
  hat?: Hat;
}

export interface HatBurnedEventConfig extends HatEventConfig {
  hat?: HatConfig;
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
