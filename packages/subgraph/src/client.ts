import {
  treeIdDecimalToHex,
  hatIdDecimalToHex,
  normalizeProps,
  normalizedPropsToQueryFields,
} from "./utils";
import { gql } from "graphql-request";
import { getGraphqlClient } from "./endpoints";
import {
  SubgraphNotUpportedError,
  SubgraphHatNotExistError,
  SubgraphTreeNotExistError,
  SubgraphWearerNotExistError,
} from "./errors";
import { Variables } from "graphql-request";
import type {
  Hat,
  Tree,
  HatConfig,
  TreeConfig,
  WearerConfig,
  Wearer,
} from "./types";

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
      query getHat($id: ID!, $firstHats: Int!) {
        hat(id: $id) {
          ${queryFields}
        }
      }
    `;

    const respone = await this._makeGqlRequest<{ hat: Hat }>(chainId, query, {
      id: hatIdHex,
      firstHats: 1000,
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
      query getHatsByIds($ids: [ID!]!, $firstHats: Int!) {
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
        firstHats: 1000,
      }
    );

    if (!respone.hats || respone.hats.length < hatIds.length) {
      throw new SubgraphHatNotExistError(
        `One or more of the provided hats do not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.hats;
  }

  async getTree({
    chainId,
    treeId,
    props,
    firstHats,
  }: {
    chainId: number;
    treeId: number;
    props: TreeConfig;
    firstHats?: number;
  }): Promise<Tree> {
    const treeIdHex = treeIdDecimalToHex(treeId);

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getTree($id: ID!, $firstHats: Int!) {
        tree(id: $id) {
          ${queryFields}
        }
      }
    `;

    const firstHatsVariable = firstHats ?? 1000;
    const respone = await this._makeGqlRequest<{ tree: Tree }>(chainId, query, {
      id: treeIdHex,
      firstHats: firstHatsVariable,
    });

    if (!respone.tree) {
      throw new SubgraphTreeNotExistError(
        `Tree with an ID of ${treeId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.tree;
  }

  async getTrees({
    chainId,
    treeIds,
    props,
    firstHats,
  }: {
    chainId: number;
    treeIds: number[];
    props: TreeConfig;
    firstHats?: number;
  }): Promise<Tree[]> {
    const treeIdsHex = treeIds.map((treeId) => treeIdDecimalToHex(treeId));

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
    query getTreesById($ids: [ID!]!, $firstHats: Int!) {
      trees(where: { id_in: $ids }) {
        ${queryFields}
      }
    }
  `;

    const firstHatsVariable = firstHats ?? 1000;
    const respone = await this._makeGqlRequest<{ trees: Tree[] }>(
      chainId,
      query,
      {
        ids: treeIdsHex,
        firstHats: firstHatsVariable,
      }
    );

    if (!respone.trees || respone.trees.length < treeIds.length) {
      throw new SubgraphTreeNotExistError(
        `One or more of the provided trees do not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.trees;
  }

  async getTreesPaginated({
    chainId,
    props,
    page,
    perPage,
    firstHats,
  }: {
    chainId: number;
    props: TreeConfig;
    page: number;
    perPage: number;
    firstHats?: number;
  }): Promise<Tree[]> {
    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
    query getPaginatedTrees($skip: Int!, $first: Int!, $firstHats: Int!) {
      trees(skip: $skip, first: $first) {
        ${queryFields}
      }
    }
  `;

    const firstHatsVariable = firstHats ?? 1000;
    const respone = await this._makeGqlRequest<{ trees: Tree[] }>(
      chainId,
      query,
      {
        skip: page * perPage,
        first: perPage,
        firstHats: firstHatsVariable,
      }
    );

    if (!respone.trees) {
      throw new Error("Unexpected error");
    }

    return respone.trees;
  }

  async getWearer({
    chainId,
    wearerAddress,
    props,
  }: {
    chainId: number;
    wearerAddress: `0x${string}`;
    props: WearerConfig;
  }): Promise<Wearer> {
    const wearerAddressLowerCase = wearerAddress.toLowerCase();

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getCurrentHatsForWearer($id: ID!) {
        wearer(id: $id) {
            ${queryFields}
        }
      }
    `;

    const respone = await this._makeGqlRequest<{ wearer: Wearer }>(
      chainId,
      query,
      {
        id: wearerAddressLowerCase,
        firstHats: 1000,
      }
    );

    if (!respone.wearer) {
      throw new SubgraphWearerNotExistError(
        `Wearer with an address of ${wearerAddress} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.wearer;
  }

  async getWearersOfHatPaginated({
    chainId,
    hatId,
    props,
    page,
    perPage,
  }: {
    chainId: number;
    hatId: bigint;
    props: WearerConfig;
    page: number;
    perPage: number;
  }): Promise<Wearer[]> {
    const hatIdHex = hatIdDecimalToHex(hatId);

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getPaginatedWearersForHat($hatId: ID!, $first: Int!, $skip: Int!, $firstHats: Int!) {
        wearers(
          skip: $skip
          first: $first
          where: { currentHats_: { id: $hatId } }
        ) {
          ${queryFields}
        }
      }
    `;

    const respone = await this._makeGqlRequest<{ wearers: Wearer[] }>(
      chainId,
      query,
      {
        hatId: hatIdHex,
        skip: page * perPage,
        first: perPage,
        firstHats: 1000,
      }
    );

    if (!respone.wearers) {
      throw new SubgraphHatNotExistError(
        `Hat with an ID of ${hatId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.wearers;
  }
}
