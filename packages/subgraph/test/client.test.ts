/* eslint-disable @typescript-eslint/ban-ts-comment */
import { gql } from "graphql-request";
import { HatsSubgraphClient, DEFAULT_ENDPOINTS_CONFIG } from "../src/index";
import {
  SubgraphNotUpportedError,
  SubgraphHatNotExistError,
  SubgraphTreeNotExistError,
  SubgraphWearerNotExistError,
  InputValidationError,
} from "../src/errors";
import { GraphQLClient } from "graphql-request";

describe("Client Tests", () => {
  let client: HatsSubgraphClient;

  beforeAll(() => {
    client = new HatsSubgraphClient({});
  });

  test("Test unsupported chain ID", async () => {
    expect(async () => {
      await client.getHat({
        chainId: 0,
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        props: {},
      });
    }).rejects.toThrow(SubgraphNotUpportedError);
  });

  describe("getHat Tests", () => {
    test("Test hat not exists error", async () => {
      expect(async () => {
        await client.getHat({
          chainId: 10,
          hatId: BigInt(
            "0x1111111100020001000100000000000000000000000000000000000000000000"
          ),
          props: {},
        });
      }).rejects.toThrow(SubgraphHatNotExistError);
    });

    test("Test validation", async () => {
      expect(async () => {
        await client.getHat({
          chainId: 10,
          hatId: BigInt(
            "0x1111111100020001000100000000000000000000000000000000000000000000"
          ),
          props: {
            // @ts-ignore
            noSuchProp: true,
          },
        });
      }).rejects.toThrow(InputValidationError);
    });

    test("Scenario 1", async () => {
      const res = await client.getHat({
        chainId: 10,
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        props: {
          prettyId: true,
          eligibility: true,
          wearers: {
            props: {},
          },
          admin: {
            prettyId: true,
            eligibility: true,
            subHats: { props: { prettyId: true, eligibility: true } },
          },
        },
      });

      const query = gql`
        query getHat($id: ID!) {
          hat(id: $id) {
            id
            prettyId
            eligibility
            wearers {
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
      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        id: "0x0000000100020001000100000000000000000000000000000000000000000000",
      })) as { hat: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hat));
    }, 30000);

    test("Scenario 2", async () => {
      const res = await client.getHat({
        chainId: 10,
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        props: {
          prettyId: true,
          status: true,
          createdAt: true,
          details: true,
          maxSupply: true,
          eligibility: true,
          toggle: true,
          mutable: true,
          imageUri: true,
          levelAtLocalTree: true,
          currentSupply: true,
          tree: {},
          wearers: {
            props: {},
          },
          admin: {},
          badStandings: {
            props: {},
          },
          claimableBy: {
            props: {},
          },
          claimableForBy: {
            props: {},
          },
          linkRequestFromTree: {
            props: {},
          },
          subHats: {
            props: {},
          },
          linkedTrees: {
            props: {},
          },
          events: {
            props: {},
          },
        },
      });

      const query = gql`
        query getHat($id: ID!) {
          hat(id: $id) {
            id
            prettyId
            status
            createdAt
            details
            maxSupply
            eligibility
            toggle
            mutable
            imageUri
            levelAtLocalTree
            currentSupply
            tree {
              id
            }
            wearers {
              id
            }
            admin {
              id
            }
            badStandings {
              id
            }
            claimableBy {
              id
            }
            claimableForBy {
              id
            }
            linkRequestFromTree {
              id
            }
            subHats {
              id
            }
            linkedTrees {
              id
            }
            events(orderBy: timestamp, orderDirection: desc) {
              id
              __typename
              ... on HatCreatedEvent {
                hatDetails
                hatMaxSupply
                hatEligibility
                hatToggle
                hatMutable
                hatImageUri
              }
              ... on HatMintedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatBurnedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatStatusChangedEvent {
                hatNewStatus
              }
              ... on HatDetailsChangedEvent {
                hatNewDetails
              }
              ... on HatEligibilityChangedEvent {
                hatNewEligibility
              }
              ... on HatToggleChangedEvent {
                hatNewToggle
              }
              ... on HatMaxSupplyChangedEvent {
                hatNewMaxSupply
              }
              ... on HatImageURIChangedEvent {
                hatNewImageURI
              }
              ... on TopHatLinkRequestedEvent {
                newAdmin
              }
              ... on TopHatLinkedEvent {
                newAdmin
              }
              ... on WearerStandingChangedEvent {
                wearer {
                  id
                }
                wearerStanding
              }
            }
          }
        }
      `;
      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        id: "0x0000000100020001000100000000000000000000000000000000000000000000",
      })) as { hat: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hat));
    }, 30000);

    test("Scenario 3", async () => {
      const res = await client.getHat({
        chainId: 10,
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        props: {
          prettyId: true,
          status: true,
          createdAt: true,
          details: true,
          maxSupply: true,
          eligibility: true,
          toggle: true,
          mutable: true,
          imageUri: true,
          levelAtLocalTree: true,
          currentSupply: true,
          tree: {
            hats: {
              props: {},
            },
            childOfTree: {},
            linkedToHat: {},
            requestedLinkToTree: {},
            requestedLinkToHat: {},
            linkRequestFromTree: { props: {} },
            parentOfTrees: { props: {} },
            events: { props: {} },
          },
          wearers: {
            props: {
              currentHats: { props: {} },
              mintEvent: { props: {} },
              burnEvent: { props: {} },
            },
          },
          admin: {
            prettyId: true,
            status: true,
            createdAt: true,
            details: true,
            maxSupply: true,
            eligibility: true,
            toggle: true,
            mutable: true,
            imageUri: true,
            levelAtLocalTree: true,
            currentSupply: true,
            tree: {},
            wearers: { props: {} },
            admin: {},
            badStandings: { props: {} },
            claimableBy: { props: {} },
            claimableForBy: { props: {} },
            linkRequestFromTree: { props: {} },
            subHats: { props: {} },
            linkedTrees: { props: {} },
            events: { props: {} },
          },
          badStandings: {
            props: {
              currentHats: { props: {} },
              mintEvent: { props: {} },
              burnEvent: { props: {} },
            },
          },
          claimableBy: {
            props: {
              claimableHats: { props: {} },
              claimableForHats: { props: {} },
            },
          },
          claimableForBy: {
            props: {
              claimableHats: { props: {} },
              claimableForHats: { props: {} },
            },
          },
          linkRequestFromTree: {
            props: {
              hats: { props: {} },
              childOfTree: {},
              linkedToHat: {},
              requestedLinkToTree: {},
              requestedLinkToHat: {},
              linkRequestFromTree: { props: {} },
              parentOfTrees: { props: {} },
              events: { props: {} },
            },
          },
          subHats: {
            props: {
              prettyId: true,
              status: true,
              createdAt: true,
              details: true,
              maxSupply: true,
              eligibility: true,
              toggle: true,
              mutable: true,
              imageUri: true,
              levelAtLocalTree: true,
              currentSupply: true,
              tree: {},
              wearers: { props: {} },
              admin: {},
              badStandings: { props: {} },
              claimableBy: { props: {} },
              claimableForBy: { props: {} },
              linkRequestFromTree: { props: {} },
              subHats: { props: {} },
              linkedTrees: { props: {} },
              events: { props: {} },
            },
          },
          linkedTrees: {
            props: {
              hats: { props: {} },
              childOfTree: {},
              linkedToHat: {},
              requestedLinkToTree: {},
              requestedLinkToHat: {},
              linkRequestFromTree: { props: {} },
              parentOfTrees: { props: {} },
              events: { props: {} },
            },
          },
          events: {
            props: {
              blockNumber: true,
              timestamp: true,
              transactionID: true,
            },
          },
        },
      });

      const query = gql`
        query getHat($id: ID!) {
          hat(id: $id) {
            id
            prettyId
            status
            createdAt
            details
            maxSupply
            eligibility
            toggle
            mutable
            imageUri
            levelAtLocalTree
            currentSupply
            tree {
              id
              hats {
                id
              }
              childOfTree {
                id
              }
              linkedToHat {
                id
              }
              requestedLinkToTree {
                id
              }
              requestedLinkToHat {
                id
              }
              linkRequestFromTree {
                id
              }
              parentOfTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            wearers {
              id
              currentHats {
                id
              }
              mintEvent {
                id
              }
              burnEvent {
                id
              }
            }
            admin {
              id
              prettyId
              status
              createdAt
              details
              maxSupply
              eligibility
              toggle
              mutable
              imageUri
              levelAtLocalTree
              currentSupply
              tree {
                id
              }
              wearers {
                id
              }
              admin {
                id
              }
              badStandings {
                id
              }
              claimableBy {
                id
              }
              claimableForBy {
                id
              }
              linkRequestFromTree {
                id
              }
              subHats {
                id
              }
              linkedTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            badStandings {
              id
              currentHats {
                id
              }
              mintEvent {
                id
              }
              burnEvent {
                id
              }
            }
            claimableBy {
              id
              claimableHats {
                id
              }
              claimableForHats {
                id
              }
            }
            claimableForBy {
              id
              claimableHats {
                id
              }
              claimableForHats {
                id
              }
            }
            linkRequestFromTree {
              id
              hats {
                id
              }
              childOfTree {
                id
              }
              linkedToHat {
                id
              }
              requestedLinkToTree {
                id
              }
              requestedLinkToHat {
                id
              }
              linkRequestFromTree {
                id
              }
              parentOfTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            subHats {
              id
              prettyId
              status
              createdAt
              details
              maxSupply
              eligibility
              toggle
              mutable
              imageUri
              levelAtLocalTree
              currentSupply
              tree {
                id
              }
              wearers {
                id
              }
              admin {
                id
              }
              badStandings {
                id
              }
              claimableBy {
                id
              }
              claimableForBy {
                id
              }
              linkRequestFromTree {
                id
              }
              subHats {
                id
              }
              linkedTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            linkedTrees {
              id
              hats {
                id
              }
              childOfTree {
                id
              }
              linkedToHat {
                id
              }
              requestedLinkToTree {
                id
              }
              requestedLinkToHat {
                id
              }
              linkRequestFromTree {
                id
              }
              parentOfTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            events(orderBy: timestamp, orderDirection: desc) {
              id
              blockNumber
              timestamp
              transactionID
              __typename
              ... on HatCreatedEvent {
                hatDetails
                hatMaxSupply
                hatEligibility
                hatToggle
                hatMutable
                hatImageUri
              }
              ... on HatMintedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatBurnedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatStatusChangedEvent {
                hatNewStatus
              }
              ... on HatDetailsChangedEvent {
                hatNewDetails
              }
              ... on HatEligibilityChangedEvent {
                hatNewEligibility
              }
              ... on HatToggleChangedEvent {
                hatNewToggle
              }
              ... on HatMaxSupplyChangedEvent {
                hatNewMaxSupply
              }
              ... on HatImageURIChangedEvent {
                hatNewImageURI
              }
              ... on TopHatLinkRequestedEvent {
                newAdmin
              }
              ... on TopHatLinkedEvent {
                newAdmin
              }
              ... on WearerStandingChangedEvent {
                wearer {
                  id
                }
                wearerStanding
              }
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        id: "0x0000000100020001000100000000000000000000000000000000000000000000",
      })) as { hat: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hat));
    }, 30000);

    test("Scenario 4", async () => {
      const res = await client.getHat({
        chainId: 10,
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        props: {
          prettyId: true,
          status: true,
          createdAt: true,
          details: true,
          maxSupply: true,
          eligibility: true,
          toggle: true,
          mutable: true,
          imageUri: true,
          levelAtLocalTree: true,
          currentSupply: true,
          tree: {},
          wearers: { props: {}, filters: { first: 1 } },
          admin: {},
          badStandings: { props: {} },
          claimableBy: { props: {} },
          claimableForBy: { props: {} },
          linkRequestFromTree: { props: {} },
          subHats: {
            props: {},
            filters: { first: 1 },
          },
          linkedTrees: { props: {} },
          events: { props: {}, filters: { first: 1 } },
        },
      });

      const query = gql`
        query getHat($id: ID!) {
          hat(id: $id) {
            id
            prettyId
            status
            createdAt
            details
            maxSupply
            eligibility
            toggle
            mutable
            imageUri
            levelAtLocalTree
            currentSupply
            tree {
              id
            }
            wearers(first: 1) {
              id
            }
            admin {
              id
            }
            badStandings {
              id
            }
            claimableBy {
              id
            }
            claimableForBy {
              id
            }
            linkRequestFromTree {
              id
            }
            subHats(first: 1) {
              id
            }
            linkedTrees {
              id
            }
            events(orderBy: timestamp, orderDirection: desc, first: 1) {
              id
              __typename
              ... on HatCreatedEvent {
                hatDetails
                hatMaxSupply
                hatEligibility
                hatToggle
                hatMutable
                hatImageUri
              }
              ... on HatMintedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatBurnedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatStatusChangedEvent {
                hatNewStatus
              }
              ... on HatDetailsChangedEvent {
                hatNewDetails
              }
              ... on HatEligibilityChangedEvent {
                hatNewEligibility
              }
              ... on HatToggleChangedEvent {
                hatNewToggle
              }
              ... on HatMaxSupplyChangedEvent {
                hatNewMaxSupply
              }
              ... on HatImageURIChangedEvent {
                hatNewImageURI
              }
              ... on TopHatLinkRequestedEvent {
                newAdmin
              }
              ... on TopHatLinkedEvent {
                newAdmin
              }
              ... on WearerStandingChangedEvent {
                wearer {
                  id
                }
                wearerStanding
              }
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        id: "0x0000000100020001000100000000000000000000000000000000000000000000",
      })) as { hat: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hat));
    }, 30000);
  });

  describe("getHatsByIds Tests", () => {
    test("Test hats not exist", () => {
      expect(async () => {
        await client.getHatsByIds({
          chainId: 10,
          hatIds: [
            BigInt(
              "0x1111111100020001000100000000000000000000000000000000000000000000"
            ),
            BigInt(
              "0x0000000100020001000000000000000000000000000000000000000000000000"
            ),
          ],
          props: {},
        });
      }).rejects.toThrow(SubgraphHatNotExistError);
    });

    test("Test validation 1", () => {
      expect(async () => {
        await client.getHatsByIds({
          chainId: 10,
          hatIds: [
            BigInt(
              "0x1111111100020001000100000000000000000000000000000000000000000000"
            ),
            BigInt(
              "0x0000000100020001000000000000000000000000000000000000000000000000"
            ),
          ],
          props: {
            // @ts-ignore
            noSuchProp: true,
          },
        });
      }).rejects.toThrow(InputValidationError);
    });

    test("Test validation 1", () => {
      expect(async () => {
        await client.getHatsByIds({
          chainId: 10,
          hatIds: [
            BigInt(
              "0x1111111100020001000100000000000000000000000000000000000000000000"
            ),
            BigInt(
              "0x0000000100020001000000000000000000000000000000000000000000000000"
            ),
          ],
          props: {
            wearers: {
              // @ts-ignore
              noSuchProp: true,
            },
          },
        });
      }).rejects.toThrow(InputValidationError);
    });

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
              props: { prettyId: true },
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        ids: [
          "0x0000000100020001000100000000000000000000000000000000000000000000",
          "0x0000000100020001000000000000000000000000000000000000000000000000",
        ],
      })) as { hats: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hats));
    }, 30000);

    test("Scenario 2", async () => {
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
          status: true,
          createdAt: true,
          details: true,
          maxSupply: true,
          eligibility: true,
          toggle: true,
          mutable: true,
          imageUri: true,
          levelAtLocalTree: true,
          currentSupply: true,
          tree: {},
          wearers: { props: {} },
          admin: {},
          badStandings: { props: {} },
          claimableBy: { props: {} },
          claimableForBy: { props: {} },
          linkRequestFromTree: { props: {} },
          subHats: { props: {} },
          linkedTrees: { props: {} },
          events: { props: {} },
        },
      });

      const query = gql`
        query getHat($ids: [ID!]!) {
          hats(where: { id_in: $ids }) {
            id
            prettyId
            status
            createdAt
            details
            maxSupply
            eligibility
            toggle
            mutable
            imageUri
            levelAtLocalTree
            currentSupply
            tree {
              id
            }
            wearers {
              id
            }
            admin {
              id
            }
            badStandings {
              id
            }
            claimableBy {
              id
            }
            claimableForBy {
              id
            }
            linkRequestFromTree {
              id
            }
            subHats {
              id
            }
            linkedTrees {
              id
            }
            events(orderBy: timestamp, orderDirection: desc) {
              id
              __typename
              ... on HatCreatedEvent {
                hatDetails
                hatMaxSupply
                hatEligibility
                hatToggle
                hatMutable
                hatImageUri
              }
              ... on HatMintedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatBurnedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatStatusChangedEvent {
                hatNewStatus
              }
              ... on HatDetailsChangedEvent {
                hatNewDetails
              }
              ... on HatEligibilityChangedEvent {
                hatNewEligibility
              }
              ... on HatToggleChangedEvent {
                hatNewToggle
              }
              ... on HatMaxSupplyChangedEvent {
                hatNewMaxSupply
              }
              ... on HatImageURIChangedEvent {
                hatNewImageURI
              }
              ... on TopHatLinkRequestedEvent {
                newAdmin
              }
              ... on TopHatLinkedEvent {
                newAdmin
              }
              ... on WearerStandingChangedEvent {
                wearer {
                  id
                }
                wearerStanding
              }
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        ids: [
          "0x0000000100020001000100000000000000000000000000000000000000000000",
          "0x0000000100020001000000000000000000000000000000000000000000000000",
        ],
      })) as { hats: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hats));
    }, 30000);

    test("Scenario 3", async () => {
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
          status: true,
          createdAt: true,
          details: true,
          maxSupply: true,
          eligibility: true,
          toggle: true,
          mutable: true,
          imageUri: true,
          levelAtLocalTree: true,
          currentSupply: true,
          tree: {
            hats: { props: {} },
            childOfTree: {},
            linkedToHat: {},
            requestedLinkToTree: {},
            requestedLinkToHat: {},
            linkRequestFromTree: { props: {} },
            parentOfTrees: { props: {} },
            events: { props: {} },
          },
          wearers: {
            props: {
              currentHats: { props: {} },
              mintEvent: { props: {} },
              burnEvent: { props: {} },
            },
          },
          admin: {
            prettyId: true,
            status: true,
            createdAt: true,
            details: true,
            maxSupply: true,
            eligibility: true,
            toggle: true,
            mutable: true,
            imageUri: true,
            levelAtLocalTree: true,
            currentSupply: true,
            tree: {},
            wearers: { props: {} },
            admin: {},
            badStandings: { props: {} },
            claimableBy: { props: {} },
            claimableForBy: { props: {} },
            linkRequestFromTree: { props: {} },
            subHats: { props: {} },
            linkedTrees: { props: {} },
            events: { props: {} },
          },
          badStandings: {
            props: {
              currentHats: { props: {} },
              mintEvent: { props: {} },
              burnEvent: { props: {} },
            },
          },
          claimableBy: {
            props: {
              claimableHats: { props: {} },
              claimableForHats: { props: {} },
            },
          },
          claimableForBy: {
            props: {
              claimableHats: { props: {} },
              claimableForHats: { props: {} },
            },
          },
          linkRequestFromTree: {
            props: {
              hats: { props: {} },
              childOfTree: {},
              linkedToHat: {},
              requestedLinkToTree: {},
              requestedLinkToHat: {},
              linkRequestFromTree: { props: {} },
              parentOfTrees: { props: {} },
              events: { props: {} },
            },
          },
          subHats: {
            props: {
              prettyId: true,
              status: true,
              createdAt: true,
              details: true,
              maxSupply: true,
              eligibility: true,
              toggle: true,
              mutable: true,
              imageUri: true,
              levelAtLocalTree: true,
              currentSupply: true,
              tree: {},
              wearers: { props: {} },
              admin: {},
              badStandings: { props: {} },
              claimableBy: { props: {} },
              claimableForBy: { props: {} },
              linkRequestFromTree: { props: {} },
              subHats: { props: {} },
              linkedTrees: { props: {} },
              events: { props: {} },
            },
          },
          linkedTrees: {
            props: {
              hats: { props: {} },
              childOfTree: {},
              linkedToHat: {},
              requestedLinkToTree: {},
              requestedLinkToHat: {},
              linkRequestFromTree: { props: {} },
              parentOfTrees: { props: {} },
              events: { props: {} },
            },
          },
          events: {
            props: { blockNumber: true, timestamp: true, transactionID: true },
          },
        },
      });

      const query = gql`
        query getHat($ids: [ID!]!) {
          hats(where: { id_in: $ids }) {
            id
            prettyId
            status
            createdAt
            details
            maxSupply
            eligibility
            toggle
            mutable
            imageUri
            levelAtLocalTree
            currentSupply
            tree {
              id
              hats {
                id
              }
              childOfTree {
                id
              }
              linkedToHat {
                id
              }
              requestedLinkToTree {
                id
              }
              requestedLinkToHat {
                id
              }
              linkRequestFromTree {
                id
              }
              parentOfTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            wearers {
              id
              currentHats {
                id
              }
              mintEvent {
                id
              }
              burnEvent {
                id
              }
            }
            admin {
              id
              prettyId
              status
              createdAt
              details
              maxSupply
              eligibility
              toggle
              mutable
              imageUri
              levelAtLocalTree
              currentSupply
              tree {
                id
              }
              wearers {
                id
              }
              admin {
                id
              }
              badStandings {
                id
              }
              claimableBy {
                id
              }
              claimableForBy {
                id
              }
              linkRequestFromTree {
                id
              }
              subHats {
                id
              }
              linkedTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            badStandings {
              id
              currentHats {
                id
              }
              mintEvent {
                id
              }
              burnEvent {
                id
              }
            }
            claimableBy {
              id
              claimableHats {
                id
              }
              claimableForHats {
                id
              }
            }
            claimableForBy {
              id
              claimableHats {
                id
              }
              claimableForHats {
                id
              }
            }
            linkRequestFromTree {
              id
              hats {
                id
              }
              childOfTree {
                id
              }
              linkedToHat {
                id
              }
              requestedLinkToTree {
                id
              }
              requestedLinkToHat {
                id
              }
              linkRequestFromTree {
                id
              }
              parentOfTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            subHats {
              id
              prettyId
              status
              createdAt
              details
              maxSupply
              eligibility
              toggle
              mutable
              imageUri
              levelAtLocalTree
              currentSupply
              tree {
                id
              }
              wearers {
                id
              }
              admin {
                id
              }
              badStandings {
                id
              }
              claimableBy {
                id
              }
              claimableForBy {
                id
              }
              linkRequestFromTree {
                id
              }
              subHats {
                id
              }
              linkedTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            linkedTrees {
              id
              hats {
                id
              }
              childOfTree {
                id
              }
              linkedToHat {
                id
              }
              requestedLinkToTree {
                id
              }
              requestedLinkToHat {
                id
              }
              linkRequestFromTree {
                id
              }
              parentOfTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            events(orderBy: timestamp, orderDirection: desc) {
              id
              blockNumber
              timestamp
              transactionID
              __typename
              ... on HatCreatedEvent {
                hatDetails
                hatMaxSupply
                hatEligibility
                hatToggle
                hatMutable
                hatImageUri
              }
              ... on HatMintedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatBurnedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatStatusChangedEvent {
                hatNewStatus
              }
              ... on HatDetailsChangedEvent {
                hatNewDetails
              }
              ... on HatEligibilityChangedEvent {
                hatNewEligibility
              }
              ... on HatToggleChangedEvent {
                hatNewToggle
              }
              ... on HatMaxSupplyChangedEvent {
                hatNewMaxSupply
              }
              ... on HatImageURIChangedEvent {
                hatNewImageURI
              }
              ... on TopHatLinkRequestedEvent {
                newAdmin
              }
              ... on TopHatLinkedEvent {
                newAdmin
              }
              ... on WearerStandingChangedEvent {
                wearer {
                  id
                }
                wearerStanding
              }
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        ids: [
          "0x0000000100020001000100000000000000000000000000000000000000000000",
          "0x0000000100020001000000000000000000000000000000000000000000000000",
        ],
      })) as { hats: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hats));
    }, 30000);

    test("Scenario 4", async () => {
      const res = await client.getHatsByIds({
        chainId: 10,
        hatIds: [],
        props: {
          prettyId: true,
          admin: {
            prettyId: true,
            subHats: {
              props: {
                prettyId: true,
              },
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        ids: [],
      })) as { hats: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hats));
    }, 30000);

    test("Scenario 5", async () => {
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
          status: true,
          createdAt: true,
          details: true,
          maxSupply: true,
          eligibility: true,
          toggle: true,
          mutable: true,
          imageUri: true,
          levelAtLocalTree: true,
          currentSupply: true,
          tree: {
            hats: { props: {}, filters: { first: 8 } },
            childOfTree: {},
            linkedToHat: {},
            requestedLinkToTree: {},
            requestedLinkToHat: {},
            linkRequestFromTree: { props: {} },
            parentOfTrees: { props: {} },
            events: { props: {}, filters: { first: 9 } },
          },
          wearers: {
            props: {
              currentHats: { props: {}, filters: { first: 5 } },
              mintEvent: { props: {}, filters: { first: 6 } },
              burnEvent: { props: {}, filters: { first: 7 } },
            },
            filters: { first: 2 },
          },
          admin: {
            prettyId: true,
            status: true,
            createdAt: true,
            details: true,
            maxSupply: true,
            eligibility: true,
            toggle: true,
            mutable: true,
            imageUri: true,
            levelAtLocalTree: true,
            currentSupply: true,
            tree: {},
            wearers: { props: {}, filters: { first: 2 } },
            admin: {},
            badStandings: { props: {} },
            claimableBy: { props: {} },
            claimableForBy: { props: {} },
            linkRequestFromTree: { props: {} },
            subHats: { props: {}, filters: { first: 3 } },
            linkedTrees: { props: {} },
            events: { props: {}, filters: { first: 4 } },
          },
          badStandings: {
            props: {
              currentHats: { props: {}, filters: { first: 5 } },
              mintEvent: { props: {}, filters: { first: 6 } },
              burnEvent: { props: {}, filters: { first: 7 } },
            },
          },
          claimableBy: {
            props: {
              claimableHats: { props: {}, filters: { first: 10 } },
              claimableForHats: { props: {}, filters: { first: 11 } },
            },
          },
          claimableForBy: {
            props: {
              claimableHats: { props: {}, filters: { first: 10 } },
              claimableForHats: { props: {}, filters: { first: 11 } },
            },
          },
          linkRequestFromTree: {
            props: {
              hats: { props: {}, filters: { first: 8 } },
              childOfTree: {},
              linkedToHat: {},
              requestedLinkToTree: {},
              requestedLinkToHat: {},
              linkRequestFromTree: { props: {} },
              parentOfTrees: { props: {} },
              events: { props: {}, filters: { first: 9 } },
            },
          },
          subHats: {
            props: {
              prettyId: true,
              status: true,
              createdAt: true,
              details: true,
              maxSupply: true,
              eligibility: true,
              toggle: true,
              mutable: true,
              imageUri: true,
              levelAtLocalTree: true,
              currentSupply: true,
              tree: {},
              wearers: { props: {}, filters: { first: 2 } },
              admin: {},
              badStandings: { props: {} },
              claimableBy: { props: {} },
              claimableForBy: { props: {} },
              linkRequestFromTree: { props: {} },
              subHats: { props: {}, filters: { first: 3 } },
              linkedTrees: { props: {} },
              events: { props: {}, filters: { first: 4 } },
            },
            filters: { first: 3 },
          },
          linkedTrees: {
            props: {
              hats: { props: {}, filters: { first: 8 } },
              childOfTree: {},
              linkedToHat: {},
              requestedLinkToTree: {},
              requestedLinkToHat: {},
              linkRequestFromTree: { props: {} },
              parentOfTrees: { props: {} },
              events: { props: {}, filters: { first: 9 } },
            },
          },
          events: {
            props: { blockNumber: true, timestamp: true, transactionID: true },
            filters: { first: 4 },
          },
        },
      });

      const query = gql`
        query getHat($ids: [ID!]!) {
          hats(where: { id_in: $ids }) {
            id
            prettyId
            status
            createdAt
            details
            maxSupply
            eligibility
            toggle
            mutable
            imageUri
            levelAtLocalTree
            currentSupply
            tree {
              id
              hats(first: 8) {
                id
              }
              childOfTree {
                id
              }
              linkedToHat {
                id
              }
              requestedLinkToTree {
                id
              }
              requestedLinkToHat {
                id
              }
              linkRequestFromTree {
                id
              }
              parentOfTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc, first: 9) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            wearers(first: 2) {
              id
              currentHats(first: 5) {
                id
              }
              mintEvent(first: 6) {
                id
              }
              burnEvent(first: 7) {
                id
              }
            }
            admin {
              id
              prettyId
              status
              createdAt
              details
              maxSupply
              eligibility
              toggle
              mutable
              imageUri
              levelAtLocalTree
              currentSupply
              tree {
                id
              }
              wearers(first: 2) {
                id
              }
              admin {
                id
              }
              badStandings {
                id
              }
              claimableBy {
                id
              }
              claimableForBy {
                id
              }
              linkRequestFromTree {
                id
              }
              subHats(first: 3) {
                id
              }
              linkedTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc, first: 4) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            badStandings {
              id
              currentHats(first: 5) {
                id
              }
              mintEvent(first: 6) {
                id
              }
              burnEvent(first: 7) {
                id
              }
            }
            claimableBy {
              id
              claimableHats(first: 10) {
                id
              }
              claimableForHats(first: 11) {
                id
              }
            }
            claimableForBy {
              id
              claimableHats(first: 10) {
                id
              }
              claimableForHats(first: 11) {
                id
              }
            }
            linkRequestFromTree {
              id
              hats(first: 8) {
                id
              }
              childOfTree {
                id
              }
              linkedToHat {
                id
              }
              requestedLinkToTree {
                id
              }
              requestedLinkToHat {
                id
              }
              linkRequestFromTree {
                id
              }
              parentOfTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc, first: 9) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            subHats(first: 3) {
              id
              prettyId
              status
              createdAt
              details
              maxSupply
              eligibility
              toggle
              mutable
              imageUri
              levelAtLocalTree
              currentSupply
              tree {
                id
              }
              wearers(first: 2) {
                id
              }
              admin {
                id
              }
              badStandings {
                id
              }
              claimableBy {
                id
              }
              claimableForBy {
                id
              }
              linkRequestFromTree {
                id
              }
              subHats(first: 3) {
                id
              }
              linkedTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc, first: 4) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            linkedTrees {
              id
              hats(first: 8) {
                id
              }
              childOfTree {
                id
              }
              linkedToHat {
                id
              }
              requestedLinkToTree {
                id
              }
              requestedLinkToHat {
                id
              }
              linkRequestFromTree {
                id
              }
              parentOfTrees {
                id
              }
              events(orderBy: timestamp, orderDirection: desc, first: 9) {
                id
                __typename
                ... on HatCreatedEvent {
                  hatDetails
                  hatMaxSupply
                  hatEligibility
                  hatToggle
                  hatMutable
                  hatImageUri
                }
                ... on HatMintedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatBurnedEvent {
                  wearer {
                    id
                  }
                  operator
                }
                ... on HatStatusChangedEvent {
                  hatNewStatus
                }
                ... on HatDetailsChangedEvent {
                  hatNewDetails
                }
                ... on HatEligibilityChangedEvent {
                  hatNewEligibility
                }
                ... on HatToggleChangedEvent {
                  hatNewToggle
                }
                ... on HatMaxSupplyChangedEvent {
                  hatNewMaxSupply
                }
                ... on HatImageURIChangedEvent {
                  hatNewImageURI
                }
                ... on TopHatLinkRequestedEvent {
                  newAdmin
                }
                ... on TopHatLinkedEvent {
                  newAdmin
                }
                ... on WearerStandingChangedEvent {
                  wearer {
                    id
                  }
                  wearerStanding
                }
              }
            }
            events(orderBy: timestamp, orderDirection: desc, first: 4) {
              id
              blockNumber
              timestamp
              transactionID
              __typename
              ... on HatCreatedEvent {
                hatDetails
                hatMaxSupply
                hatEligibility
                hatToggle
                hatMutable
                hatImageUri
              }
              ... on HatMintedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatBurnedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatStatusChangedEvent {
                hatNewStatus
              }
              ... on HatDetailsChangedEvent {
                hatNewDetails
              }
              ... on HatEligibilityChangedEvent {
                hatNewEligibility
              }
              ... on HatToggleChangedEvent {
                hatNewToggle
              }
              ... on HatMaxSupplyChangedEvent {
                hatNewMaxSupply
              }
              ... on HatImageURIChangedEvent {
                hatNewImageURI
              }
              ... on TopHatLinkRequestedEvent {
                newAdmin
              }
              ... on TopHatLinkedEvent {
                newAdmin
              }
              ... on WearerStandingChangedEvent {
                wearer {
                  id
                }
                wearerStanding
              }
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

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
    test("Test tree not exist", () => {
      expect(async () => {
        await client.getTree({
          chainId: 10,
          treeId: 0,
          props: {
            hats: { props: {} },
          },
        });
      }).rejects.toThrow(SubgraphTreeNotExistError);
    });

    test("Test validation 1", () => {
      expect(async () => {
        await client.getTree({
          chainId: 10,
          treeId: 0,
          props: {
            // @ts-ignore
            noSuchProp: true,
          },
        });
      }).rejects.toThrow(InputValidationError);
    });

    test("Test validation 2", () => {
      expect(async () => {
        await client.getTree({
          chainId: 10,
          treeId: 0,
          props: {
            hats: {
              // @ts-ignore
              noSuchProp: true,
            },
          },
        });
      }).rejects.toThrow(InputValidationError);
    });

    test("Scenario 1", async () => {
      const res = await client.getTree({
        chainId: 10,
        treeId: 1,
        props: {
          hats: {
            props: {
              prettyId: true,
              admin: {
                prettyId: true,
              },
            },
          },
        },
      });

      const query = gql`
        query getTree($id: ID!) {
          tree(id: $id) {
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        id: "0x00000001",
      })) as { tree: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.tree));
    }, 30000);

    test("Scenario 2", async () => {
      const res = await client.getTree({
        chainId: 10,
        treeId: 1,
        props: {
          hats: { props: {} },
          childOfTree: {},
          linkedToHat: {},
          requestedLinkToTree: {},
          requestedLinkToHat: {},
          linkRequestFromTree: { props: {} },
          parentOfTrees: { props: {} },
          events: { props: {} },
        },
      });

      const query = gql`
        query getTree($id: ID!) {
          tree(id: $id) {
            id
            hats {
              id
            }
            childOfTree {
              id
            }
            linkedToHat {
              id
            }
            requestedLinkToTree {
              id
            }
            requestedLinkToHat {
              id
            }
            linkRequestFromTree {
              id
            }
            parentOfTrees {
              id
            }
            events(orderBy: timestamp, orderDirection: desc) {
              id
              __typename
              ... on HatCreatedEvent {
                hatDetails
                hatMaxSupply
                hatEligibility
                hatToggle
                hatMutable
                hatImageUri
              }
              ... on HatMintedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatBurnedEvent {
                wearer {
                  id
                }
                operator
              }
              ... on HatStatusChangedEvent {
                hatNewStatus
              }
              ... on HatDetailsChangedEvent {
                hatNewDetails
              }
              ... on HatEligibilityChangedEvent {
                hatNewEligibility
              }
              ... on HatToggleChangedEvent {
                hatNewToggle
              }
              ... on HatMaxSupplyChangedEvent {
                hatNewMaxSupply
              }
              ... on HatImageURIChangedEvent {
                hatNewImageURI
              }
              ... on TopHatLinkRequestedEvent {
                newAdmin
              }
              ... on TopHatLinkedEvent {
                newAdmin
              }
              ... on WearerStandingChangedEvent {
                wearer {
                  id
                }
                wearerStanding
              }
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        id: "0x00000001",
      })) as { tree: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.tree));
    }, 30000);
  });

  describe("getTreesByIds Tests", () => {
    test("Test tree not exist", () => {
      expect(async () => {
        await client.getTreesByIds({
          chainId: 10,
          props: {},
          treeIds: [0, 2],
        });
      }).rejects.toThrow(SubgraphTreeNotExistError);
    });

    test("Test validation", () => {
      expect(async () => {
        await client.getTreesByIds({
          chainId: 10,
          props: {
            // @ts-ignore
            noSuchProp: true,
          },
          treeIds: [1, 2],
        });
      }).rejects.toThrow(InputValidationError);
    });

    test("Scenario 1", async () => {
      const res = await client.getTreesByIds({
        chainId: 10,
        props: {
          hats: {
            props: {
              prettyId: true,
              admin: {
                prettyId: true,
              },
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        ids: ["0x00000001", "0x00000002"],
      })) as { trees: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.trees));
    });
  });

  describe("getTreesPaginated Tests", () => {
    test("Test validation", async () => {
      expect(async () => {
        await client.getTreesPaginated({
          chainId: 10,
          props: {
            // @ts-ignore
            noSuchProp: true,
          },
          page: 3,
          perPage: 10,
        });
      }).rejects.toThrow(InputValidationError);
    });

    test("Scenario 1", async () => {
      const res = await client.getTreesPaginated({
        chainId: 10,
        props: {
          hats: {
            props: {
              prettyId: true,
              admin: {
                prettyId: true,
              },
            },
          },
        },
        page: 3,
        perPage: 10,
      });

      const query = gql`
        query getPaginatedTrees($skip: Int!, $first: Int!) {
          trees(skip: $skip, first: $first) {
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        skip: 30,
        first: 10,
      })) as { trees: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.trees));
    }, 30000);

    test("Scenario 2", async () => {
      const res = await client.getTreesPaginated({
        chainId: 10,
        props: {
          hats: {
            props: {
              prettyId: true,
              admin: {
                prettyId: true,
              },
            },
          },
        },
        page: 0,
        perPage: 100,
      });

      const query = gql`
        query getPaginatedTrees($skip: Int!, $first: Int!) {
          trees(skip: $skip, first: $first) {
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        skip: 0,
        first: 100,
      })) as { trees: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.trees));
    });
  });

  describe("getWearer Tests", () => {
    test("Test wearer not exist", () => {
      expect(async () => {
        await client.getWearer({
          chainId: 10,
          props: {},
          wearerAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        });
      }).rejects.toThrow(SubgraphWearerNotExistError);
    });

    test("Test validation", () => {
      expect(async () => {
        await client.getWearer({
          chainId: 10,
          props: {
            // @ts-ignore
            noSuchProp: true,
          },
          wearerAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        });
      }).rejects.toThrow(InputValidationError);
    });

    test("Scenario 1", async () => {
      const res = await client.getWearer({
        chainId: 10,
        props: {
          currentHats: {
            props: {
              prettyId: true,
            },
          },
          mintEvent: {
            props: {
              hat: {
                prettyId: true,
              },
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        id: "0xEb2ee1250DC8C954dA4efF4DF0E4467A1ca6af6c".toLowerCase(),
      })) as { wearer: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.wearer));
    });

    test("Scenario 2", async () => {
      const res = await client.getWearer({
        chainId: 10,
        props: {
          currentHats: {
            props: {
              wearers: {
                props: {
                  currentHats: {
                    props: {},
                  },
                },
              },
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
              wearers {
                id
                currentHats {
                  id
                }
              }
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        id: "0xEb2ee1250DC8C954dA4efF4DF0E4467A1ca6af6c".toLowerCase(),
      })) as { wearer: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.wearer));
    });
  });

  describe("getWearersOfHatPaginated Tests", () => {
    test("Test hats not exist", () => {
      expect(async () => {
        await client.getWearersOfHatPaginated({
          chainId: 10,
          props: {},
          hatId: BigInt(
            "0x1111111100020001000100000000000000000000000000000000000000000000"
          ),
          page: 0,
          perPage: 2,
        });
      }).rejects.toThrow(SubgraphHatNotExistError);
    });

    test("Test validation", () => {
      expect(async () => {
        await client.getWearersOfHatPaginated({
          chainId: 10,
          props: {
            // @ts-ignore
            noSuchProp: true,
          },
          hatId: BigInt(
            "0x1111111100020001000100000000000000000000000000000000000000000000"
          ),
          page: 0,
          perPage: 2,
        });
      }).rejects.toThrow(InputValidationError);
    });

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
          hat(id: $hatId) {
            wearers(skip: $skip, first: $first) {
              id
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        hatId:
          "0x0000000100020001000100000000000000000000000000000000000000000000",
        first: 2,
        skip: 0,
      })) as { hat: { wearers: any } };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hat.wearers));
    });

    test("Scenario 2", async () => {
      const res = await client.getWearersOfHatPaginated({
        chainId: 10,
        props: {},
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        page: 1,
        perPage: 200,
      });

      const query = gql`
        query getPaginatedWearersForHat(
          $hatId: ID!
          $first: Int!
          $skip: Int!
        ) {
          hat(id: $hatId) {
            wearers(skip: $skip, first: $first) {
              id
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        hatId:
          "0x0000000100020001000100000000000000000000000000000000000000000000",
        first: 200,
        skip: 200,
      })) as { hat: { wearers: any } };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hat.wearers));
    });

    test("Scenario 3", async () => {
      const res = await client.getWearersOfHatPaginated({
        chainId: 10,
        props: {},
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        page: 0,
        perPage: 200,
      });

      const query = gql`
        query getPaginatedWearersForHat(
          $hatId: ID!
          $first: Int!
          $skip: Int!
        ) {
          hat(id: $hatId) {
            wearers(skip: $skip, first: $first) {
              id
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        hatId:
          "0x0000000100020001000100000000000000000000000000000000000000000000",
        first: 200,
        skip: 0,
      })) as { hat: { wearers: any } };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hat.wearers));
    }, 30000);

    test("Scenario 4", async () => {
      const res = await client.getWearersOfHatPaginated({
        chainId: 10,
        props: {},
        hatId: BigInt(
          "0x0000000100020001000100000000000000000000000000000000000000000000"
        ),
        page: 1,
        perPage: 2,
      });

      const query = gql`
        query getPaginatedWearersForHat(
          $hatId: ID!
          $first: Int!
          $skip: Int!
        ) {
          hat(id: $hatId) {
            wearers(skip: $skip, first: $first) {
              id
            }
          }
        }
      `;

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        hatId:
          "0x0000000100020001000100000000000000000000000000000000000000000000",
        first: 2,
        skip: 2,
      })) as { hat: { wearers: any } };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref.hat.wearers));
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        search:
          "0x0000000100020001000100000000000000000000000000000000000000000000",
      })) as { trees: any; hats: any; wearers: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref));
    });

    test("Scenario 2", async () => {
      const res = await client.searchTreesHatsWearers({
        chainId: 10,
        search: "0x00000001000200010001",
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        search: "0x00000001000200010001",
      })) as { trees: any; hats: any; wearers: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref));
    });

    test("Scenario 3", async () => {
      const res = await client.searchTreesHatsWearers({
        chainId: 10,
        search: "0xEb2ee1250DC8C954dA4efF4DF0E4467A1ca6af6c",
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        search: "0xEb2ee1250DC8C954dA4efF4DF0E4467A1ca6af6c".toLowerCase(),
      })) as { trees: any; hats: any; wearers: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref));
    });

    test("Scenario 4", async () => {
      const res = await client.searchTreesHatsWearers({
        chainId: 10,
        search: "0x11111111000200010001",
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

      const gqlClient = new GraphQLClient(
        DEFAULT_ENDPOINTS_CONFIG[10].endpoint
      );

      const ref = (await gqlClient.request(query, {
        search: "0x11111111000200010001",
      })) as { trees: any; hats: any; wearers: any };

      expect(JSON.stringify(res)).toBe(JSON.stringify(ref));
    });
  });
});
