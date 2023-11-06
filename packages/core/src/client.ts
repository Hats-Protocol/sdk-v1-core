import { decodeEventLog, encodeEventTopics } from "viem";

import { HATS_ABI } from "./abi/Hats";
import {
  ChainIdMismatchError,
  MissingPublicClientError,
  MissingWalletClientError,
  MaxLevelReachedError,
  MaxHatsInLevelReached,
} from "./errors";
import { HATS_V1, MAX_LEVEL_HATS, MAX_LEVELS, ZERO_ADDRESS } from "./constants";
import { getError } from "./validations";
import { HatsCallDataClient } from "./calldata";
import type { PublicClient, WalletClient, Account, Address, Hex } from "viem";
import type {
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
  MultiCallResult,
} from "./types";

export class HatsClient extends HatsCallDataClient {
  private readonly _walletClient: WalletClient | undefined;

  /**
   * Initialize a HatsClient.
   *
   * @param chainId - Client chain ID. The client is initialized to work with one specific chain.
   * @param publicClient - Viem Public Client
   * @param walletClient - Optional Viem Wallet Client. If not provided, then only read operations will be possible.
   * @returns A HatsClient instance.
   *
   * @throws MissingPublicClientError
   * Thrown when a public client is not provided.
   *
   * @throws ChainIdMismatchError
   * Thrown when there is a chain ID mismatch between one of the Viem clients and/or the provided chain ID.
   */
  constructor({
    chainId,
    publicClient,
    walletClient,
  }: {
    chainId: number;
    publicClient: PublicClient;
    walletClient?: WalletClient;
  }) {
    super({ chainId, publicClient });
    if (publicClient === undefined) {
      throw new MissingPublicClientError("Public client is required");
    }

    if (publicClient.chain?.id !== chainId) {
      throw new ChainIdMismatchError(
        "Provided chain id should match the public client chain id"
      );
    }

    if (walletClient !== undefined && walletClient.chain?.id !== chainId) {
      throw new ChainIdMismatchError(
        "Provided chain id should match the wallet client chain id"
      );
    }

    this._walletClient = walletClient;
  }

  /*//////////////////////////////////////////////////////////////
                        Onchain Read Functions
      //////////////////////////////////////////////////////////////*/

