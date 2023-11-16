export interface Hat {
  id: string;
  prettyId?: string;
  status?: boolean;
  createdAt?: string | null;
  details?: string;
  maxSupply?: string;
  eligibility?: string;
  toggle?: string;
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
  id: string;
  hats?: Hat[];
  childOfTree?: Tree | null;
  parentOfTrees?: Tree[];
  linkedToHat?: Hat | null;
  linkRequestFromTree?: Tree[];
  requestedLinkToTree?: Tree | null;
  requestedLinkToHat?: Hat | null;
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

export interface HatsEventBase {
  id: string;
  timestamp?: string;
  blockNumber?: number;
  transactionID?: string;
  hat?: Hat;
  tree?: Tree;
}

export interface HatCreatedEvent extends HatsEventBase {
  __typename: "HatCreatedEvent";
  hatDetails: string;
  hatMaxSupply: string;
  hatEligibility: string;
  hatToggle: string;
  hatMutable: boolean;
  hatImageUri: string;
}

export interface HatMintedEvent extends HatsEventBase {
  __typename: "HatMintedEvent";
  wearer: {
    id: string;
  };
  operator: string;
}

export interface HatBurnedEvent extends HatsEventBase {
  __typename: "HatBurnedEvent";
  wearer: {
    id: string;
  };
  operator: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HatMutabilityChangedEvent extends HatsEventBase {
  __typename: "HatMutabilityChangedEvent";
}

export interface HatStatusChangedEvent extends HatsEventBase {
  __typename: "HatStatusChangedEvent";
  hatNewStatus: boolean;
}

export interface HatDetailsChangedEvent extends HatsEventBase {
  __typename: "HatDetailsChangedEvent";
  hatNewDetails: string;
}

export interface HatEligibilityChangedEvent extends HatsEventBase {
  __typename: "HatEligibilityChangedEvent";
  hatNewEligibility: string;
}

export interface HatToggleChangedEvent extends HatsEventBase {
  __typename: "HatToggleChangedEvent";
  hatNewToggle: string;
}

export interface HatMaxSupplyChangedEvent extends HatsEventBase {
  __typename: "HatMaxSupplyChangedEvent";
  hatNewMaxSupply: string;
}

export interface HatImageURIChangedEvent extends HatsEventBase {
  __typename: "HatImageURIChangedEvent";
  hatNewImageURI: string;
}

export interface TopHatLinkRequestedEvent extends HatsEventBase {
  __typename: "TopHatLinkRequestedEvent";
  newAdmin: string;
}

export interface TopHatLinkedEvent extends HatsEventBase {
  __typename: "TopHatLinkedEvent";
  newAdmin: string;
}

export interface WearerStandingChangedEvent extends HatsEventBase {
  __typename: "WearerStandingChangedEvent";
  wearer: {
    id: string;
  };
  wearerStanding: boolean;
}

export type HatsEvent =
  | HatCreatedEvent
  | HatMintedEvent
  | HatBurnedEvent
  | HatMutabilityChangedEvent
  | HatStatusChangedEvent
  | HatDetailsChangedEvent
  | HatEligibilityChangedEvent
  | HatToggleChangedEvent
  | HatMaxSupplyChangedEvent
  | HatImageURIChangedEvent
  | TopHatLinkRequestedEvent
  | TopHatLinkedEvent
  | WearerStandingChangedEvent;

export interface HatsEventConfig {
  timestamp?: boolean;
  blockNumber?: boolean;
  transactionID?: boolean;
  hat?: HatConfig;
  tree?: TreeConfig;
}

export type GqlObjType =
  | "Hat"
  | "Tree"
  | "Wearer"
  | "HatsEvent"
  | "ClaimsHatter";
