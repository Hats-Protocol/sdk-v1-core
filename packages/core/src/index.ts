import { HatsClient } from "./client";
import {
  hatIdDecimalToHex,
  treeIdDecimalToHex,
  hatIdHexToDecimal,
  treeIdHexToDecimal,
  hatIdDecimalToIp,
  treeIdToTopHatId,
  hatIdToTreeId,
} from "./utils";

export {
  HatsClient,
  hatIdDecimalToHex,
  treeIdDecimalToHex,
  hatIdHexToDecimal,
  treeIdHexToDecimal,
  hatIdDecimalToIp,
  treeIdToTopHatId,
  hatIdToTreeId,
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
} from "./types";