  /**
   * Get a hat's properties.
   *
   * @param hatId - The hat ID.
   * @returns An object containing the hat's properties.
   */
  async viewHat(hatId: bigint): Promise<{
    details: string;
    maxSupply: number;
    supply: number;
    eligibility: Address;
    toggle: Address;
    imageUri: string;
    numChildren: number;
    mutable: boolean;
    active: boolean;
  }> {
    const result = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "viewHat",
      args: [BigInt(hatId)],
    });

    return {
      details: result[0],
      maxSupply: result[1],
      supply: result[2],
      eligibility: result[3],
      toggle: result[4],
      imageUri: result[5],
      numChildren: result[6],
      mutable: result[7],
      active: result[8],
    };
  }

  /**
   * Check if an address is a wearer of a specific hat.
   *
   * @param wearer - Address to check.
   * @param hatId - The hat ID.
   * @returns True if the address weares the hat, false otherwise.
   */
  async isWearerOfHat({
    wearer,
    hatId,
  }: {
    wearer: Address;
    hatId: bigint;
  }): Promise<boolean> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "isWearerOfHat",
      args: [wearer, hatId],
    });

    return res;
  }

  /**
   * Check if an address is an admin of a specific hat.
   *
   * @param user - The address to check.
   * @param hatId - The hat ID.
   * @returns True is the address is an admin of the hat, false otherwise.
   */
  async isAdminOfHat({
    user,
    hatId,
  }: {
    user: Address;
    hatId: bigint;
  }): Promise<boolean> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "isAdminOfHat",
      args: [user, hatId],
    });

    return res;
  }

  /**
   * Check if a hat is active.
   *
   * @param hatId - The hat ID.
   * @returns True if active, false otherwise.
   */
  async isActive(hatId: bigint): Promise<boolean> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "isActive",
      args: [hatId],
    });

    return res;
  }

  /**
   * Check if a wearer is in good standing.
   *
   * @param wearer - The address of the wearer.
   * @param hatID - The hat ID.
   * @returns True if the wearer is in good standing, false otherwise.
   */
  async isInGoodStanding({
    wearer,
    hatId,
  }: {
    wearer: Address;
    hatId: bigint;
  }): Promise<boolean> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "isInGoodStanding",
      args: [wearer, hatId],
    });

    return res;
  }

  /**
   * Check if an address is eligible for a specific hat.
   *
   * @param wearer - The Address to check.
   * @param hatId - THe hat ID.
   * @returns True if eligible, false otherwise.
   */
  async isEligible({
    wearer,
    hatId,
  }: {
    wearer: Address;
    hatId: bigint;
  }): Promise<boolean> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "isEligible",
      args: [wearer, hatId],
    });

    return res;
  }

  async predictNextChildrenHatIDs({
    admin,
    numChildren,
  }: {
    admin: bigint;
    numChildren: number;
  }): Promise<bigint[]> {
    const res: bigint[] = [];
    if (numChildren < 1) {
      return res;
    }

    const adminHat = await this.viewHat(admin);
    if (adminHat.numChildren + numChildren > MAX_LEVEL_HATS) {
      throw new MaxHatsInLevelReached(
        "Maximum amount of hats per level is 65535"
      );
    }

    const level = await this.getLocalHatLevel(admin);
    if (level === MAX_LEVELS) {
      throw new MaxLevelReachedError(
        "The provided admin's hat level is on the maximal level"
      );
    }

    const contractDetails = {
      address: HATS_V1 as Address,
      abi: HATS_ABI,
    };

    const calls = [];
    for (let i = 0; i < numChildren; i++) {
      calls.push({
        ...contractDetails,
        functionName: "buildHatId",
        args: [admin, adminHat.numChildren + i + 1],
      });
    }
    const childHats = await this._publicClient.multicall({
      contracts: calls,
    });
    childHats.forEach((hat) => {
      if (hat.result !== undefined) {
        res.push(hat.result as bigint);
      }
    });

    return res;
  }

  /**
   * Get the number of trees.
   *
   * @returns The number of already created trees.
   */
  async getTreesCount(): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "lastTopHatId",
    });

    return res;
  }

  /**
   * Get the linkage request of a tree.
   *
   * @param topHatDomain - The tree domain. The tree domain is the first four bytes of the tophat ID.
   * @returns If request exists, returns the requested new admin hat ID. If not, returns zero.
   */
  async getLinkageRequest(topHatDomain: number): Promise<bigint> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "linkedTreeRequests",
      args: [topHatDomain],
    });

    return res;
  }

  /**
   * Get the admin of a linked tree.
   *
   * @param topHatDomain - The tree domain. The tree domain is the first four bytes of the tophat ID.
   * @returns If tree is linked, returns the admin hat ID of the linked tree. If not, returns zero.
   */
  async getLinkedTreeAdmin(topHatDomain: number): Promise<bigint> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "linkedTreeAdmins",
      args: [topHatDomain],
    });

    return res;
  }

  /**
   * Get a hat's level. If the tree is linked, level is calulated in the global tree (formed of all linked trees).
   * @param hatId - The hat ID.
   * @returns The hat's level in the global tree.
   */
  async getHatLevel(hatId: bigint): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getHatLevel",
      args: [hatId],
    });

    return res;
  }

  /**
   * Get a hat's level in its local tree (without considering linked trees).
   * @param hatId - The hat ID.
   * @returns The hat's local level.
   */
  async getLocalHatLevel(hatId: bigint): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getLocalHatLevel",
      args: [hatId],
    });

    return res;
  }

  /**
   * Get a hat's tree domain.
   *
   * @param hatId - The hat ID.
   * @returns The tree domain of the hat. The tree domain is the first four bytes of the tophat ID.
   */
  async getTopHatDomain(hatId: bigint): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getTopHatDomain",
      args: [hatId],
    });

    return res;
  }

  /**
   * Get the tree domain of the global's tree tophat (tippy top hat), which the provided tree is included in.
   *
   * @param topHatDomain The tree domain. The tree domain is the first four bytes of the tophat ID.
   * @returns The tree domain of the tippy top hat.
   */
  async getTippyTopHatDomain(topHatDomain: number): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getTippyTopHatDomain",
      args: [topHatDomain],
    });

    return res;
  }

  /**
   * Get the direct admin of a hat (its parent).
   * @param hatId- The hat ID.
   * @returns The admin's hat ID. If the provided hat is an unlinked tophat, then this top hat is returned, as it is
   * the admin of itself.
   */
  async getAdmin(hatId: bigint): Promise<bigint> {
    const hatLevel = await this.getHatLevel(hatId);
    if (hatLevel === 0) {
      return hatId;
    }

    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getAdminAtLevel",
      args: [hatId, hatLevel - 1],
    });

    return res;
  }

  /**
   * Get the children hats of a hat.
   *
   * @param hatId - The hat ID.
   * @returns An array of all children hats IDs.
   */
  async getChildrenHats(hatId: bigint): Promise<bigint[]> {
    const res: bigint[] = [];
    const hat = await this.viewHat(hatId);

    if (hat.numChildren === 0) {
      return res;
    }

    for (let i = 0; i < hat.numChildren; i++) {
      const childHatId = await this._publicClient.readContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "buildHatId",
        args: [hatId, i + 1],
      });
      res.push(childHatId);
    }

    return res;
  }

  /*//////////////////////////////////////////////////////////////
                        Write Functions
      //////////////////////////////////////////////////////////////*/

  /**
   * Create a new tophat (new tree).
   *
   * @param account - A Viem account.
   * @param target - Tophat's wearer address.
   * @param details - Tophat's details field.
   * @param imageURI - Optional tophat's image URI.
   * @returns An object containing the status of the call, the transactions hash and the created tophat ID.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   */
  async mintTopHat({
    account,
    target,
    details,
    imageURI,
  }: {
    account: Account | Address;
    target: Address;
    details: string;
    imageURI?: string;
  }): Promise<MintTopHatResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    const hash = await this._walletClient.writeContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "mintTopHat",
      args: [target, details, imageURI === undefined ? "" : imageURI],
      account,
      chain: this._walletClient.chain,
    });

    const receipt = await this._publicClient.waitForTransactionReceipt({
      hash,
    });

    const event = decodeEventLog({
      abi: HATS_ABI,
      eventName: "HatCreated",
      data: receipt.logs[0].data,
      topics: receipt.logs[0].topics,
    });

    return {
      status: receipt.status,
      transactionHash: receipt.transactionHash,
      hatId: event.args.id,
    };
  }

  /**
   * Create a hat.
   *
   * @param account - A Viem account.
   * @param admin - Hat's admin ID.
   * @param details - Hat's details field.
   * @param maxSupply - Hat's maximum amount of wearers.
   * @param eligibility - Hat's eligibility address (zero address is not valid).
   * @param toggle - Hat's toggle address (zero address is not valid).
   * @param mutable - True if the hat should be mutable, false otherwise.
   * @param imageURI - Optional hat's image URI.
   * @returns An object containing the status of the call, the transaction hash and the created hat ID.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws ZeroAddressError
   * Thrown if provided the zero address as an eligibility or toggle.
   *
   * @throws InvalidAdminError
   * Thrown if the provided admin ID is not valid.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the hat that will be created.
   */
  async createHat({
    account,
    admin,
    details,
    maxSupply,
    eligibility,
    toggle,
    mutable,
    imageURI,
  }: {
    account: Account | Address;
    admin: bigint;
    details: string;
    maxSupply: number;
    eligibility: Address;
    toggle: Address;
    mutable: boolean;
    imageURI?: string;
  }): Promise<CreateHatResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "createHat",
        args: [
          BigInt(admin),
          details,
          maxSupply,
          eligibility,
          toggle,
          mutable,
          imageURI === undefined ? "" : imageURI,
        ],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      const event = decodeEventLog({
        abi: HATS_ABI,
        eventName: "HatCreated",
        data: receipt.logs[0].data,
        topics: receipt.logs[0].topics,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        hatId: event.args.id,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Create multiple hats.
   *
   * @param account - A Viem account.
   * @param admins - The hats admin IDs.
   * @param details - The hats details fields.
   * @param maxSupplies - The hats maximum amounts of wearers.
   * @param eligibilityModules - The hats eligibility addresses (zero address is not valid).
   * @param toggleModules - The hats toggle addresses (zero address is not valid).
   * @param mutables - True if the hat should be mutable, false otherwise.
   * @param imageURIs - Optional hats image URIs.
   * @returns An object containing the status of the call, the transaction hash and the created hat IDs.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws ZeroAddressError
   * Thrown if provided the zero address as an eligibility or toggle.
   *
   * @throws InvalidAdminError
   * Thrown if the provided admin ID is not valid.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the hat that will be created.
   *
   * @throws BatchParamsError
   * Thrown if there is a length mismatch between the provided hats properties.
   */
  async batchCreateHats({
    account,
    admins,
    details,
    maxSupplies,
    eligibilityModules,
    toggleModules,
    mutables,
    imageURIs,
  }: {
    account: Account | Address;
    admins: bigint[];
    details: string[];
    maxSupplies: number[];
    eligibilityModules: Address[];
    toggleModules: Address[];
    mutables: boolean[];
    imageURIs?: string[];
  }): Promise<BatchCreateHatsResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "batchCreateHats",
        args: [
          admins,
          details,
          maxSupplies,
          eligibilityModules,
          toggleModules,
          mutables,
          imageURIs === undefined ? Array(admins.length).fill("") : imageURIs,
        ],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      const newHatIds: bigint[] = [];

      for (let i = 0; i < admins.length; i++) {
        const event = decodeEventLog({
          abi: HATS_ABI,
          eventName: "HatCreated",
          data: receipt.logs[i].data,
          topics: receipt.logs[i].topics,
        });

        newHatIds.push(event.args.id);
      }

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        hatIds: newHatIds,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Mint a hat.
   *
   * @param account - A Viem account.
   * @param hatId - ID of the minted hat.
   * @param wearer - Address of the new wearer.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of hat.
   *
   * @throws HatNotExistError
   * Thrown if the hat does not exist.
   *
   * @throws AllHatsWornError
   * Thrown if all the hats of the provided hat ID are currently worn.
   *
   * @throws NotEligibleError
   * Thrown if the new wearer is not eligible for the hat.
   *
   * @throws NotActiveError
   * Thrown if the hat is not active.
   *
   * @throws AlreadyWearingError
   * Thrown if the new wearer is already wearing the hat.
   *
   */
  async mintHat({
    account,
    hatId,
    wearer,
  }: {
    account: Account | Address;
    hatId: bigint;
    wearer: Address;
  }): Promise<MintHatResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "mintHat",
        args: [hatId, wearer],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Mint multiple hats.
   *
   * @param account - A Viem account.
   * @param hatIds - IDs of the minted hats.
   * @param wearers - Addresses of the new wearers.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of hat.
   *
   * @throws HatNotExistError
   * Thrown if the hat does not exist.
   *
   * @throws AllHatsWornError
   * Thrown if all the hats of the provided hat ID are currently worn.
   *
   * @throws NotEligibleError
   * Thrown if the new wearer is not eligible for the hat.
   *
   * @throws NotActiveError
   * Thrown if the hat is not active.
   *
   * @throws AlreadyWearingError
   * Thrown if the new wearer is already wearing the hat.
   *
   * @throws BatchParamsError
   * Thrown if there is a length mismatch between the provided properties.
   */
  async batchMintHats({
    account,
    hatIds,
    wearers,
  }: {
    account: Account | Address;
    hatIds: bigint[];
    wearers: Address[];
  }): Promise<BatchMintHatsResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "batchMintHats",
        args: [hatIds, wearers],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Set a hat's status to active/inactive.
   *
   * @param account - A Viem account.
   * @param hatId - hat ID.
   * @param newStatus - Hat's new status: true for active, false for inactive.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotToggleError
   * Thrown if the calling account is not the toggle of the hat.
   */
  async setHatStatus({
    account,
    hatId,
    newStatus,
  }: {
    account: Account | Address;
    hatId: bigint;
    newStatus: boolean;
  }): Promise<SetHatStatusResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "setHatStatus",
        args: [hatId, newStatus],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Check a hat's status by calling its toggle module, and updating the status as needed.
   *
   * @param account - A Viem account.
   * @param hatId - Hat Id.
   * @returns An object containing the status of the call, the transaction hash, an indicator whether the status was
   * toggled and the new status in case the status was toggled.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   */
  async checkHatStatus({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }): Promise<CheckHatStatusResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "checkHatStatus",
        args: [hatId],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      if (receipt.logs.length === 0) {
        return {
          status: receipt.status,
          transactionHash: receipt.transactionHash,
          toggled: false,
        };
      } else {
        const event = decodeEventLog({
          abi: HATS_ABI,
          eventName: "HatStatusChanged",
          data: receipt.logs[0].data,
          topics: receipt.logs[0].topics,
        });
        return {
          status: receipt.status,
          transactionHash: receipt.transactionHash,
          toggled: true,
          newStatus: event.args.newStatus ? "active" : "inactive",
        };
      }
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Set a hat's wearer status.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID.
   * @param wearer - Wearer address.
   * @param eligible - Wearer's eligibility. True for eligible, false otherwise.
   * @param standing - Wearer's standing. True for good, false for bad.
   * @returns An object containing the status of the call and the transaction hash
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotEligibilityError
   * Thrown if the calling account is not the eligibility of the hat.
   */
  async setHatWearerStatus({
    account,
    hatId,
    wearer,
    eligible,
    standing,
  }: {
    account: Account | Address;
    hatId: bigint;
    wearer: Address;
    eligible: boolean;
    standing: boolean;
  }): Promise<SetHatWearerStatusResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "setHatWearerStatus",
        args: [hatId, wearer, eligible, standing],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Check a hat's wearer status by calling the hat's eligibilty module.
   * If the wearer is in non eligible and/or in bad standing, then its hat is burned.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID.
   * @param wearer - Wearer address.
   * @returns An object containing the status of the call, the transaction hash, indicator whether the wearer's standing
   * was updated, indicator whether the wearer's hat was burned and if standing has changed then the new standing.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   */
  async checkHatWearerStatus({
    account,
    hatId,
    wearer,
  }: {
    account: Account | Address;
    hatId: bigint;
    wearer: Address;
  }): Promise<CheckHatWearerStatusResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "checkHatWearerStatus",
        args: [hatId, wearer],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      if (receipt.logs.length === 0) {
        return {
          status: receipt.status,
          transactionHash: receipt.transactionHash,
          wearerStandingUpdated: false,
          hatBurned: false,
        };
      } else if (receipt.logs.length === 1) {
        const burnEventTopic = encodeEventTopics({
          abi: HATS_ABI,
          eventName: "TransferSingle",
        });
        const wearerStandingChangedTopic = encodeEventTopics({
          abi: HATS_ABI,
          eventName: "WearerStandingChanged",
        });

        if (receipt.logs[0].topics[0] === burnEventTopic[0]) {
          return {
            status: receipt.status,
            transactionHash: receipt.transactionHash,
            wearerStandingUpdated: false,
            hatBurned: true,
          };
        } else if (
          receipt.logs[0].topics[0] === wearerStandingChangedTopic[0]
        ) {
          const event = decodeEventLog({
            abi: HATS_ABI,
            eventName: "WearerStandingChanged",
            data: receipt.logs[0].data,
            topics: receipt.logs[0].topics,
          });
          return {
            status: receipt.status,
            transactionHash: receipt.transactionHash,
            wearerStandingUpdated: true,
            hatBurned: false,
            newWearerStanding: event.args.wearerStanding ? "good" : "bad",
          };
        } else {
          throw new Error("Unexpected error");
        }
      } else {
        const wearerStandingChangedEvent = decodeEventLog({
          abi: HATS_ABI,
          eventName: "WearerStandingChanged",
          data: receipt.logs[1].data,
          topics: receipt.logs[1].topics,
        });

        return {
          status: receipt.status,
          transactionHash: receipt.transactionHash,
          wearerStandingUpdated: true,
          hatBurned: true,
          newWearerStanding: wearerStandingChangedEvent.args.wearerStanding
            ? "good"
            : "bad",
        };
      }
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Renounce a hat. This action burns the hat for the renouncing wearer.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID of the hat the caller wishes to renounce.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   */
  async renounceHat({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }): Promise<RenounceHatResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "renounceHat",
        args: [hatId],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Transfer a hat from one wearer to another.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID to be transfered.
   * @param from - Current wearer address.
   * @param to - New wearer address.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws ImmutableHatError
   * Thrown if the hat is immutable. Immutable hats cannot be transfered.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the hat.
   *
   * @throws NotEligibleError
   * Thrown if the new wearer is not eligible for the hat.
   *
   * @throws NotActiveError
   * Thrown if the hat is not active.
   *
   * @throws NotWearerError
   * Thrown if the provided current wearer is not wearing the hat.
   *
   * @throws AlreadyWearingError
   * Thrown if the new wearer is already wearing the hat.
   */
  async transferHat({
    account,
    hatId,
    from,
    to,
  }: {
    account: Account | Address;
    hatId: bigint;
    from: Address;
    to: Address;
  }): Promise<TransferHatResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "transferHat",
        args: [hatId, from, to],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Make a hat immutable.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the hat.
   *
   * @throws ImmutableHatError
   * Thrown if the hat is immutable. Immutable hats cannot be edited.
   */
  async makeHatImmutable({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }): Promise<MakeHatImmutableResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "makeHatImmutable",
        args: [hatId],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Change a hat's details.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID.
   * @param newDetails - The new details.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the hat.
   *
   * @throws ImmutableHatError
   * Thrown if the hat is immutable.
   *
   * @throws StringTooLongError
   * Thrown if the new details length is larger than 7000.
   */
  async changeHatDetails({
    account,
    hatId,
    newDetails,
  }: {
    account: Account | Address;
    hatId: bigint;
    newDetails: string;
  }): Promise<ChangeHatDetailsResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatDetails",
        args: [hatId, newDetails],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Change a hat's eligibility.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID.
   * @param newEligibility - The new eligibility address. Zero address is not valid.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the hat.
   *
   * @throws ImmutableHatError
   * Thrown if the hat is immutable.
   *
   * @throws ZeroAddressError
   * Thrown if the new eligibilty is the zero address.
   */
  async changeHatEligibility({
    account,
    hatId,
    newEligibility,
  }: {
    account: Account | Address;
    hatId: bigint;
    newEligibility: Address;
  }): Promise<ChangeHatEligibilityResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatEligibility",
        args: [hatId, newEligibility],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Change a hat's toggle.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID.
   * @param newToggle - The new toggle address. Zero address is not valid.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the hat.
   *
   * @throws ImmutableHatError
   * Thrown if the hat is immutable.
   *
   * @throws ZeroAddressError
   * Thrown if the new toggle is the zero address.
   */
  async changeHatToggle({
    account,
    hatId,
    newToggle,
  }: {
    account: Account | Address;
    hatId: bigint;
    newToggle: Address;
  }): Promise<ChangeHatToggleResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatToggle",
        args: [hatId, newToggle],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Change a hat's image URI.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID.
   * @param newImageURI - The new image URI.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the hat.
   *
   * @throws ImmutableHatError
   * Thrown if the hat is immutable.
   *
   * @throws StringTooLongError
   * Thrown if the new image URI length is larger than 7000.
   */
  async changeHatImageURI({
    account,
    hatId,
    newImageURI,
  }: {
    account: Account | Address;
    hatId: bigint;
    newImageURI: string;
  }): Promise<ChangeHatImageURIResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatImageURI",
        args: [hatId, newImageURI],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Change a hat's max supply.
   *
   * @param account - A Viem account.
   * @param hatId - Hat ID.
   * @param newMaxSupply -New maximum supply for the hat.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the hat.
   *
   * @throws ImmutableHatError
   * Thrown if the hat is immutable.
   *
   * @throws InvalidMaxSupplyError
   * Thrown if the new maximum supply is smaller the current amount of wearers.
   */
  async changeHatMaxSupply({
    account,
    hatId,
    newMaxSupply,
  }: {
    account: Account | Address;
    hatId: bigint;
    newMaxSupply: number;
  }): Promise<ChangeHatMaxSupplyResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatMaxSupply",
        args: [hatId, newMaxSupply],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Request a link from a tophat to a new admin hat.
   *
   * @param account - A Viem account.
   * @param topHatDomain - The tree domain of the requesting tree. The tree domain is the first four bytes of the tophat ID.
   * @param requestedAdminHat - ID of the requested new admin hat.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the tophat.
   */
  async requestLinkTopHatToTree({
    account,
    topHatDomain,
    requestedAdminHat,
  }: {
    account: Account | Address;
    topHatDomain: number;
    requestedAdminHat: bigint;
  }): Promise<RequestLinkTopHatToTreeResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "requestLinkTopHatToTree",
        args: [topHatDomain, requestedAdminHat],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Approve a tophat's linkage request.
   *
   * @param account - A Viem account.
   * @param topHatDomain - The tree domain of the requesting tree. The tree domain is the first four bytes of the tophat ID.
   * @param newAdminHat - ID of the new admin hat.
   * @param newEligibility - Optional new eligibility for the linked tophat.
   * @param newToggle - Optional new toggle for the linked tophat.
   * @param newDetails - Optional new details for the linked tophat.
   * @param newImageURI - Optional new image URI for the linked tophat.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NoLinkageRequestError
   * Thrown if the tophat has not requested the link.
   *
   * @throws NotAdminOrWearerError
   * Thrown if the calling account is not an admin or a wearer of the new admin hat.
   *
   * @throws CircularLinkageError
   * Thrown if linking the trees creates a circular linkage.
   *
   * @throws CrossLinkageError
   * Thrown if the new admin hat is in a different global tree than the current global
   * tree of the tophat that is being linked or if the calling account has no permission
   * to relink to the new destination within the same global tree.
   *
   * @throws StringTooLongErrorError
   * Thrown if a new details or new image URI were provided and either length is greater
   * than 7000.
   */
  async approveLinkTopHatToTree({
    account,
    topHatDomain,
    newAdminHat,
    newEligibility,
    newToggle,
    newDetails,
    newImageURI,
  }: {
    account: Account | Address;
    topHatDomain: number;
    newAdminHat: bigint;
    newEligibility?: Address;
    newToggle?: Address;
    newDetails?: string;
    newImageURI?: string;
  }): Promise<ApproveLinkTopHatToTreeResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "approveLinkTopHatToTree",
        args: [
          topHatDomain,
          newAdminHat,
          newEligibility === undefined ? ZERO_ADDRESS : newEligibility,
          newToggle === undefined ? ZERO_ADDRESS : newToggle,
          newDetails === undefined ? "" : newDetails,
          newImageURI === undefined ? "" : newImageURI,
        ],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Unlink a tree.
   *
   * @param account - A Viem account.
   * @param topHatDomain - The tree domain of the requesting tree. The tree domain is the first four bytes of the tophat ID.
   * @param wearer - The current wearer of the tophat that is about to be unlinked.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * @throws NotWearerError
   * Thrown if provided wearer is not the wearer of the tophat.
   *
   * @throws NotAdminError
   * Thrown if the calling account is not an admin of the tophat.
   */
  async unlinkTopHatFromTree({
    account,
    topHatDomain,
    wearer,
  }: {
    account: Account | Address;
    topHatDomain: number;
    wearer: Address;
  }): Promise<UnlinkTopHatFromTreeResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "unlinkTopHatFromTree",
        args: [topHatDomain, wearer],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Relink a tree within the same global tree that it is already part of.
   *
   * @param account - A Viem account.
   * @param topHatDomain - The tree domain of the requesting tree. The tree domain is the first four bytes of the tophat ID.
   * @param newAdminHat - ID of the new admin hat.
   * @param newEligibility - Optional new eligibility for the linked tophat.
   * @param newToggle - Optional new toggle for the linked tophat.
   * @param newDetails - Optional new details for the linked tophat.
   * @param newImageURI - Optional new image URI for the linked tophat.
   * @returns An object containing the status of the call and the transaction hash.
   *
   * @throws MissingWalletClientError
   * Thrown if no wallet client was provided in the hats client initialization.
   *
   * * @throws NotAdminError
   * Thrown if the calling account is not an admin of the tophat that is about to be relinked.
   *
   * @throws NotAdminOrWearerError
   * Thrown if the calling account is not an admin or a wearer of the new admin hat.
   *
   * @throws CircularLinkageError
   * Thrown if linking the trees creates a circular linkage.
   *
   * @throws CrossLinkageError
   * Thrown if the new admin hat is in a different global tree than the current global
   * tree of the tophat that is being linked or if the calling account has no permission
   * to relink to the new destination within the same global tree.
   *
   * * @throws StringTooLongErrorError
   * Thrown if a new details or new image URI were provided and either length is greater
   * than 7000.
   */
  async relinkTopHatWithinTree({
    account,
    topHatDomain,
    newAdminHat,
    newEligibility,
    newToggle,
    newDetails,
    newImageURI,
  }: {
    account: Account | Address;
    topHatDomain: number;
    newAdminHat: bigint;
    newEligibility?: Address;
    newToggle?: Address;
    newDetails?: string;
    newImageURI?: string;
  }): Promise<RelinkTopHatWithinTreeResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "relinkTopHatWithinTree",
        args: [
          topHatDomain,
          newAdminHat,
          newEligibility === undefined ? ZERO_ADDRESS : newEligibility,
          newToggle === undefined ? ZERO_ADDRESS : newToggle,
          newDetails === undefined ? "" : newDetails,
          newImageURI === undefined ? "" : newImageURI,
        ],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getError(err);
    }
  }

  /**
   * Batch multiple operations
   *
   * @param account - A Viem account.
   * @param calls - Array of call objects, containing the call data and the function name
   * @returns An object containing newly created, minted or burned hats and hat/wearer status changes as a result of the multicall
   *
   * @throws MultiCallError
   * Thrown if the multicall simulation reverted.
   */
  async multicall({
    account,
    calls,
  }: {
    account: Account | Address;
    calls: {
      functionName: string;
      callData: Hex;
    }[];
  }): Promise<MultiCallResult> {
    if (this._walletClient === undefined) {
      throw new MissingWalletClientError(
        "Wallet client is required to perform this action"
      );
    }

    try {
      const callDatas = calls.map((call) => call.callData);

      const { request } = await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "multicall",
        args: [callDatas],
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      const hatsCreated: bigint[] = [];
      const hatsMinted: {
        hatId: bigint;
        wearer: `0x${string}`;
      }[] = [];
      const hatsBurned: {
        hatId: bigint;
        wearer: `0x${string}`;
      }[] = [];
      const hatStatusChanges: {
        hatId: bigint;
        newStatus: "active" | "inactive";
      }[] = [];
      const wearerStandingChanges: {
        hatId: bigint;
        wearer: `0x${string}`;
        newStanding: "good" | "bad";
      }[] = [];

      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        try {
          const event = decodeEventLog({
            abi: HATS_ABI,
            data: log.data,
            topics: log.topics,
          });

          switch (event.eventName) {
            case "HatCreated": {
              hatsCreated.push(event.args.id);
              break;
            }
            case "TransferSingle": {
              if (event.args.to !== ZERO_ADDRESS) {
                hatsMinted.push({
                  hatId: event.args.id,
                  wearer: event.args.to,
                });
              }
              if (event.args.from !== ZERO_ADDRESS) {
                hatsBurned.push({
                  hatId: event.args.id,
                  wearer: event.args.from,
                });
              }
              break;
            }
            case "HatStatusChanged": {
              hatStatusChanges.push({
                hatId: event.args.hatId,
                newStatus: event.args.newStatus ? "active" : "inactive",
              });
              break;
            }
            case "WearerStandingChanged": {
              wearerStandingChanges.push({
                hatId: event.args.hatId,
                wearer: event.args.wearer,
                newStanding: event.args.wearerStanding ? "good" : "bad",
              });
              break;
            }
          }
        } catch (err) {
          console.log("Non Hats event encountered");
          continue;
        }
      }

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed,
        hatsCreated,
        hatsMinted,
        hatsBurned,
        hatStatusChanges,
        wearerStandingChanges,
      };
    } catch (err) {
      getError(err);
    }
  }

  async multicallPreFlightCheck({
    account,
    calls,
  }: {
    account: Account | Address;
    calls: {
      functionName: string;
      callData: Hex;
    }[];
  }) {
    const callDatas = calls.map((call) => call.callData);

    try {
      await this._publicClient.simulateContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "multicall",
        args: [callDatas],
        account,
      });
    } catch (err) {
      getError(err);
    }
  }
}
