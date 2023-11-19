import {
  treeIdDecimalToHex,
  hatIdDecimalToHex,
  normalizeProps,
  normalizedPropsToQueryFields,
} from "./utils";
import { gql, Variables, GraphQLClient } from "graphql-request";
import { DEFAULT_ENDPOINTS_CONFIG } from "./endpoints";
import {
  SubgraphNotUpportedError,
  SubgraphHatNotExistError,
  SubgraphTreeNotExistError,
  SubgraphWearerNotExistError,
  InputValidationError,
} from "./errors";
import {
  hatPropsConfigSchema,
  treePropsConfigSchema,
  wearerPropsConfigSchema,
} from "./schemas";
import type {
  Hat,
  Tree,
  HatPropsConfig,
  TreePropsConfig,
  WearerPropsConfig,
  Wearer,
  EndpointsConfig,
} from "./types";

export class HatsSubgraphClient {
  protected readonly _config: EndpointsConfig;

  constructor({ config }: { config?: EndpointsConfig }) {
    if (config === undefined) {
      this._config = DEFAULT_ENDPOINTS_CONFIG;
    } else {
      this._config = config;
    }
  }

  protected async _makeGqlRequest<ResponseType>(
    chainId: number,
    query: string,
    variables?: Variables
  ): Promise<ResponseType> {
    if (this._config[chainId] === undefined) {
      throw new SubgraphNotUpportedError(
        `No subgraph support for network id ${chainId}`
      );
    }
    const client = new GraphQLClient(this._config[chainId].endpoint);

    const result = (await client.request(query, variables)) as ResponseType;

    return result;
  }

