import { getGraphqlClient } from "../subgraph/index";
import { GraphQLClient, Variables } from "graphql-request";
import type { GqlHat } from "../subgraph/types";
import type { PublicClient, WalletClient, Account, Address } from "viem";
import { decodeEventLog, encodeEventTopics } from "viem";
import { GET_WEARER_HATS, GET_TREE_HATS } from "../subgraph/queries";
import { HATS_ABI } from "../abi/Hats";
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
} from "../types";
import { HATS_V1 } from "../config";
import { hatIdToHex, treeIdToHex } from "./utils";

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
    walletClient?: WalletClient;
  }) {
    if (publicClient === undefined) {
      throw new Error("Public client is required");
    }

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

  async getTreeHats(treeId: number): Promise<bigint[]> {
    const treeIdHex = treeIdToHex(treeId);

    const respone = await this._makeGqlRequest<{
      tree: { hats: { id: string }[] };
    }>(GET_TREE_HATS, {
      id: treeIdHex,
    });

    if (!respone.tree) {
      throw new Error("Tree does not exist on the subgraph");
    }

    return respone.tree.hats.map((hatObj) => BigInt(hatObj.id));
  }

  async getWearerHats(wearer: Address): Promise<bigint[]> {
    const respone = await this._makeGqlRequest<{
      wearer: { currentHats: { id: string }[] };
    }>(GET_WEARER_HATS, {
      id: wearer.toLowerCase(),
    });

    if (!respone.wearer) {
      throw new Error("Wearer does not exist on the subgraph");
    }

    return respone.wearer.currentHats.map((hatObj) => BigInt(hatObj.id));
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

  async isActive(hatId: bigint): Promise<boolean> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
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
    const res = await this._publicClient.readContract({
      address: HATS_V1,
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
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "isEligible",
      args: [wearer, hatId],
    });

    return res;
  }

  async predictHatId(admin: bigint): Promise<bigint> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getNextId",
      args: [admin],
    });

    return res;
  }

  async getTreesCount(): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "lastTopHatId",
    });

    return res;
  }

  async getLinkageRequest(topHatDomain: number): Promise<bigint> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "linkedTreeRequests",
      args: [topHatDomain],
    });

    return res;
  }

  async getLinkedTreeAdmin(topHatDomain: number): Promise<bigint> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "linkedTreeAdmins",
      args: [topHatDomain],
    });

    return res;
  }

  async getHatLevel(hatId: bigint): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getHatLevel",
      args: [hatId],
    });

    return res;
  }

  async getLocalHatLevel(hatId: bigint): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getLocalHatLevel",
      args: [hatId],
    });

    return res;
  }

  async getTopHatDomain(hatId: bigint): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getTopHatDomain",
      args: [hatId],
    });

    return res;
  }

  async getTippyTopHatDomain(topHatDomain: number): Promise<number> {
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getTippyTopHatDomain",
      args: [topHatDomain],
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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
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
          imageURI,
        ],
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
  }): Promise<BatchCreateHatsResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
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
          imageURIs,
        ],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      let newHatIds: bigint[] = [];

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
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "mintHat",
        args: [hatId, wearer],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "batchMintHats",
        args: [hatIds, wearers],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "setHatStatus",
        args: [hatId, newStatus],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

  async checkHatStatus({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }): Promise<CheckHatStatusResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "checkHatStatus",
        args: [hatId],
        account,
        chain: this._walletClient.chain,
      });

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
      throw new Error("Transaction reverted");
    }
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
  }): Promise<SetHatWearerStatusResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "setHatWearerStatus",
        args: [hatId, wearer, eligible, standing],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "checkHatWearerStatus",
        args: [hatId, wearer],
        account,
        chain: this._walletClient.chain,
      });

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
      throw new Error("Transaction reverted");
    }
  }

  async renounceHat({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }): Promise<RenounceHatResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "renounceHat",
        args: [hatId],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
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
  }): Promise<TransferHatResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "transferHat",
        args: [hatId, from, to],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

  async makeHatImmutable({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }): Promise<MakeHatImmutableResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "makeHatImmutable",
        args: [hatId],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatDetails",
        args: [hatId, newDetails],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatEligibility",
        args: [hatId, newEligibility],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatToggle",
        args: [hatId, newToggle],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatImageURI",
        args: [hatId, newImageURI],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "changeHatMaxSupply",
        args: [hatId, newMaxSupply],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "requestLinkTopHatToTree",
        args: [topHatDomain, requestedAdminHat],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
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
    newEligibility?: Address;
    newToggle?: Address;
    newDetails?: string;
    newImageURI?: string;
  }): Promise<ApproveLinkTopHatToTreeResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "approveLinkTopHatToTree",
        args: [
          topHatDomain,
          newAdminHat,
          newEligibility === undefined
            ? "0x0000000000000000000000000000000000000000"
            : newEligibility,
          newToggle === undefined
            ? "0x0000000000000000000000000000000000000000"
            : newToggle,
          newDetails === undefined ? "" : newDetails,
          newImageURI === undefined ? "" : newImageURI,
        ],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }

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
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "unlinkTopHatFromTree",
        args: [topHatDomain, wearer],
        account,
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
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
  }): Promise<RelinkTopHatWithinTreeResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
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

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error("Transaction reverted");
    }
  }
}
