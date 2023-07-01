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