  /**
   * Get a Hat by its ID.
   * The Hat's properties to fetch are configurable, including nested objects.
   *
   * @param chainId Id of the chain to fetch from.
   * @param hatId ID of the Hat to fetch.
   * @param props Hat's properties to fetch, including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param filters Optional filters to include in the query.
   * @returns A Hat object.
   *
   * @throws InputValidationError
   * Thrown if the provided properties are invalid.
   *
   * @throws SubgraphHatNotExistError
   * Thrown if the Hat does not exist in the subgraph.
   */
  async getHat({
    chainId,
    hatId,
    props,
  }: {
    chainId: number;
    hatId: bigint;
    props: HatPropsConfig;
  }): Promise<Hat> {
    const validationRes = hatPropsConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const hatIdHex = hatIdDecimalToHex(hatId);

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getHat($id: ID!) {
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

  /**
   * Get Hats by their IDs.
   * The properties to fetch for each Hat are configurable, including nested objects.
   *
   * @param chainId Id of the chain to fetch from.
   * @param hatIds IDs of the Hats to fetch.
   * @param props Hat's properties to fetch, including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param filters Optional filters to include in the query.
   * @returns An array of Hat objects.
   *
   * @throws InputValidationError
   * Thrown if the provided properties are invalid.
   *
   * @throws SubgraphHatNotExistError
   * Thrown if one or more of the Hats do not exist in the subgraph.
   */
  async getHatsByIds({
    chainId,
    hatIds,
    props,
  }: {
    chainId: number;
    hatIds: bigint[];
    props: HatPropsConfig;
  }): Promise<Hat[]> {
    const validationRes = hatPropsConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

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

  /**
   * Get a Tree by its ID.
   * The Tree's properties to fetch are configurable, including nested objects.
   *
   * @param chainId Id of the chain to fetch from.
   * @param treeId ID of the Tree to fetch (the tree's top-hat domain - first 4 bytes of the top-hat ID).
   * @param props Tree's properties to fetch, including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param filters Optional filters to include in the query.
   * @returns A Tree object.
   *
   * @throws InputValidationError
   * Thrown if the provided properties are invalid.
   *
   * @throws SubgraphTreeNotExistError
   * Thrown if the Tree does not exist in the subgraph.
   */
  async getTree({
    chainId,
    treeId,
    props,
  }: {
    chainId: number;
    treeId: number;
    props: TreePropsConfig;
  }): Promise<Tree> {
    const validationRes = treePropsConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const treeIdHex = treeIdDecimalToHex(treeId);

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getTree($id: ID!) {
        tree(id: $id) {
          ${queryFields}
        }
      }
    `;

    const respone = await this._makeGqlRequest<{ tree: Tree }>(chainId, query, {
      id: treeIdHex,
    });

    if (!respone.tree) {
      throw new SubgraphTreeNotExistError(
        `Tree with an ID of ${treeId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.tree;
  }

  /**
   * Get Trees by their IDs.
   * The properties to fetch for each Tree are configurable, including nested objects.
   *
   * @param chainId Id of the chain to fetch from.
   * @param treeIds ID of the Trees to fetch (the tree's top-hat domain - first 4 bytes of the top-hat ID).
   * @param props Tree's properties to fetch, including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param filters Optional filters to include in the query.
   * @returns An array of Tree objects.
   *
   * @throws InputValidationError
   * Thrown if the provided properties are invalid.
   *
   * @throws SubgraphTreeNotExistError
   * Thrown if one or more of the Trees do not exist in the subgraph.
   */
  async getTreesByIds({
    chainId,
    treeIds,
    props,
  }: {
    chainId: number;
    treeIds: number[];
    props: TreePropsConfig;
  }): Promise<Tree[]> {
    const validationRes = treePropsConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const treeIdsHex = treeIds.map((treeId) => treeIdDecimalToHex(treeId));

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
    query getTreesById($ids: [ID!]!) {
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
      }
    );

    if (!respone.trees || respone.trees.length < treeIds.length) {
      throw new SubgraphTreeNotExistError(
        `One or more of the provided trees do not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.trees;
  }

  /**
   * Paginate over all existing Trees.
   * The properties to fetch for each Tree are configurable, including nested objects.
   *
   * @param chainId Id of the chain to fetch from.
   * @param props Tree's properties to fetch, including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param page Number of page to fetch.
   * @param perPage Number of Trees to fetch in each page.
   * @param filters - Optional filters to include in the query.
   * @returns An array of Tree objects.
   *
   * @throws InputValidationError
   * Thrown if the provided properties are invalid.
   */
  async getTreesPaginated({
    chainId,
    props,
    page,
    perPage,
  }: {
    chainId: number;
    props: TreePropsConfig;
    page: number;
    perPage: number;
  }): Promise<Tree[]> {
    const validationRes = treePropsConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
    query getPaginatedTrees($skip: Int!, $first: Int!) {
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
      }
    );

    if (!respone.trees) {
      throw new Error("Unexpected error");
    }

    return respone.trees;
  }

  /**
   * Get Wearer by its address.
   * The properties to fetch for each Wearer are configurable, including nested objects.
   *
   * @param chainId Id of the chain to fetch from.
   * @param wearerAddress Address of the wearer.
   * @param props Wearer's properties to fetch, including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param filters Optional filters to include in the query.
   * @returns A Wearer object.
   *
   * @throws InputValidationError
   * Thrown if the provided properties are invalid.
   *
   * @throws SubgraphWearerNotExistError
   * Thrown if the Wearer does not exist in the subgraph.
   */
  async getWearer({
    chainId,
    wearerAddress,
    props,
  }: {
    chainId: number;
    wearerAddress: `0x${string}`;
    props: WearerPropsConfig;
  }): Promise<Wearer> {
    const validationRes = wearerPropsConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

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
      }
    );

    if (!respone.wearer) {
      throw new SubgraphWearerNotExistError(
        `Wearer with an address of ${wearerAddress} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.wearer;
  }

  /**
   * Paginate over the Wearers of a Hat.
   * The properties to fetch for each Wearer are configurable, including nested objects.
   *
   * @param chainId Id of the chain to fetch from.
   * @param hatId ID of the Hat for which Wearers to fetch.
   * @param props Wearer's properties to fetch, including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param page Number of page to fetch.
   * @param perPage Number of Wearers to fetch in each page.
   * @param filters Optional filters to include in the query.
   * @returns A Wearer object.
   *
   * @throws InputValidationError
   * Thrown if the provided properties are invalid.
   *
   * @throws SubgraphHatNotExistError
   * Thrown if the Hat does not exist in the subgraph.
   */
  async getWearersOfHatPaginated({
    chainId,
    hatId,
    props,
    page,
    perPage,
  }: {
    chainId: number;
    hatId: bigint;
    props: WearerPropsConfig;
    page: number;
    perPage: number;
  }): Promise<Wearer[]> {
    const validationRes = wearerPropsConfigSchema.safeParse(props);
    if (validationRes.success === false) {
      throw new InputValidationError(validationRes.error.message);
    }

    const hatIdHex = hatIdDecimalToHex(hatId);

    const normalizedProps = normalizeProps(props);
    const queryFields = normalizedPropsToQueryFields(normalizedProps);

    const query = gql`
      query getPaginatedWearersForHat($hatId: ID!, $first: Int!, $skip: Int!) {
        hat(id: $hatId) {
            wearers(skip: $skip, first: $first) {
                ${queryFields}
            }
        }
      }
    `;

    const respone = await this._makeGqlRequest<{ hat: { wearers: Wearer[] } }>(
      chainId,
      query,
      {
        hatId: hatIdHex,
        skip: page * perPage,
        first: perPage,
      }
    );

    if (!respone.hat) {
      throw new SubgraphHatNotExistError(
        `Hat with an ID of ${hatId} does not exist in the subgraph for chain ID ${chainId}`
      );
    }

    return respone.hat.wearers;
  }

  /**
   * Search Hat, Tree or Wearer by ID.
   * The properties to fetch for each object are configurable, including nested objects.
   *
   * @param chainId Id of the chain to fetch from.
   * @param search ID to search for (Hat ID or pretty ID, Tree ID or Wearer address).
   * @param treeProps Tree's properties to fetch (if Tree was found), including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param hatProps Hat's properties to fetch (if Hat was found), including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param wearerProps Wearer's properties to fetch (if Wearer was found), including the properties of nested objects. Pass an empty object to include only the object's ID.
   * @param filters Optional filters to include in the query.
   * @returns An object containing the search result.
   *
   * @throws InputValidationError
   * Thrown if the provided properties are invalid.
   */
  async searchTreesHatsWearers({
    chainId,
    search,
    treeProps,
    hatProps,
    wearerProps,
  }: {
    chainId: number;
    search: string;
    treeProps: TreePropsConfig;
    hatProps: HatPropsConfig;
    wearerProps: WearerPropsConfig;
  }): Promise<{ trees: Tree[]; hats: Hat[]; wearers: Wearer[] }> {
    const treeValidationRes = treePropsConfigSchema.safeParse(treeProps);
    if (treeValidationRes.success === false) {
      throw new InputValidationError(treeValidationRes.error.message);
    }

    const hatValidationRes = hatPropsConfigSchema.safeParse(hatProps);
    if (hatValidationRes.success === false) {
      throw new InputValidationError(hatValidationRes.error.message);
    }

    const wearerValidationRes = wearerPropsConfigSchema.safeParse(wearerProps);
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
      search: search.toLowerCase(),
    });

    if (!respone.wearers || !respone.trees || !respone.hats) {
      throw new Error("Unexpected error");
    }

    return respone;
  }
}
