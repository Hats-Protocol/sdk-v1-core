import { gql } from "graphql-request";

export const EVENT_DETAILS_FRAGMENT = gql`
  fragment EventDetails on HatsEvent {
    id
    timestamp
    blockNumber
    transactionID
  }
`;

export const HAT_DETAILS_WITHOUT_EVENTS_FRAGMENT = gql`
  fragment HatDetailsUnit on Hat {
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
    badStandings {
      id
    }
    admin {
      id
    }
    subHats {
      id
    }
    linkRequestFromTree {
      id
    }
    linkedTrees {
      id
    }
    claimableBy {
      id
    }
    claimableForBy {
      id
    }
  }
  ${EVENT_DETAILS_FRAGMENT}
`;

export const HAT_DETAILS_WITH_EVENTS_FRAGMENT = gql`
  fragment HatDetails on Hat {
    ...HatDetailsUnit
    events(orderBy: timestamp, orderDirection: desc, first: $numEvents) {
      ...EventDetails
    }
  }
  ${HAT_DETAILS_WITHOUT_EVENTS_FRAGMENT}
`;

export const GET_HAT = gql`
  query getHat($id: ID!, $numEvents: Int = 5) {
    hat(id: $id) {
      ...HatDetails
    }
  }
  ${HAT_DETAILS_WITH_EVENTS_FRAGMENT}
`;

export const GET_HATS_BY_IDS = gql`
  query getHatsByIds($ids: [ID!]!, $numEvents: Int = 5) {
    hats(where: { id_in: $ids }) {
      ...HatDetails
    }
  }
  ${HAT_DETAILS_WITH_EVENTS_FRAGMENT}
`;

//query ($id: String) { hat (id: $id) { id, prettyId, eligibility, admin { id, prettyId, eligibility, subHats { id, prettyId, eligibility } } } }
//query ($ids: [string!]) { hats(where: { id_in: $ids }) { id, prettyId } }
