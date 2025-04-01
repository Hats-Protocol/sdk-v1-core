import { encodeFunctionData } from 'viem';
import { HatsSubgraphClient, Hat } from '@hatsprotocol/sdk-v1-subgraph';

import { HATS_ABI } from '../abi/Hats';
import { HatsReadClient } from './read';
import { ZERO_ADDRESS } from '../constants';
import { treeIdDecimalToHex, hatIdHexToDecimal } from '../utils';
import type { PublicClient, Address, Hex } from 'viem';

export class HatsCallDataClient extends HatsReadClient {
  protected readonly _graphqlClient: HatsSubgraphClient;

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
    super({ chainId, publicClient });

    this._graphqlClient = new HatsSubgraphClient({});
  }

  /**
   * Return the call data a multicall operation.
   *
   * @param calls - An array with the call data strings, for each function call.
   * @returns An object containing the call data and the function name.
   */
  multicallCallData(calls: Hex[]): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'multicall',
      args: [calls],
    });

    return { functionName: 'multicall', callData };
  }

  /**
   * Return the call data for a mintTopHat operation.
   *
   * @param target - Tophat's wearer address.
   * @param details - Tophat's details field.
   * @param imageURIi - Optional tophat's image URI.
   * @returns An object containing the call data and the function name.
   */
  mintTopHatCallData({
    target,
    details,
    imageURI,
  }: {
    target: Address;
    details: string;
    imageURI?: string;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'mintTopHat',
      args: [target, details, imageURI === undefined ? '' : imageURI],
    });

    return { functionName: 'mintTopHat', callData };
  }

  /**
   * Return the call data for a createHat operation.
   *
   * @param admin - Hat's admin ID.
   * @param details - Hat's details field.
   * @param maxSupply - Hat's maximum amount of possible wearers.
   * @param eligibility - Hat's eligibility address (zero address is not valid).
   * @param toggle - Hat's toggle address (zero address is not valid).
   * @param mutable - True if the hat should be mutable, false otherwise.
   * @param imageURI - Optional hat's image URI.
   * @returns An object containing the call data and the function name.
   */
  createHatCallData({
    admin,
    details,
    maxSupply,
    eligibility,
    toggle,
    mutable,
    imageURI,
  }: {
    admin: bigint;
    details: string;
    maxSupply: number;
    eligibility: Address;
    toggle: Address;
    mutable: boolean;
    imageURI?: string;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'createHat',
      args: [
        admin,
        details,
        maxSupply,
        eligibility,
        toggle,
        mutable,
        imageURI === undefined ? '' : imageURI,
      ],
    });

    return { functionName: 'createHat', callData };
  }

  /**
   * Return the call data for a transferHat operation.
   *
   * @param hatId - Hat ID to be transfered.
   * @param from - Current wearer address.
   * @param to - New wearer address.
   * @returns An object containing the call data and the function name.
   */
  transferHatCallData({
    hatId,
    from,
    to,
  }: {
    hatId: bigint;
    from: Address;
    to: Address;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'transferHat',
      args: [hatId, from, to],
    });

    return { functionName: 'transferHat', callData };
  }

  /**
   * Return the call data for a mintHat operation.
   *
   * @param hatId - ID of the minted hat.
   * @param wearer - Address of the new wearer.
   * @returns An object containing the call data and the function name.
   */
  mintHatCallData({ hatId, wearer }: { hatId: bigint; wearer: Address }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'mintHat',
      args: [hatId, wearer],
    });

    return { functionName: 'mintHat', callData };
  }

  /**
   * Return the call data for a batchCreateHats operation.
   *
   * @param admins - The hats admin IDs.
   * @param details - The hats details fields.
   * @param maxSupplies - The hats maximum amounts of possible wearers.
   * @param eligibilityModules - The hats eligibility addresses (zero address is not valid).
   * @param toggleModules - The hats toggle addresses (zero address is not valid).
   * @param mutables - True if the hat should be mutable, false otherwise.
   * @param imageURIs - Optional hats image URIs.
   * @returns An object containing the call data and the function name.
   */
  batchCreateHatsCallData({
    admins,
    details,
    maxSupplies,
    eligibilityModules,
    toggleModules,
    mutables,
    imageURIs,
  }: {
    admins: bigint[];
    details: string[];
    maxSupplies: number[];
    eligibilityModules: Address[];
    toggleModules: Address[];
    mutables: boolean[];
    imageURIs?: string[];
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'batchCreateHats',
      args: [
        admins,
        details,
        maxSupplies,
        eligibilityModules,
        toggleModules,
        mutables,
        imageURIs === undefined ? Array(admins.length).fill('') : imageURIs,
      ],
    });

    return { functionName: 'batchCreateHats', callData };
  }

  /**
   * Return the call data for a batchMintHats operation.
   *
   * @param hatIds - IDs of the minted hats.
   * @param wearers - Addresses of the new wearers.
   * @returns An object containing the call data and the function name.
   */
  batchMintHatsCallData({
    hatIds,
    wearers,
  }: {
    hatIds: bigint[];
    wearers: Address[];
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'batchMintHats',
      args: [hatIds, wearers],
    });

    return { functionName: 'batchMintHats', callData };
  }

  /**
   * Return the call data for a setHatStatus operation.
   *
   * @param hatId - hat ID.
   * @param newStatus - Hat's new status: true for active, false for inactive.
   * @returns An object containing the call data and the function name.
   */
  setHatStatusCallData({
    hatId,
    newStatus,
  }: {
    hatId: bigint;
    newStatus: boolean;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'setHatStatus',
      args: [hatId, newStatus],
    });

    return { functionName: 'setHatStatus', callData };
  }

  checkHatStatusCallData({ hatId }: { hatId: bigint }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'checkHatStatus',
      args: [hatId],
    });

    return { functionName: 'checkHatStatus', callData };
  }

  /**
   * Return the call data for a setHatWearerStatus operation.
   *
   * @param hatId - Hat ID.
   * @param wearer - Wearer address.
   * @param eligible - Wearer's eligibility. True for eligible, false otherwise.
   * @param standing - Wearer's standing. True for good, false for bad.
   * @returns An object containing the call data and the function name.
   */
  setHatWearerStatusCallData({
    hatId,
    wearer,
    eligible,
    standing,
  }: {
    hatId: bigint;
    wearer: Address;
    eligible: boolean;
    standing: boolean;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'setHatWearerStatus',
      args: [hatId, wearer, eligible, standing],
    });

    return { functionName: 'setHatWearerStatus', callData };
  }

  /**
   * Return the call data for a checkHatWearerStatus operation.
   *
   * @param hatId - Hat ID.
   * @param wearer - Wearer address.
   * @returns An object containing the call data and the function name.
   */
  checkHatWearerStatusCallData({
    hatId,
    wearer,
  }: {
    hatId: bigint;
    wearer: Address;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'checkHatWearerStatus',
      args: [hatId, wearer],
    });

    return { functionName: 'checkHatWearerStatus', callData };
  }

  /**
   * Return the call data for a renounceHat operation.
   *
   * @param hatId - Hat ID of the hat the caller wishes to renounce.
   * @returns An object containing the call data and the function name.
   */
  renounceHatCallData({ hatId }: { hatId: bigint }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'renounceHat',
      args: [hatId],
    });

    return { functionName: 'renounceHat', callData };
  }

  /**
   * Return the call data for a makeHatImmutable operation.
   *
   * @param hatId - Hat ID.
   * @returns An object containing the call data and the function name.
   */
  makeHatImmutableCallData({ hatId }: { hatId: bigint }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'makeHatImmutable',
      args: [hatId],
    });

    return { functionName: 'makeHatImmutable', callData };
  }

  /**
   * Return the call data for a changeHatDetails operation.
   *
   * @param hatId - Hat ID.
   * @param newDetails - The new details.
   * @returns An object containing the call data and the function name.
   */
  changeHatDetailsCallData({
    hatId,
    newDetails,
  }: {
    hatId: bigint;
    newDetails: string;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'changeHatDetails',
      args: [hatId, newDetails],
    });

    return { functionName: 'changeHatDetails', callData };
  }

  /**
   * Return the call data for a changeHatEligibility operation.
   *
   * @param hatId - Hat ID.
   * @param newEligibility - The new eligibility address. Zero address is not valid.
   * @returns An object containing the call data and the function name.
   */
  changeHatEligibilityCallData({
    hatId,
    newEligibility,
  }: {
    hatId: bigint;
    newEligibility: Address;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'changeHatEligibility',
      args: [hatId, newEligibility],
    });

    return { functionName: 'changeHatEligibility', callData };
  }

  /**
   * Return the call data for a changeHatToggle operation.
   *
   * @param hatId - Hat ID.
   * @param newToggle - The new toggle address. Zero address is not valid.
   * @returns An object containing the call data and the function name.
   */
  changeHatToggleCallData({
    hatId,
    newToggle,
  }: {
    hatId: bigint;
    newToggle: Address;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'changeHatToggle',
      args: [hatId, newToggle],
    });

    return { functionName: 'changeHatToggle', callData };
  }

  /**
   * Return the call data for a changeHatImageURI operation.
   *
   * @param hatId - Hat ID.
   * @param newImageURI - The new image URI.
   * @returns An object containing the call data and the function name.
   */
  changeHatImageURICallData({
    hatId,
    newImageURI,
  }: {
    hatId: bigint;
    newImageURI: string;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'changeHatImageURI',
      args: [hatId, newImageURI],
    });

    return { functionName: 'changeHatImageURI', callData };
  }

  /**
   * Return the call data for a changeHatMaxSupply operation.
   *
   * @param hatId - Hat ID.
   * @param newMaxSupply -New maximum supply for the hat.
   * @returns An object containing the call data and the function name.
   */
  changeHatMaxSupplyCallData({
    hatId,
    newMaxSupply,
  }: {
    hatId: bigint;
    newMaxSupply: number;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'changeHatMaxSupply',
      args: [hatId, newMaxSupply],
    });

    return { functionName: 'changeHatMaxSupply', callData };
  }

  /**
   * Return the call data for a requestLinkTopHatToTree operation.
   *
   * @param topHatDomain - The tree domain of the requesting tree. The tree domain is the first four bytes of the tophat ID.
   * @param requestedAdminHat - ID of the requested new admin hat.
   * @returns An object containing the call data and the function name.
   */
  requestLinkTopHatToTreeCallData({
    topHatDomain,
    requestedAdminHat,
  }: {
    topHatDomain: number;
    requestedAdminHat: bigint;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'requestLinkTopHatToTree',
      args: [topHatDomain, requestedAdminHat],
    });

    return { functionName: 'requestLinkTopHatToTree', callData };
  }

  /**
   * Return the call data for a approveLinkTopHatToTree operation.
   *
   * @param topHatDomain - The tree domain of the requesting tree. The tree domain is the first four bytes of the tophat ID.
   * @param newAdminHat - ID of the new admin hat.
   * @param newEligibility - Optional new eligibility for the linked tophat.
   * @param newToggle - Optional new toggle for the linked tophat.
   * @param newDetails - Optional new details for the linked tophat.
   * @param newImageURI - Optional new image URI for the linked tophat.
   * @returns An object containing the call data and the function name.
   */
  approveLinkTopHatToTreeCallData({
    topHatDomain,
    newAdminHat,
    newEligibility,
    newToggle,
    newDetails,
    newImageURI,
  }: {
    topHatDomain: number;
    newAdminHat: bigint;
    newEligibility?: Address;
    newToggle?: Address;
    newDetails?: string;
    newImageURI?: string;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'approveLinkTopHatToTree',
      args: [
        topHatDomain,
        newAdminHat,
        newEligibility === undefined ? ZERO_ADDRESS : newEligibility,
        newToggle === undefined ? ZERO_ADDRESS : newToggle,
        newDetails === undefined ? '' : newDetails,
        newImageURI === undefined ? '' : newImageURI,
      ],
    });

    return { functionName: 'approveLinkTopHatToTree', callData };
  }

  /**
   * Return the call data for a unlinkTopHatFromTree operation.
   *
   * @param topHatDomain - The tree domain of the requesting tree. The tree domain is the first four bytes of the tophat ID.
   * @param wearer - The current wearer of the tophat that is about to be unlinked.
   * @returns An object containing the call data and the function name.
   */
  unlinkTopHatFromTreeCallData({
    topHatDomain,
    wearer,
  }: {
    topHatDomain: number;
    wearer: Address;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'unlinkTopHatFromTree',
      args: [topHatDomain, wearer],
    });

    return { functionName: 'unlinkTopHatFromTree', callData };
  }

  /**
   * Return the call data for a relinkTopHatWithinTree operation.
   *
   * @param topHatDomain - The tree domain of the requesting tree. The tree domain is the first four bytes of the tophat ID.
   * @param newAdminHat - ID of the new admin hat.
   * @param newEligibility - Optional new eligibility for the linked tophat.
   * @param newToggle - Optional new toggle for the linked tophat.
   * @param newDetails - Optional new details for the linked tophat.
   * @param newImageURI - Optional new image URI for the linked tophat.
   * @returns An object containing the call data and the function name.
   */
  relinkTopHatWithinTreeCallData({
    topHatDomain,
    newAdminHat,
    newEligibility,
    newToggle,
    newDetails,
    newImageURI,
  }: {
    topHatDomain: number;
    newAdminHat: bigint;
    newEligibility?: Address;
    newToggle?: Address;
    newDetails?: string;
    newImageURI?: string;
  }): {
    functionName: string;
    callData: Hex;
  } {
    const callData = encodeFunctionData({
      abi: HATS_ABI,
      functionName: 'relinkTopHatWithinTree',
      args: [
        topHatDomain,
        newAdminHat,
        newEligibility === undefined ? ZERO_ADDRESS : newEligibility,
        newToggle === undefined ? ZERO_ADDRESS : newToggle,
        newDetails === undefined ? '' : newDetails,
        newImageURI === undefined ? '' : newImageURI,
      ],
    });

    return { functionName: 'relinkTopHatWithinTree', callData };
  }

  /**
   * Get the call data to copy a tree's hats and wearers.
   * Note: this doensn't include the target's top-hat. The target top-hat should be created separately.
   *
   * @param sourceTree - The source tree domain.
   * @param targetTree - The target tree domain.
   * @returns An array of call data objects. Passing the result to the multicall function will execute the copy operation.
   */
  async copyTreeCallData({
    sourceTree,
    targetTree,
  }: {
    sourceTree: number;
    targetTree: number;
  }): Promise<
    {
      functionName: string;
      callData: Hex;
    }[]
  > {
    if (this._graphqlClient === undefined) {
      throw new Error('Subgraph client was not initialized');
    }

    const res: {
      functionName: string;
      callData: Hex;
    }[] = [];
    const tree = await this._graphqlClient.getTree({
      chainId: this.chainId,
      treeId: sourceTree,
      props: {
        hats: {
          props: {
            details: true,
            maxSupply: true,
            imageUri: true,
            currentSupply: true,
            levelAtLocalTree: true,
            eligibility: true,
            toggle: true,
            mutable: true,
            createdAt: true,
            wearers: { props: {} },
            admin: {},
          },
        },
        childOfTree: {},
        linkedToHat: {},
        parentOfTrees: { props: {} },
      },
    });

    const targetTreeHex = treeIdDecimalToHex(targetTree);

    tree.hats?.forEach((hat: Hat, index: number) => {
      if (index !== 0 && hat.createdAt !== null) {
        const adminID = hatIdHexToDecimal(
          targetTreeHex + hat.admin?.id.substring(10)
        );
        const createHatCall = this.createHatCallData({
          admin: adminID,
          details: hat.details as string,
          maxSupply: +(hat.maxSupply as string),
          eligibility: hat.eligibility as `0x${string}`,
          toggle: hat.toggle as `0x${string}`,
          mutable: hat.mutable as boolean,
          imageURI: hat.imageUri as string,
        });
        res.push({
          functionName: 'createHat',
          callData: createHatCall.callData,
        });

        hat.wearers?.forEach((wearer: { id: string }) => {
          const mintHatCall = this.mintHatCallData({
            hatId: hatIdHexToDecimal(targetTreeHex + hat.id.substring(10)),
            wearer: wearer.id as `0x${string}`,
          });
          res.push({ functionName: 'mintHat', callData: mintHatCall.callData });
        });
      }
    });

    return res;
  }
}
