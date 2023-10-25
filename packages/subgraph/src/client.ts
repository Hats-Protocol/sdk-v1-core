import {
  GET_HAT,
  GET_HATS_BY_IDS,
  GET_TREE,
  GET_ALL_TREE_IDS,
} from "./queries";
import {
  treeIdDecimalToHex,
  hatIdDecimalToHex,
  normalizeProps,
  normalizedPropsToQueryFields,
} from "./utils";
import { gql } from "graphql-request";
import { getGraphqlClient } from "./endpoints";
import { SubgraphNotUpportedError, SubgraphHatNotExistError } from "./errors";
import { Variables } from "graphql-request";
import type { Hat, Tree, HatConfig, TreeConfig, WearerConfig } from "./types";

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

  async getHat({
    chainId,
    hatId,
    props,
  }: {
    chainId: number;
    hatId: bigint;
    props: HatConfig;
  }): Promise<Hat> {
    const hatIdHex = hatIdDecimalToHex(hatId);

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getHat($id: ID!, $numEvents: Int = 5) {
        hat(id: $id) {
          ${queryFields}
        }
      }
    `;

    const respone = await this._makeGqlRequest<{ hat: Hat }>(chainId, query, {
      id: hatIdHex,
    });

    if (!respone.hat) {
      throw new SubgraphHatNotExistError(
        `Hat with an ID of ${hatId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.hat;
  }

  async getHats({
    chainId,
    hatIds,
    props,
  }: {
    chainId: number;
    hatIds: bigint[];
    props: HatConfig;
  }): Promise<Hat[]> {
    const hatIdsHex: string[] = hatIds.map((id) => hatIdDecimalToHex(id));

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getHatsByIds($ids: [ID!]!) {
        hats(where: { id_in: $ids }) {
            ${queryFields}
        }
      }
    `;

    const respone = await this._makeGqlRequest<{ hats: Hat[] }>(
      chainId,
      query,
      {
        ids: hatIdsHex,
      }
    );

    if (!respone.hats || respone.hats.length < hatIds.length) {
      throw new SubgraphHatNotExistError(
        `One or more of the provided hats do not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.hats;
  }

  async fetchTree({
    treeId,
    chainId,
  }: {
    treeId: number;
    chainId: number;
  }): Promise<Tree> {
    const treeIdHex = treeIdDecimalToHex(treeId);

    const respone = await this._makeGqlRequest<{ tree: Tree }>(
      chainId,
      GET_TREE,
      {
        id: treeIdHex,
      }
    );

    if (!respone.tree) {
      throw new SubgraphHatNotExistError(
        `Tree with an ID of ${treeId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.tree;
  }
}
