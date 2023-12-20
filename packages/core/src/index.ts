import { HatsClient } from "./clients";
import { HATS_ABI } from "./abi/Hats";
import {
  hatIdDecimalToHex,
  treeIdDecimalToHex,
  hatIdHexToDecimal,
  treeIdHexToDecimal,
  hatIdDecimalToIp,
  treeIdToTopHatId,
  hatIdToTreeId,
  hatIdIpToDecimal,
} from "./utils";
import {
  HATS_V1,
  MAX_LEVELS,
  MAX_LEVEL_HATS,
  ZERO_ID,
  FALLBACK_ADDRESS,
} from "./constants";

export {
  HatsClient,
  HATS_ABI,
  hatIdDecimalToHex,
  treeIdDecimalToHex,
  hatIdHexToDecimal,
  treeIdHexToDecimal,
  hatIdDecimalToIp,
  treeIdToTopHatId,
  hatIdToTreeId,
  hatIdIpToDecimal,
  HATS_V1,
  MAX_LEVELS,
  MAX_LEVEL_HATS,
  ZERO_ID,
  FALLBACK_ADDRESS,
};

export type {
  CreateHatResult,
  MintTopHatResult,
  BatchCreateHatsResult,
  MintHatResult,
  RenounceHatResult,
  ChangeHatDetailsResult,
  ChangeHatEligibilityResult,
  ChangeHatToggleResult,
  ChangeHatImageURIResult,
  ChangeHatMaxSupplyResult,
  MakeHatImmutableResult,
  BatchMintHatsResult,
  SetHatStatusResult,
  TransferHatResult,
  SetHatWearerStatusResult,
  CheckHatStatusResult,
  CheckHatWearerStatusResult,
  RequestLinkTopHatToTreeResult,
  ApproveLinkTopHatToTreeResult,
  UnlinkTopHatFromTreeResult,
  RelinkTopHatWithinTreeResult,
  ClaimResult,
  MultiCallResult,
} from "./types";
