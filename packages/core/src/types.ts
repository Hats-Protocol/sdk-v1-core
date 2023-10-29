/* eslint @typescript-eslint/no-empty-interface: 0 */

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

export interface CheckHatStatusResult extends TransactionResult {
  toggled: boolean;
  newStatus?: "active" | "inactive";
}

export interface CheckHatWearerStatusResult extends TransactionResult {
  wearerStandingUpdated: boolean;
  hatBurned: boolean;
  newWearerStanding?: "good" | "bad";
}

export interface RequestLinkTopHatToTreeResult extends TransactionResult {}

export interface ApproveLinkTopHatToTreeResult extends TransactionResult {}

export interface UnlinkTopHatFromTreeResult extends TransactionResult {}

export interface RelinkTopHatWithinTreeResult extends TransactionResult {}

export interface MultiCallResult extends TransactionResult {
  gasUsed: bigint;
  hatsCreated: bigint[];
  hatsMinted: {
    hatId: bigint;
    wearer: `0x${string}`;
  }[];
  hatsBurned: {
    hatId: bigint;
    wearer: `0x${string}`;
  }[];
  hatStatusChanges: {
    hatId: bigint;
    newStatus: "active" | "inactive";
  }[];
  wearerStandingChanges: {
    hatId: bigint;
    wearer: `0x${string}`;
    newStanding: "good" | "bad";
  }[];
}

export interface SubgraphGetAllTreeResult {
  tree: {
    hats: {
      id: string;
      details: string;
      maxSupply: number;
      imageUri: string;
      currentSupply: number;
      levelAtLocalTree: number;
      eligibility: `0x${string}`;
      toggle: `0x${string}`;
      mutable: boolean;
      createdAt: string | null;
      wearers: {
        id: `0x${string}`;
      }[];
      admin: {
        id: string;
      };
    }[];
    childOfTree: {
      id: string;
    } | null;
    linkedToHat: {
      id: `0x${string}`;
    } | null;
    parentOfTrees: {
      id: string;
    }[];
  };
}
