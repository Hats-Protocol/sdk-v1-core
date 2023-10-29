import { gql } from "graphql-request";
import { HatsSubgraphClient } from "../src/index";
import { getGraphqlClient } from "../src/endpoints";
import type { GraphQLClient } from "graphql-request";

describe("Client Tests", () => {
  let client: HatsSubgraphClient;

  beforeAll(() => {
    client = new HatsSubgraphClient();
  });

  describe("getHat Tests", () => {
    test("Scenario 1", async () => {
      const res = await client.getHat({
        chainId: 10,
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        props: {
          prettyId: true,
          eligibility: true,
          wearers: {},
          admin: {
            prettyId: true,
            eligibility: true,
            subHats: { prettyId: true, eligibility: true },
          },
        },
      });

      const query = gql`
        query getHat($id: ID!) {
          hat(id: $id) {
            id
            prettyId
            eligibility
            wearers(first: 1000) {
              id
            }
            admin {
              id
              prettyId
              eligibility
              subHats {
                id
                prettyId
                eligibility
              }
            }
          }
        }
      `;
      const gqlClient = getGraphqlClient(10) as GraphQLClient;

      const ref = (await gqlClient.request(query, {
        id: "0x0000000100020001000100000000000000000000000000000000000000000000",
      })) as { hat: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hat));
    }, 30000);
  });

  describe("getHatsByIds Tests", () => {
    test("Scenario 1", async () => {
      const res = await client.getHatsByIds({
        chainId: 10,
        hatIds: [
          BigInt(
            "0x0000000100020001000100000000000000000000000000000000000000000000"
          ),
          BigInt(
            "0x0000000100020001000000000000000000000000000000000000000000000000"
          ),
        ],
        props: {
          prettyId: true,
          admin: {
            prettyId: true,
            subHats: {
              prettyId: true,
            },
          },
        },
      });

      const query = gql`
        query getHat($ids: [ID!]!) {
          hats(where: { id_in: $ids }) {
            id
            prettyId
            admin {
              id
              prettyId
              subHats {
                id
                prettyId
              }
            }
          }
        }
      `;
      const gqlClient = getGraphqlClient(10) as GraphQLClient;

      const ref = (await gqlClient.request(query, {
        ids: [
          "0x0000000100020001000100000000000000000000000000000000000000000000",
          "0x0000000100020001000000000000000000000000000000000000000000000000",
        ],
      })) as { hats: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hats));
    }, 30000);
  });

  describe("getTree Tests", () => {
    test("Scenario 1", async () => {
      const res = await client.getTree({
        chainId: 10,
        treeId: 1,
        props: {
          hats: {
            prettyId: true,
            admin: {
              prettyId: true,
            },
          },
        },
      });

      const query = gql`
        query getTree($id: ID!) {
          tree(id: $id) {
            id
            hats(first: 1000) {
              id
              prettyId
              admin {
                id
                prettyId
              }
            }
          }
        }
      `;
      const gqlClient = getGraphqlClient(10) as GraphQLClient;

      const ref = (await gqlClient.request(query, {
        id: "0x00000001",
      })) as { tree: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.tree));
    }, 30000);
  });

  describe("getTreesByIds Tests", () => {
    test("Scenario 1", async () => {
      const res = await client.getTreesByIds({
        chainId: 10,
        props: {
          hats: {
            prettyId: true,
            admin: {
              prettyId: true,
            },
          },
        },
        treeIds: [1, 2],
      });

      const query = gql`
        query getTreesById($ids: [ID!]!) {
          trees(where: { id_in: $ids }) {
            id
            hats {
              id
              prettyId
              admin {
                id
                prettyId
              }
            }
          }
        }
      `;
      const gqlClient = getGraphqlClient(10) as GraphQLClient;

      const ref = (await gqlClient.request(query, {
        ids: ["0x00000001", "0x00000002"],
      })) as { trees: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.trees));
    });
  });

  describe("getTreesPaginated Tests", () => {
    test("Scenario 1", async () => {
      const res = await client.getTreesPaginated({
        chainId: 10,
        props: {
          hats: {
            prettyId: true,
            admin: {
              prettyId: true,
            },
          },
        },
        page: 3,
        perPage: 10,
        numHatsPerTree: 1,
      });

      const query = gql`
        query getPaginatedTrees($skip: Int!, $first: Int!) {
          trees(skip: $skip, first: $first) {
            id
            hats(first: 1) {
              id
              prettyId
              admin {
                id
                prettyId
              }
            }
          }
        }
      `;
      const gqlClient = getGraphqlClient(10) as GraphQLClient;

      const ref = (await gqlClient.request(query, {
        skip: 30,
        first: 10,
      })) as { trees: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.trees));
    });
  });

  describe("getWearer Tests", () => {
    test("Scenario 1", async () => {
      const res = await client.getWearer({
        chainId: 10,
        props: {
          currentHats: {
            prettyId: true,
          },
          mintEvent: {
            hat: {
              prettyId: true,
            },
          },
        },
        wearerAddress: "0xEb2ee1250DC8C954dA4efF4DF0E4467A1ca6af6c",
      });

      const query = gql`
        query getCurrentHatsForWearer($id: ID!) {
          wearer(id: $id) {
            id
            currentHats {
              id
              prettyId
            }
            mintEvent {
              id
              hat {
                id
                prettyId
              }
            }
          }
        }
      `;
      const gqlClient = getGraphqlClient(10) as GraphQLClient;

      const ref = (await gqlClient.request(query, {
        id: "0xEb2ee1250DC8C954dA4efF4DF0E4467A1ca6af6c".toLowerCase(),
      })) as { wearer: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.wearer));
    });
  });

  describe("getWearersOfHatPaginated Tests", () => {
    test("Scenario 1", async () => {
      const res = await client.getWearersOfHatPaginated({
        chainId: 10,
        props: {},
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        page: 0,
        perPage: 2,
      });

      const query = gql`
        query getPaginatedWearersForHat(
          $hatId: ID!
          $first: Int!
          $skip: Int!
        ) {
          wearers(
            skip: $skip
            first: $first
            where: { currentHats_: { id: $hatId } }
          ) {
            id
          }
        }
      `;
      const gqlClient = getGraphqlClient(10) as GraphQLClient;

      const ref = (await gqlClient.request(query, {
        hatId:
          "0x0000000100020001000100000000000000000000000000000000000000000000",
        first: 2,
        skip: 0,
      })) as { wearers: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.wearers));
    });
  });

  describe("searchTreesHatsWearers Tests", () => {
    test("Scenario 1", async () => {
      const res = await client.searchTreesHatsWearers({
        chainId: 10,
        search:
          "0x0000000100020001000100000000000000000000000000000000000000000000",
        treeProps: {},
        hatProps: {},
        wearerProps: {},
      });

      const query = gql`
        query search($search: String!) {
          trees(where: { id: $search }) {
            id
          }
          hats(where: { or: [{ id: $search }, { prettyId: $search }] }) {
            id
          }
          wearers(where: { id: $search }) {
            id
          }
        }
      `;
      const gqlClient = getGraphqlClient(10) as GraphQLClient;

      const ref = (await gqlClient.request(query, {
        search:
          "0x0000000100020001000100000000000000000000000000000000000000000000",
      })) as { trees: any; hats: any; wearers: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref));
    });
  });
});
