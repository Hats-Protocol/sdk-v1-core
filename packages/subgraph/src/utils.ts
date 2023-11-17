import type {
  HatPropsConfig,
  TreePropsConfig,
  WearerPropsConfig,
  ClaimsHatterPropsConfig,
  HatsEventPropsConfig,
} from "./types";

export function hatIdDecimalToHex(hatId: bigint): string {
  return "0x" + BigInt(hatId).toString(16).padStart(64, "0");
}

export function treeIdDecimalToHex(treeId: number): string {
  return "0x" + treeId.toString(16).padStart(8, "0");
}

export function hatIdHexToDecimal(hatId: string): bigint {
  return BigInt(hatId);
}

export function treeIdHexToDecimal(treeId: string): number {
  return parseInt(treeId, 16);
}

export function hatIdDecimalToIp(hatId: bigint): string {
  const hexId = hatIdDecimalToHex(hatId);
  let ip = treeIdHexToDecimal(hexId.substring(0, 10)).toString();
  for (let i = 10; i < hexId.length; i += 4) {
    const domainAtLevel = hexId.substring(i, i + 4);
    if (domainAtLevel === "0000") {
      break;
    }
    ip += "." + parseInt(domainAtLevel, 16);
  }
  return ip;
}

export function treeIdToTopHatId(treeId: number): bigint {
  return BigInt(treeIdDecimalToHex(treeId).padEnd(66, "0"));
}

export function hatIdToTreeId(hatId: bigint): number {
  return parseInt(
    "0x" + BigInt(hatId).toString(16).padStart(64, "0").substring(0, 8),
    16
  );
}

export function normalizeProps(
  config:
    | HatPropsConfig
    | TreePropsConfig
    | WearerPropsConfig
    | ClaimsHatterPropsConfig
    | HatsEventPropsConfig
): any {
  const fields: any[] = ["id"];
  for (const [key, value] of Object.entries(config)) {
    if (typeof value !== "object" && value === true) {
      fields.push(key);
    }

    if (typeof value === "object") {
      const withPropsAndFilters = "props" in value ? true : false;
      const subFields = normalizeProps(
        withPropsAndFilters ? value.props : value
      );
      const obj: any = {
        objName: key,
        objProps: subFields,
      };

      if (
        withPropsAndFilters &&
        value.filters !== undefined &&
        value.filters.first !== undefined
      ) {
        obj["objFilters"] = { first: value.filters.first };
      }
      fields.push(obj);
    }
  }

  return fields;
}

export function normalizedPropsToQueryFields(props: any): any {
  let fields = "";

  for (let i = 0; i < props.length; i++) {
    if (i > 0) {
      fields += ", ";
    }

    const elem = props[i];
    if (typeof elem === "string") {
      fields = fields + `${elem}`;
    }

    if (typeof elem === "object") {
      const name = elem["objName"];
      const props = elem["objProps"];
      const first =
        elem["objFilters"] !== undefined
          ? elem["objFilters"]["first"]
          : undefined;

      if (first !== undefined) {
        if (name === "events") {
          fields =
            fields +
            `${name} (orderBy: timestamp, orderDirection: desc, first: ${first}) { ${normalizedPropsToQueryFields(
              props
            )} 
            __typename 
            ... on HatCreatedEvent { hatDetails hatMaxSupply hatEligibility hatToggle hatMutable hatImageUri } 
            ... on HatMintedEvent { wearer { id } operator } 
            ... on HatBurnedEvent { wearer { id } operator } 
            ... on HatStatusChangedEvent { hatNewStatus } 
            ... on HatDetailsChangedEvent { hatNewDetails } 
            ... on HatEligibilityChangedEvent { hatNewEligibility } 
            ... on HatToggleChangedEvent { hatNewToggle } 
            ... on HatMaxSupplyChangedEvent { hatNewMaxSupply } 
            ... on HatImageURIChangedEvent { hatNewImageURI } 
            ... on TopHatLinkRequestedEvent { newAdmin } 
            ... on TopHatLinkedEvent { newAdmin } 
            ... on WearerStandingChangedEvent { wearer { id } wearerStanding } 
          }`;
        } else {
          fields =
            fields +
            `${name} (first: ${first}) { ${normalizedPropsToQueryFields(
              props
            )} }`;
        }
      } else {
        if (name === "events") {
          fields =
            fields +
            `${name} (orderBy: timestamp, orderDirection: desc) { 
              ${normalizedPropsToQueryFields(props)} 
              __typename 
              ... on HatCreatedEvent { hatDetails hatMaxSupply hatEligibility hatToggle hatMutable hatImageUri } 
              ... on HatMintedEvent { wearer { id } operator } 
              ... on HatBurnedEvent { wearer { id } operator } 
              ... on HatStatusChangedEvent { hatNewStatus } 
              ... on HatDetailsChangedEvent { hatNewDetails } 
              ... on HatEligibilityChangedEvent { hatNewEligibility } 
              ... on HatToggleChangedEvent { hatNewToggle } 
              ... on HatMaxSupplyChangedEvent { hatNewMaxSupply } 
              ... on HatImageURIChangedEvent { hatNewImageURI } 
              ... on TopHatLinkRequestedEvent { newAdmin } 
              ... on TopHatLinkedEvent { newAdmin } 
              ... on WearerStandingChangedEvent { wearer { id } wearerStanding } 
            }`;
        } else {
          fields =
            fields + `${name} { ${normalizedPropsToQueryFields(props)} }`;
        }
      }
    }
  }

  return fields;
}
