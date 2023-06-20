import { getGraphqlClient } from "../subgraph/index";
import { GraphQLClient, Variables } from "graphql-request";
import type { GqlHat } from "../subgraph/types";
import type { PublicClient, WalletClient, Account, Address, Hash } from "viem";
import { decodeEventLog, parseAbiItem } from "viem";
import { GET_HAT } from "../subgraph/queries";
import { HATS_ABI } from "../abi/Hats";
import type { CreateHatResult, MintTopHatResult } from "../types";

export class HatsClient {
  readonly chainId: number;
  private readonly _publicClient: PublicClient;
  private readonly _walletClient: WalletClient | undefined;
  private readonly _graphqlClient: GraphQLClient | undefined;

  constructor({
    chainId,
    publicClient,
    walletClient,
  }: {
    chainId: number;
    publicClient: PublicClient;
    walletClient: WalletClient | undefined;
  }) {
    this.chainId = chainId;
    this._graphqlClient = getGraphqlClient(chainId);
    this._publicClient = publicClient;
    this._walletClient = walletClient;
  }

  protected async _makeGqlRequest<ResponseType>(
    query: string,
    variables?: Variables
  ): Promise<ResponseType> {
    if (!this._graphqlClient) {
      throw new Error();
    }

    const result = (await this._graphqlClient.request(
      query,
      variables
    )) as ResponseType;

    return result;
  }

  /*//////////////////////////////////////////////////////////////
                      Subgraph Read Functions
    //////////////////////////////////////////////////////////////*/

  async getHat({ hatId }: { hatId: string }): Promise<GqlHat> {
    const respone = await this._makeGqlRequest<{ hat: GqlHat }>(GET_HAT, {
      id: hatId,
    });
    if (!respone.hat) {
      throw new Error();
    }

    return respone.hat;
  }

  /*//////////////////////////////////////////////////////////////
                      Onchain Read Functions
    //////////////////////////////////////////////////////////////*/

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
    if (this._publicClient === undefined) {
      throw new Error();
    }

    const result = await this._publicClient.readContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
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

