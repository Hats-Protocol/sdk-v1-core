import {
  treeIdDecimalToHex,
  hatIdDecimalToHex,
  normalizeProps,
  normalizedPropsToQueryFields,
} from "./utils";
import { gql, Variables } from "graphql-request";
import { getGraphqlClient } from "./endpoints";
import {
  SubgraphNotUpportedError,
  SubgraphHatNotExistError,
  SubgraphTreeNotExistError,
  SubgraphWearerNotExistError,
  InputValidationError,
} from "./errors";
import {
  hatConfigSchema,
  treeConfigSchema,
  wearerConfigSchema,
} from "./schemas";
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
    const validationRes = hatConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const hatIdHex = hatIdDecimalToHex(hatId);

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getHat($id: ID!, $numHats: Int!, $numWearers: Int!) {
        hat(id: $id) {
          ${queryFields}
        }
      }
    `;

    const respone = await this._makeGqlRequest<{ hat: Hat }>(chainId, query, {
      id: hatIdHex,
      numHats: 1000,
      numWearers: 1000,
    });

    if (!respone.hat) {
      throw new SubgraphHatNotExistError(
        `Hat with an ID of ${hatId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.hat;
  }

  async getHatsByIds({
    chainId,
    hatIds,
    props,
  }: {
    chainId: number;
    hatIds: bigint[];
    props: HatConfig;
  }): Promise<Hat[]> {
    const validationRes = hatConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const hatIdsHex: string[] = hatIds.map((id) => hatIdDecimalToHex(id));

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getHatsByIds($ids: [ID!]!, $numHats: Int!, $numWearers: Int!) {
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
        numHats: 1000,
        numWearers: 1000,
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
  }: {
    chainId: number;
    treeId: number;
    props: TreeConfig;
  }): Promise<Tree> {
    const validationRes = treeConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const treeIdHex = treeIdDecimalToHex(treeId);

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getTree($id: ID!, $numHats: Int!, $numWearers: Int!) {
        tree(id: $id) {
          ${queryFields}
        }
      }
    `;

    const respone = await this._makeGqlRequest<{ tree: Tree }>(chainId, query, {
      id: treeIdHex,
      numHats: 1000,
      numWearers: 1000,
    });

    if (!respone.tree) {
      throw new SubgraphTreeNotExistError(
        `Tree with an ID of ${treeId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.tree;
  }

  async getTreesByIds({
    chainId,
    treeIds,
    props,
  }: {
    chainId: number;
    treeIds: number[];
    props: TreeConfig;
  }): Promise<Tree[]> {
    const validationRes = treeConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const treeIdsHex = treeIds.map((treeId) => treeIdDecimalToHex(treeId));

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
    query getTreesById($ids: [ID!]!, $numHats: Int!, $numWearers: Int!) {
      trees(where: { id_in: $ids }) {
        ${queryFields}
      }
    }
  `;

    const respone = await this._makeGqlRequest<{ trees: Tree[] }>(
      chainId,
      query,
      {
        ids: treeIdsHex,
        numHats: 1000,
        numWearers: 1000,
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
    numHatsPerTree,
  }: {
    chainId: number;
    props: TreeConfig;
    page: number;
    perPage: number;
    numHatsPerTree?: number;
  }): Promise<Tree[]> {
    const validationRes = treeConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
    query getPaginatedTrees($skip: Int!, $first: Int!, $numHats: Int!, $numWearers: Int!) {
      trees(skip: $skip, first: $first) {
        ${queryFields}
      }
    }
  `;

    const respone = await this._makeGqlRequest<{ trees: Tree[] }>(
      chainId,
      query,
      {
        skip: page * perPage,
        first: perPage,
        numHats: numHatsPerTree ?? 1000,
        numWearers: 1000,
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
    const validationRes = wearerConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const wearerAddressLowerCase = wearerAddress.toLowerCase();

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getCurrentHatsForWearer($id: ID!, $numHats: Int!, $numWearers: Int!) {
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
        numHats: 1000,
        numWearers: 1000,
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
    const validationRes = wearerConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const hatIdHex = hatIdDecimalToHex(hatId);

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getPaginatedWearersForHat($hatId: ID!, $first: Int!, $skip: Int!, $numHats: Int!, $numWearers: Int!) {
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
        numHats: 1000,
        numWearers: 1000,
      }
    );

    if (!respone.wearers) {
      throw new SubgraphHatNotExistError(
        `Hat with an ID of ${hatId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.wearers;
  }

  async searchTreesHatsWearers({
    chainId,
    search,
    treeProps,
    hatProps,
    wearerProps,
  }: {
    chainId: number;
    search: string;
    treeProps: TreeConfig;
    hatProps: HatConfig;
    wearerProps: WearerConfig;
  }): Promise<{ trees: Tree[]; hats: Hat[]; wearers: Wearer[] }> {
    const treeValidationRes = treeConfigSchema.safeParse(treeProps);
    if (treeValidationRes.success === false) {
      throw new InputValidationError(treeValidationRes.error.message);
    }

    const hatValidationRes = hatConfigSchema.safeParse(hatProps);
    if (hatValidationRes.success === false) {
      throw new InputValidationError(hatValidationRes.error.message);
    }

    const wearerValidationRes = wearerConfigSchema.safeParse(wearerProps);
    if (wearerValidationRes.success === false) {
      throw new InputValidationError(wearerValidationRes.error.message);
    }

    const treeNormalizedProps = normalizeProps(treeProps);
    const treeQueryFields = normalizedPropsToQueryFields(treeNormalizedProps);

    const hatNormalizedProps = normalizeProps(hatProps);
    const hatQueryFields = normalizedPropsToQueryFields(hatNormalizedProps);

    const wearerNormalizedProps = normalizeProps(wearerProps);
    const wearerQueryFields = normalizedPropsToQueryFields(
      wearerNormalizedProps
    );

    const query = gql`
      query search($search: String!) {
        trees(where: { id: $search }) {
          ${treeQueryFields}
        }
        hats(where: { or: [{ id: $search }, { prettyId: $search }] }) {
          ${hatQueryFields}
        }
        wearers(where: { id: $search }) {
          ${wearerQueryFields}
        }
      }
    `;

    const respone = await this._makeGqlRequest<{
      trees: Tree[];
      hats: Hat[];
      wearers: Wearer[];
    }>(chainId, query, {
      search,
      numHats: 1000,
      numWearers: 1000,
    });

    if (!respone.wearers || !respone.trees || !respone.hats) {
      throw new Error("Unexpected error");
    }

    return respone;
  }
}