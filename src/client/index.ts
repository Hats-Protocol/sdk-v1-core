import { getGraphqlClient } from "../subgraph/index";
import { GraphQLClient, Variables } from "graphql-request";
import { GET_HAT } from "../subgraph/queries";
import type { GqlHat } from "../subgraph/types";

export class HatsClient {
  readonly chainId: number;
  private readonly _graphqlClient: GraphQLClient | undefined;

  constructor({ chainId }: { chainId: number }) {
    this.chainId = chainId;
    this._graphqlClient = getGraphqlClient(chainId);
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

  async getHat({ hatId }: { hatId: string }): Promise<GqlHat> {
    const respone = await this._makeGqlRequest<{ hat: GqlHat }>(GET_HAT, {
      id: hatId,
    });
    if (!respone.hat) {
      throw new Error();
    }

    return respone.hat;
  }
}
