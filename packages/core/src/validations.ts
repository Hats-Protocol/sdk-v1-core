import { BaseError, ContractFunctionRevertedError } from "viem";
import {
  ZeroAddressError,
  NotAdminError,
  InvalidAdminError,
  AlreadyWearingError,
  NotActiveError,
  NotEligibleError,
  AllHatsWornError,
  HatNotExistError,
  NotToggleError,
  NotEligibilityError,
  NotWearerError,
  ImmutableHatError,
  StringTooLongError,
  InvalidMaxSupplyError,
  CrossLinkageError,
  CircularLinkageError,
  NotAdminOrWearerError,
  NoLinkageRequestError,
  BatchParamsError,
  MaxLevelReachedError,
  InvalidUnlinkError,
  NotExplicitlyEligibleError,
  HatNotClaimableError,
  HatNotClaimableForError,
} from "./errors";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function getError(err: unknown): never {
  if (err instanceof BaseError) {
    const revertError = err.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? "";
      const errorArgs = revertError.data?.args as any[];
      switch (errorName) {
        case "NotAdmin": {
          throw new NotAdminError(
            `Error: address ${errorArgs[0]} is attempting to perform an action on ${errorArgs[1]} but is not wearing one of its admin hats`
          );
        }
        case "NotHatWearer": {
          throw new NotWearerError(
            `Error: attempting to perform an action as or for an account that is not a wearer of a given hat`
          );
        }
        case "NotAdminOrWearer": {
          throw new NotAdminOrWearerError(
            `Error: attempting to perform an action that requires being either an admin or wearer of a given hat`
          );
        }
        case "AllHatsWorn": {
          throw new AllHatsWornError(
            `Error: attempting to mint ${errorArgs[0]} but its maxSupply has been reached`
          );
        }
        case "MaxLevelsReached": {
          throw new MaxLevelReachedError(
            `Error: attempting to create a hat with a level 14 hat as its admin`
          );
        }
        case "InvalidHatId": {
          throw new InvalidAdminError(
            `Error: provided hat id has empty intermediate level(s)`
          );
        }
        case "AlreadyWearingHat": {
          throw new AlreadyWearingError(
            `Error: attempting to mint hat with ID ${errorArgs[1]} to address ${errorArgs[0]} who is already wearing the hat`
          );
        }
        case "HatDoesNotExist": {
          throw new HatNotExistError(
            `Error: attempting to mint a non-existant hat with ID ${errorArgs[0]}`
          );
        }
        case "HatNotActive": {
          throw new NotActiveError(
            `Error: attempting to mint or transfer a hat that is not active`
          );
        }
        case "NotEligible": {
          throw new NotEligibleError(
            `Error: attempting to mint or transfer a hat to an ineligible wearer`
          );
        }
        case "NotHatsToggle": {
          throw new NotToggleError(
            `Error: attempting to set a hat's status from an account that is not that hat's toggle module`
          );
        }
        case "NotHatsEligibility": {
          throw new NotEligibilityError(
            `Error: attempting to check or set a hat wearer's status from an account that is not that hat's eligibility module`
          );
        }
        case "BatchArrayLengthMismatch": {
          throw new BatchParamsError(
            `Error: array arguments to a batch function have mismatching lengths`
          );
        }
        case "Immutable": {
          throw new ImmutableHatError(
            `Error: attempting to mutate or transfer an immutable hat`
          );
        }
        case "NewMaxSupplyTooLow": {
          throw new InvalidMaxSupplyError(
            `Error: attempting to mutate or transfer an immutable hat`
          );
        }
        case "CircularLinkage": {
          throw new CircularLinkageError(
            `Error: attempting to link a tophat to a new admin for which the tophat serves as an admin`
          );
        }
        case "CrossTreeLinkage": {
          throw new CrossLinkageError(
            `Error: attempting to link or relink a tophat to a separate tree`
          );
        }
        case "LinkageNotRequested": {
          throw new NoLinkageRequestError(
            `Error: attempting to link a tophat without a request`
          );
        }
        case "InvalidUnlink": {
          throw new InvalidUnlinkError(
            `Error: attempting to unlink a tophat that does not have a wearer`
          );
        }
        case "ZeroAddress": {
          throw new ZeroAddressError(
            `Error: attempting to change a hat's eligibility or toggle module to the zero address`
          );
        }
        case "StringTooLong": {
          throw new StringTooLongError(
            `Error: attempting to change a hat's details or imageURI to a string with over 7000 bytes (~characters)`
          );
        }
        case "MultiClaimsHatter_ArrayLengthMismatch": {
          throw new BatchParamsError(
            `Error: array arguments to a batch function have mismatching lengths`
          );
        }
        case "MultiClaimsHatter_NotAdminOfHat": {
          throw new NotAdminError(
            `Error: address ${errorArgs[0]} is attempting to set the claimability of hat ${errorArgs[1]} but is not wearing one of its admin hats`
          );
        }
        case "MultiClaimsHatter_NotExplicitlyEligible": {
          throw new NotExplicitlyEligibleError(
            `Error: address ${errorArgs[0]} is not explicitly eligible for hat ${errorArgs[1]}`
          );
        }
        case "MultiClaimsHatter_HatNotClaimable": {
          throw new HatNotClaimableError(
            `Error: attempting to claim hat ${errorArgs[0]}, which is not claimable`
          );
        }
        case "MultiClaimsHatter_HatNotClaimableFor": {
          throw new HatNotClaimableForError(
            `Error: attempting to claim hat ${errorArgs[0]} on behalf of an account, but the hat is not claimable-for`
          );
        }
        default: {
          throw err;
        }
      }
    }
  } else {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Unexpected error occured");
    }
  }
}
