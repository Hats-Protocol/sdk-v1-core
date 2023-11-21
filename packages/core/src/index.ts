import { HatsClient } from "./clients";
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

export {
  HatsClient,
  hatIdDecimalToHex,
  treeIdDecimalToHex,
  hatIdHexToDecimal,
  treeIdHexToDecimal,
  hatIdDecimalToIp,
  treeIdToTopHatId,
  hatIdToTreeId,
  hatIdIpToDecimal,
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
