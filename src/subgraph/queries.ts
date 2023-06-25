import { gql } from "graphql-request";

//const EVENT_DETAILS_FRAGMENT = gql`
//  fragment EventDetails on HatsEvent {
//    id
//    timestamp
//    transactionID
//  }
//`;

// TODO handle inline sort for events
//export const TREE_DETAILS_FRAGMENT_WITH_EVENTS = gql`
//  fragment TreeDetailsWithEvents on Tree {
//    id
//    hats {
//      id
//      prettyId
//      admin {
//        id
//        prettyId
//      }
//      tree {
//        id
//      }
//    }
//    events(orderBy: timestamp, orderDirection: desc, first: 5) {
//      ...EventDetails
//      hat {
//        id
//        prettyId
//      }
//    }
//    linkRequestFromTree {
//      id
//    }
//    childOfTree {
//      id
//    }
//    parentOfTrees {
//      id
//      linkedToHat {
//        id
//        prettyId
//      }
//    }
//    linkedToHat {
//      id
//      prettyId
//      tree {
//        id
//      }
//    }
//  }
//  ${EVENT_DETAILS_FRAGMENT}
//`;

//export const TREE_DETAILS_FRAGMENT = gql`
//  fragment TreeDetails on Tree {
//    id
//    hats {
//      id
//      details
//      imageUri
//      prettyId
//      admin {
//        id
//        prettyId
//      }
//    }
//  }
//`;

//export const TREE_TOP_HAT_DETAILS_FRAGMENT = gql`
//  fragment TreeTopHatDetails on Tree {
//    id
//    hats(first: 1) {
//      id
//      details
//      imageUri
//      prettyId
//      admin {
//        id
//        prettyId
//      }
//    }
//  }
//`;

//export const GET_TREE = gql`
//  query getTree($id: ID!) {
//    tree(id: $id) {
//      ...TreeDetailsWithEvents
//    }
//  }
//  ${TREE_DETAILS_FRAGMENT_WITH_EVENTS}
//`;

//export const GET_ALL_TREE_IDS = gql`
//  query getAllTrees {
//    trees {
//      id
//      hats {
//        id
//        prettyId
//      }
//    }
//  }
//`;

//export const GET_ALL_TREES = gql`
//  query getAllTrees {
//    trees {
//      ...TreeDetails
//    }
//  }
//  ${TREE_DETAILS_FRAGMENT}
//`;

//export const GET_PAGINATED_TREES = gql`
//  query getPaginatedTrees($skip: Int!, $first: Int!) {
//    trees(skip: $skip, first: $first) {
//      ...TreeTopHatDetails
//    }
//  }
//  ${TREE_TOP_HAT_DETAILS_FRAGMENT}
//`;

//export const HAT_DETAILS_FRAGMENT = gql`
//  fragment HatDetailsUnit on Hat {
//    id
//    prettyId
//    status
//    createdAt
//    details
//    maxSupply
//    eligibility
//    toggle
//    mutable
//    imageUri
//    levelAtLocalTree
//    currentSupply
//    events(orderBy: timestamp, orderDirection: desc) {
//      ...EventDetails
//    }
//  }
//  fragment HatDetails on Hat {
//    ...HatDetailsUnit
//    wearers {
//      id
//    }
//    admin {
//      ...HatDetailsUnit
//    }
//  }
//  ${EVENT_DETAILS_FRAGMENT}
//`;

//export const GET_HAT = gql`
//  query getHat($id: ID!) {
//    hat(id: $id) {
//      ...HatDetails
//    }
//  }
//  ${HAT_DETAILS_FRAGMENT}
//`;

export const GET_WEARER_HATS = gql`
  query getWearerHats($id: ID!) {
    wearer(id: $id) {
      currentHats {
        id
      }
    }
  }
`;

export const GET_TREE_HATS = gql`
  query getTree($id: ID!) {
    tree(id: $id) {
      hats {
        id
      }
    }
  }
`;

//export const SEARCH_QUERY = gql`
//  query search($search: String!) {
//    trees(where: { id: $search }) {
//      id
//    }
//    hats(where: { or: [{ id: $search }, { prettyId: $search }] }) {
//      id
//      prettyId
//    }
//  }
//`;

//export const GET_WEARER_DETAILS = gql`
//  query getCurrentHatsForWearer($id: ID!) {
//    wearer(id: $id) {
//      currentHats {
//        id
//        prettyId
//        details
//        imageUri
//        mutable
//        status
//        levelAtLocalTree
//        admin {
//          id
//          prettyId
//        }
//      }
//    }
//  }
//`;

//export const GET_ALL_WEARERS = gql`
//  query getAllWearers {
//    wearers {
//      id
//    }
//  }
//`;
