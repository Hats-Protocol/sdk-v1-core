import { getGraphqlClient } from "../subgraph/index";
import { GraphQLClient, Variables } from "graphql-request";
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
import { treeIdDecimalToHex } from "./utils";

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

    if (publicClient.chain?.id !== chainId) {
      throw new Error(
        "Provided chain id should match the public client chain id"
      );
    }

    if (walletClient !== undefined && walletClient.chain?.id !== chainId) {
      throw new Error(
        "Provided chain id should match the wallet client chain id"
      );
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
    const treeIdHex = treeIdDecimalToHex(treeId);

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

  async getAdmin(hatId: bigint): Promise<bigint> {
    const hatLevel = await this.getHatLevel(hatId);
    const res = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getAdminAtLevel",
      args: [hatId, hatLevel - 1],
    });

    return res;
  }

  async getChildrenHats(hatId: bigint): Promise<bigint[]> {
    let res: bigint[] = [];
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
    await this._validateHatCreation({ account, admin, eligibility, toggle });

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

    for (let i = 0; i < admins.length; i++) {
      await this._validateHatCreation({
        account,
        admin: admins[i],
        eligibility: eligibilityModules[i],
        toggle: toggleModules[i],
      });
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
    await this._validateHatMinting({ account, hatId, wearer });

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

    for (let i = 0; i < hatIds.length; i++) {
      await this._validateHatMinting({
        account,
        hatId: hatIds[i],
        wearer: wearers[i],
      });
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

    const hat = await this.viewHat(hatId);
    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }
    if (hat.toggle !== accountAddress) {
      throw new Error("The calling account is not the hat toggle");
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

    const hat = await this.viewHat(hatId);
    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }
    if (hat.eligibility !== accountAddress) {
      throw new Error("The calling account is not the hat toggle");
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

    await this._validateHatTransfer({ account, hatId, from, to });

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

    await this._validateHatEdit({ account, hatId });

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

    await this._validateHatEditOrTophat({ account, hatId });

    if (newDetails.length > 7000) {
      throw new Error("Details field max length is 7000");
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

    await this._validateHatEdit({ account, hatId });

    if (newEligibility == "0x0000000000000000000000000000000000000000") {
      throw new Error("Zero eligibility address not valid");
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

    await this._validateHatEdit({ account, hatId });

    if (newToggle == "0x0000000000000000000000000000000000000000") {
      throw new Error("Zero toggle address not valid");
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

    await this._validateHatEditOrTophat({ account, hatId });

    if (newImageURI.length > 7000) {
      throw new Error("Image URI field max length is 7000");
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

    await this._validateMaxSupplyEdit({ account, hatId, newMaxSupply });

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

    await this._validateTopHatDomainAdmin({ account, topHatDomain });

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

    const linkageRequestToHat = await this.getLinkageRequest(topHatDomain);
    if (linkageRequestToHat !== newAdminHat) {
      throw new Error("Linkage has not been requested to the admin hat");
    }

    await this._validateLinkage({
      account,
      topHatDomain,
      newAdminHat,
      newDetails,
      newImageURI,
    });

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

    await this._validateTopHatDomainAdmin({ account, topHatDomain });

    const topHatId: bigint = BigInt(
      treeIdDecimalToHex(topHatDomain).padEnd(66, "0")
    );
    const isWearer = await this.isWearerOfHat({ wearer, hatId: topHatId });
    if (wearer === "0x0000000000000000000000000000000000000000" || !isWearer) {
      throw new Error("Wearer is not wearing the tophat");
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
    newEligibility?: Address;
    newToggle?: Address;
    newDetails?: string;
    newImageURI?: string;
  }): Promise<RelinkTopHatWithinTreeResult> {
    if (this._walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    await this._validateTopHatDomainAdmin({ account, topHatDomain });

    await this._validateLinkage({
      account,
      topHatDomain,
      newAdminHat,
      newDetails,
      newImageURI,
    });

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "relinkTopHatWithinTree",
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

  /*//////////////////////////////////////////////////////////////
                      Validation Functions
    //////////////////////////////////////////////////////////////*/

  protected async _validateHatCreation({
    account,
    admin,
    eligibility,
    toggle,
  }: {
    account: Account | Address;
    admin: bigint;
    eligibility: Address;
    toggle: Address;
  }) {
    if (eligibility === "0x0000000000000000000000000000000000000000") {
      throw new Error("Zero eligibility address not valid");
    }
    if (toggle === "0x0000000000000000000000000000000000000000") {
      throw new Error("Zero toggle address not valid");
    }

    const validHatId = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "isValidHatId",
      args: [admin],
    });
    if (!validHatId) {
      throw new Error("Invalid admin ID");
    }

    const nextHatId = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "getNextId",
      args: [admin],
    });

    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }

    const isAdmin = await this.isAdminOfHat({
      user: accountAddress,
      hatId: nextHatId,
    });
    if (!isAdmin) {
      throw new Error("Not Admin");
    }
  }

  protected async _validateHatMinting({
    account,
    hatId,
    wearer,
  }: {
    account: Account | Address;
    hatId: bigint;
    wearer: Address;
  }) {
    const hat = await this.viewHat(hatId);
    if (hat.maxSupply === 0) {
      throw new Error("Hat does not exist");
    }
    if (hat.supply >= hat.maxSupply) {
      throw new Error("All hats are worn");
    }

    const isWearerEligible = await this.isEligible({ wearer, hatId });
    if (!isWearerEligible) {
      throw new Error("Wearer is not eligible");
    }

    const isHatActive = await this.isActive(hatId);
    if (!isHatActive) {
      throw new Error("Hat is not active");
    }

    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }

    const isAdmin = await this.isAdminOfHat({
      user: accountAddress,
      hatId,
    });
    if (!isAdmin) {
      throw new Error("Not Admin");
    }

    const isAlreadyWearing = await this.isWearerOfHat({ wearer, hatId });
    if (isAlreadyWearing) {
      throw new Error("Already wearing the hat");
    }
  }

  protected async _validateHatTransfer({
    account,
    hatId,
    from,
    to,
  }: {
    account: Account | Address;
    hatId: bigint;
    from: Address;
    to: Address;
  }) {
    const hat = await this.viewHat(hatId);
    const isTopHat = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "isTopHat",
      args: [hatId],
    });
    if (!isTopHat && !hat.mutable) {
      throw new Error("Hat is immutable, transfer is not allowed");
    }

    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }

    const isAdmin = await this.isAdminOfHat({
      user: accountAddress,
      hatId,
    });
    if (!isAdmin) {
      throw new Error("Not Admin");
    }

    const isNewWearerEligible = await this.isEligible({ wearer: to, hatId });
    if (!isNewWearerEligible) {
      throw new Error("New wearer is not eligible for the hat");
    }

    const isHatActive = await this.isActive(hatId);
    if (!isHatActive) {
      throw new Error("Hat is not active");
    }

    const isAlreadyWearing = await this.isWearerOfHat({ wearer: to, hatId });
    if (isAlreadyWearing) {
      throw new Error("New wearer is already wearing the hat");
    }

    const isCurrentWearerEligible = await this.isEligible({
      wearer: from,
      hatId,
    });
    const isCurrentWearer = await this.isWearerOfHat({ wearer: from, hatId });
    if (isCurrentWearerEligible && !isCurrentWearer) {
      throw new Error("From address is not a wearer of the hat");
    }
  }

  protected async _validateHatEdit({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }) {
    const hat = await this.viewHat(hatId);
    if (!hat.mutable) {
      throw new Error("Hat is immutable, editing is not allowed");
    }

    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }

    const isAdmin = await this.isAdminOfHat({
      user: accountAddress,
      hatId,
    });
    if (!isAdmin) {
      throw new Error("Not Admin");
    }
  }

  protected async _validateHatEditOrTophat({
    account,
    hatId,
  }: {
    account: Account | Address;
    hatId: bigint;
  }) {
    const hat = await this.viewHat(hatId);
    const isTopHat = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "isTopHat",
      args: [hatId],
    });
    if (!isTopHat && !hat.mutable) {
      throw new Error("Hat is immutable, edit is not allowed");
    }

    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }

    const isAdmin = await this.isAdminOfHat({
      user: accountAddress,
      hatId,
    });
    if (!isAdmin) {
      throw new Error("Not Admin");
    }
  }

  protected async _validateMaxSupplyEdit({
    account,
    hatId,
    newMaxSupply,
  }: {
    account: Account | Address;
    hatId: bigint;
    newMaxSupply: number;
  }) {
    const hat = await this.viewHat(hatId);
    if (!hat.mutable) {
      throw new Error("Hat is immutable, editing is not allowed");
    }

    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }

    const isAdmin = await this.isAdminOfHat({
      user: accountAddress,
      hatId,
    });
    if (!isAdmin) {
      throw new Error("Not Admin");
    }

    if (newMaxSupply < hat.supply) {
      throw new Error(
        "New max supply cannot be lower than the current aupply of minted hats"
      );
    }
  }

  protected async _validateTopHatDomainAdmin({
    account,
    topHatDomain,
  }: {
    account: Account | Address;
    topHatDomain: number;
  }) {
    const topHatId: bigint = BigInt(
      treeIdDecimalToHex(topHatDomain).padEnd(66, "0")
    );

    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }

    const isAdmin = await this.isAdminOfHat({
      user: accountAddress,
      hatId: topHatId,
    });
    if (!isAdmin) {
      throw new Error("Not Admin");
    }
  }

  protected async _validateLinkage({
    account,
    topHatDomain,
    newAdminHat,
    newDetails,
    newImageURI,
  }: {
    account: Account | Address;
    topHatDomain: number;
    newAdminHat: bigint;
    newDetails?: string;
    newImageURI?: string;
  }) {
    let accountAddress: Address;
    if (typeof account === "object") {
      accountAddress = account.address;
    } else {
      accountAddress = account;
    }

    const isAdmin = await this.isAdminOfHat({
      user: accountAddress,
      hatId: newAdminHat,
    });
    const isWearer = await this.isWearerOfHat({
      wearer: accountAddress,
      hatId: newAdminHat,
    });
    if (!isAdmin && !isWearer) {
      throw new Error("Not admin or wearer");
    }

    const noCircularLinkage = await this._publicClient.readContract({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: "noCircularLinkage",
      args: [topHatDomain, newAdminHat],
    });
    if (!noCircularLinkage) {
      throw new Error("Circular linkage not allowed");
    }

    const linkedAdmin = await this.getLinkedTreeAdmin(topHatDomain);
    if (linkedAdmin > 0) {
      const tippyTopHatDomain = await this.getTippyTopHatDomain(topHatDomain);
      const tippyTopHatId = BigInt(
        treeIdDecimalToHex(tippyTopHatDomain).padEnd(66, "0")
      );

      const isWearerTippy = await this.isWearerOfHat({
        wearer: accountAddress,
        hatId: tippyTopHatId,
      });
      if (!isWearerTippy) {
        const destLocalTopHatDomain = await this._publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "getTopHatDomain",
          args: [newAdminHat],
        });
        const destLocalTopHatId = BigInt(
          treeIdDecimalToHex(destLocalTopHatDomain).padEnd(66, "0")
        );

        const originalLocalTopHatDomain = await this._publicClient.readContract(
          {
            address: HATS_V1,
            abi: HATS_ABI,
            functionName: "getTopHatDomain",
            args: [linkedAdmin],
          }
        );
        const originalLocalTopHatId = BigInt(
          treeIdDecimalToHex(originalLocalTopHatDomain).padEnd(66, "0")
        );

        if (
          destLocalTopHatId !== originalLocalTopHatId &&
          destLocalTopHatId !== tippyTopHatId
        ) {
          throw new Error("Cross tree linkage not allowed");
        }
      } else {
        const sameTippyTophat = await this._publicClient.readContract({
          address: HATS_V1,
          abi: HATS_ABI,
          functionName: "sameTippyTopHatDomain",
          args: [topHatDomain, newAdminHat],
        });

        if (!sameTippyTophat) {
          throw new Error("Cross tree linkage not allowed");
        }
      }
    }

    if (newDetails !== undefined && newDetails.length > 7000) {
      throw new Error("Details field max length is 7000");
    }

    if (newImageURI !== undefined && newImageURI.length > 7000) {
      throw new Error("Image URI field max length is 7000");
    }
  }
}
