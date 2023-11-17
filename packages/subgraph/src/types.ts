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

export interface HatPropsConfig {
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
  tree?: TreePropsConfig;
  wearers?: WearersConfig;
  badStandings?: WearersConfig;
  admin?: HatPropsConfig;
  subHats?: HatsConfig;
  linkRequestFromTree?: TreesConfig;
  linkedTrees?: TreesConfig;
  claimableBy?: ClaimsHattersConfig;
  claimableForBy?: ClaimsHattersConfig;
  events?: HatsEventsConfig;
}

export interface HatsConfig {
  props: HatPropsConfig;
  filters?: {
    first?: number;
  };
}

export interface Wearer {
  id: string;
  currentHats?: Hat[];
  mintEvent?: HatsEvent[];
  burnEvent?: HatsEvent[];
}

export interface WearerPropsConfig {
  currentHats?: HatsConfig;
  mintEvent?: HatsEventsConfig;
  burnEvent?: HatsEventsConfig;
}

export interface WearersConfig {
  props: WearerPropsConfig;
  filters?: {
    first?: number;
  };
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

export interface TreePropsConfig {
  hats?: HatsConfig;
  childOfTree?: TreePropsConfig;
  parentOfTrees?: TreesConfig;
  linkedToHat?: HatPropsConfig;
  linkRequestFromTree?: TreesConfig;
  requestedLinkToTree?: TreePropsConfig;
  requestedLinkToHat?: HatPropsConfig;
  events?: HatsEventsConfig;
}

export interface TreesConfig {
  props: TreePropsConfig;
  filters?: {
    first?: number;
  };
}

export interface ClaimsHatter {
  id: string;
  claimableHats?: Hat[];
  claimableForHats?: Hat[];
}

export interface ClaimsHatterPropsConfig {
  claimableHats?: HatsConfig;
  claimableForHats?: HatsConfig;
}

export interface ClaimsHattersConfig {
  props: ClaimsHatterPropsConfig;
  filters?: {
    first?: number;
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

export interface HatsEventPropsConfig {
  timestamp?: boolean;
  blockNumber?: boolean;
  transactionID?: boolean;
  hat?: HatPropsConfig;
  tree?: HatPropsConfig;
}

export interface HatsEventsConfig {
  props: HatsEventPropsConfig;
  filters?: {
    first?: number;
  };
}

export type GqlObjType =
  | "Hat"
  | "Tree"
  | "Wearer"
  | "HatsEvent"
  | "ClaimsHatter";
