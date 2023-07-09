import { gql } from "graphql-request";

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

export const GET_TREE_WEARERS_PER_HAT = gql`
  query getTree($id: ID!) {
    tree(id: $id) {
      hats {
        id
        wearers {
          id
        }
      }
    }
  }
`;

export const GET_WEARERS_OF_HAT = gql`
  query getWearerHats($id: ID!) {
    hat(id: $id) {
      wearers {
        id
      }
    }
  }
`;

export const GET_ALL_TREE = gql`
  query getTree($id: ID!) {
    tree(id: $id) {
      hats {
        id
        details
        maxSupply
        imageUri
        currentSupply
        levelAtLocalTree
        eligibility
        toggle
        mutable
        wearers {
          id
        }
        admin {
          id
        }
      }
      childOfTree {
        id
      }
      linkedToHat {
        id
      }
      parentOfTrees {
        id
      }
    }
  }
`;
