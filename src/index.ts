import { HatsClient } from "./client";
import {
  hatIdDecimalToHex,
  treeIdDecimalToHex,
  hatIdHexToDecimal,
  treeIdHexToDecimal,
  hatIdDecimalToIp,
} from "./client/utils";

export {
  HatsClient,
  hatIdDecimalToHex,
  treeIdDecimalToHex,
  hatIdHexToDecimal,
  treeIdHexToDecimal,
  hatIdDecimalToIp,
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
