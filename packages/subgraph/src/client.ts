import { GET_HAT, GET_HATS_BY_IDS } from "./queries";
import {
  treeIdDecimalToHex,
  hatIdDecimalToHex,
  hatIdHexToDecimal,
} from "./utils";
import { getGraphqlClient } from "./endpoints";
import { SubgraphNotUpportedError, SubgraphHatNotExistError } from "./errors";
import { Variables } from "graphql-request";
import type { Hat } from "./types";

export class HatsSubgraphClient {
  protected async _makeGqlRequest<ResponseType>(
    chainId: number,
    query: string,
    variables?: Variables
  ): Promise<ResponseType> {
    const client = getGraphqlClient(chainId);
    if (client === undefined) {
      throw new SubgraphNotUpportedError(
        `No subgraph support for network id ${chainId}`
      );
    }

    const result = (await client.request(query, variables)) as ResponseType;

    return result;
  }

  async fetchHat({
    hatId,
    chainId,
  }: {
    hatId: bigint;
    chainId: number;
  }): Promise<Hat> {
    const hatIdHex = hatIdDecimalToHex(hatId);

    const respone = await this._makeGqlRequest<{ hat: Hat }>(chainId, GET_HAT, {
      id: hatIdHex,
    });

    if (!respone.hat) {
      throw new SubgraphHatNotExistError(
        `Hat with and ID of ${hatId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.hat;
  }
}
