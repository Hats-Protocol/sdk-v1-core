import { HATS_ABI } from "../abi/Hats";
import {
  ChainIdMismatchError,
  MissingPublicClientError,
  MaxHatsInLevelReached,
  MaxLevelReachedError,
} from "../errors";
import { HATS_V1, MAX_LEVELS, MAX_LEVEL_HATS } from "../constants";
import type { PublicClient, Address } from "viem";

export class HatsReadClient {
  readonly chainId: number;
  protected readonly _publicClient: PublicClient;

  /**
   * Initialize a HatsClient.
   *
   * @param chainId - Client chain ID. The client is initialized to work with one specific chain.
   * @param publicClient - Viem Public Client
   * @returns A HatsCallDataClient instance.
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
  }: {
    chainId: number;
    publicClient: PublicClient;
  }) {
    if (publicClient === undefined) {
      throw new MissingPublicClientError("Public client is required");
    }

    if (publicClient.chain?.id !== chainId) {
      throw new ChainIdMismatchError(
        "Provided chain id should match the public client chain id"
      );
    }

    this.chainId = chainId;
    this._publicClient = publicClient;
  }

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
}