  async isWearerOfHat({
    wearer,
    hatId,
  }: {
    wearer: Address;
    hatId: bigint;
  }): Promise<boolean> {
    if (this._publicClient === undefined) {
      throw new Error();
    }

    const res = await this._publicClient.readContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "isWearerOfHat",
      args: [wearer, hatId],
    });

    return res;
  }

  async isAdminOfHat({
    user,
    hatId,
  }: {
    user: Address;
    hatId: bigint;
  }): Promise<boolean> {
    if (this._publicClient === undefined) {
      throw new Error();
    }

    const res = await this._publicClient.readContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "isAdminOfHat",
      args: [user, hatId],
    });

    return res;
  }

  async isActive(hatId: bigint): Promise<boolean> {
    if (this._publicClient === undefined) {
      throw new Error();
    }

    const res = await this._publicClient.readContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "isActive",
      args: [hatId],
    });

    return res;
  }

  async isInGoodStanding({
    wearer,
    hatId,
  }: {
    wearer: Address;
    hatId: bigint;
  }): Promise<boolean> {
    if (this._publicClient === undefined) {
      throw new Error();
    }

    const res = await this._publicClient.readContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "isInGoodStanding",
      args: [wearer, hatId],
    });

    return res;
  }

  async isEligible({
    wearer,
    hatId,
  }: {
    wearer: Address;
    hatId: bigint;
  }): Promise<boolean> {
    if (this._publicClient === undefined) {
      throw new Error();
    }

    const res = await this._publicClient.readContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "isEligible",
      args: [wearer, hatId],
    });

    return res;
  }

  async predictHatId(admin: bigint): Promise<bigint> {
    if (this._publicClient === undefined) {
      throw new Error();
    }

    const res = await this._publicClient.readContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "getNextId",
      args: [admin],
    });

    return res;
  }

  /*//////////////////////////////////////////////////////////////
                      Write Functions
    //////////////////////////////////////////////////////////////*/

  async mintTopHat({
    account,
    target,
    details,
    imageURI,
  }: {
    account: Account | Address;
    target: Address;
    details: string;
    imageURI: string;
  }): Promise<MintTopHatResult> {
    if (this._walletClient === undefined) {
      throw new Error("Missing wallet client");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
        abi: HATS_ABI,
        functionName: "mintTopHat",
        args: [target, details, imageURI],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      const event = decodeEventLog({
        abi: [
          parseAbiItem(
            "event HatCreated(uint256,string,uint32,address,address,bool,string)"
          ),
        ],
        data: receipt.logs[0].data,
        topics: receipt.logs[0].topics,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        hatId: event.args[0],
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
    imageURI: string;
  }): Promise<CreateHatResult> {
    if (this._walletClient === undefined) {
      throw new Error("Missing wallet client");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
        abi: HATS_ABI,
        functionName: "createHat",
        args: [
          BigInt(admin),
          details,
          maxSupply,
          eligibility,
          toggle,
          mutable,
          imageURI,
        ],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      const event = decodeEventLog({
        abi: [
          parseAbiItem(
            "event HatCreated(uint256,string,uint32,address,address,bool,string)"
          ),
        ],
        data: receipt.logs[0].data,
        topics: receipt.logs[0].topics,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        hatId: event.args[0],
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
    imageURIs: string[];
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "batchCreateHats",
      args: [
        admins,
        details,
        maxSupplies,
        eligibilityModules,
        toggleModules,
        mutables,
        imageURIs,
      ],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async mintHat({
    account,
    hatId,
    wearer,
  }: {
    account: Account | Address;
    hatId: bigint;
    wearer: Address;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "mintHat",
      args: [hatId, wearer],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async batchMintHats({
    account,
    hatIds,
    wearers,
  }: {
    account: Account | Address;
    hatIds: bigint[];
    wearers: Address[];
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "batchMintHats",
      args: [hatIds, wearers],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async setHatStatus({
    account,
    hatId,
    newStatus,
  }: {
    account: Account | Address;
    hatId: bigint;
    newStatus: boolean;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "setHatStatus",
      args: [hatId, newStatus],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async checkHatStatus({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "checkHatStatus",
      args: [hatId],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

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
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "setHatWearerStatus",
      args: [hatId, wearer, eligible, standing],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async checkHatWearerStatus({
    account,
    hatId,
    wearer,
  }: {
    account: Account | Address;
    hatId: bigint;
    wearer: Address;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "checkHatWearerStatus",
      args: [hatId, wearer],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async renounceHat({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "renounceHat",
      args: [hatId],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

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
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "transferHat",
      args: [hatId, from, to],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async makeHatImmutable({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "makeHatImmutable",
      args: [hatId],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async changeHatDetails({
    account,
    hatId,
    newDetails,
  }: {
    account: Account | Address;
    hatId: bigint;
    newDetails: string;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "changeHatDetails",
      args: [hatId, newDetails],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async changeHatEligibility({
    account,
    hatId,
    newEligibility,
  }: {
    account: Account | Address;
    hatId: bigint;
    newEligibility: Address;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "changeHatEligibility",
      args: [hatId, newEligibility],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async changeHatToggle({
    account,
    hatId,
    newToggle,
  }: {
    account: Account | Address;
    hatId: bigint;
    newToggle: Address;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "changeHatToggle",
      args: [hatId, newToggle],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async changeHatImageURI({
    account,
    hatId,
    newImageURI,
  }: {
    account: Account | Address;
    hatId: bigint;
    newImageURI: string;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "changeHatImageURI",
      args: [hatId, newImageURI],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async changeHatMaxSupply({
    account,
    hatId,
    newMaxSupply,
  }: {
    account: Account | Address;
    hatId: bigint;
    newMaxSupply: number;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "changeHatMaxSupply",
      args: [hatId, newMaxSupply],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async requestLinkTopHatToTree({
    account,
    topHatDomain,
    requestedAdminHat,
  }: {
    account: Account | Address;
    topHatDomain: number;
    requestedAdminHat: bigint;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "requestLinkTopHatToTree",
      args: [topHatDomain, requestedAdminHat],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

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
    newEligibility: Address;
    newToggle: Address;
    newDetails: string;
    newImageURI: string;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "approveLinkTopHatToTree",
      args: [
        topHatDomain,
        newAdminHat,
        newEligibility,
        newToggle,
        newDetails,
        newImageURI,
      ],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

  async unlinkTopHatFromTree({
    account,
    topHatDomain,
    wearer,
  }: {
    account: Account | Address;
    topHatDomain: number;
    wearer: Address;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "unlinkTopHatFromTree",
      args: [topHatDomain, wearer],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }

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
    newEligibility: Address;
    newToggle: Address;
    newDetails: string;
    newImageURI: string;
  }): Promise<Hash> {
    if (this._walletClient === undefined) {
      throw new Error();
    }

    const res = await this._walletClient.writeContract({
      address: "0x9D2dfd6066d5935267291718E8AA16C8Ab729E9d",
      abi: HATS_ABI,
      functionName: "relinkTopHatWithinTree",
      args: [
        topHatDomain,
        newAdminHat,
        newEligibility,
        newToggle,
        newDetails,
        newImageURI,
      ],
      account,
      chain: this._walletClient.chain,
    });

    return res;
  }
}
