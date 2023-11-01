import type { Filters, GqlObjType } from "./types";

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

export function normalizeProps(props: any): any {
  const fields: any[] = ["id"];
  for (const [key, value] of Object.entries(props)) {
    if (typeof value !== "object" && value === true) {
      fields.push(key);
    }

    if (typeof value === "object") {
      const subFields = normalizeProps(value);
      const obj: any = {};
      obj[key] = subFields;
      fields.push(obj);
    }
  }

  return fields;
}

export function normalizedPropsToQueryFields(
  props: any,
  currentObjType: GqlObjType,
  filters?: Filters
): any {
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
      const elemKey = Object.keys(elem)[0];

      const first = getFirstFilter(currentObjType, filters, elemKey);

      if (elemKey === "events") {
        fields =
          fields +
          `${elemKey} (orderBy: timestamp, orderDirection: desc, first: ${first}) { ${normalizedPropsToQueryFields(
            elem[elemKey],
            nextObjType(currentObjType, elemKey),
            filters
          )} }`;
      } else {
        fields =
          fields +
          `${elemKey} (first: ${first}) { ${normalizedPropsToQueryFields(
            elem[elemKey],
            nextObjType(currentObjType, elemKey),
            filters
          )} }`;
      }
    }
  }

  return fields;
}

function nextObjType(currentObjType: GqlObjType, key: string): GqlObjType {
  if (currentObjType === "Hat") {
    if (key === "tree") {
      return "Tree";
    } else if (key === "wearers") {
      return "Wearer";
    } else if (key === "badStandings") {
      return "Wearer";
    } else if (key === "admin") {
      return "Hat";
    } else if (key === "subHats") {
      return "Hat";
    } else if (key === "linkRequestFromTree") {
      return "Tree";
    } else if (key === "linkedTrees") {
      return "Tree";
    } else if (key === "claimableBy") {
      return "ClaimsHatter";
    } else if (key === "claimableForBy") {
      return "ClaimsHatter";
    } else if (key === "events") {
      return "HatsEvent";
    } else {
      throw new Error("Unexpected key");
    }
  } else if (currentObjType === "Wearer") {
    if (key === "currentHats") {
      return "Hat";
    } else if (key === "mintEvent") {
      return "HatsEvent";
    } else if (key === "burnEvent") {
      return "HatsEvent";
    } else {
      throw new Error("Unexpected key");
    }
  } else if (currentObjType === "Tree") {
    if (key === "hats") {
      return "Hat";
    } else if (key === "childOfTree") {
      return "Tree";
    } else if (key === "parentOfTrees") {
      return "Tree";
    } else if (key === "linkedToHat") {
      return "Hat";
    } else if (key === "linkRequestFromTree") {
      return "Tree";
    } else if (key === "requestedLinkToTree") {
      return "Tree";
    } else if (key === "requestedLinkToHat") {
      return "Hat";
    } else if (key === "events") {
      return "HatsEvent";
    } else {
      throw new Error("Unexpected key");
    }
  } else if (currentObjType === "HatsEvent") {
    if (key === "hat") {
      return "Hat";
    } else if (key === "tree") {
      return "Tree";
    } else {
      throw new Error("Unexpected key");
    }
  } else if (currentObjType === "ClaimsHatter") {
    if (key === "claimableHats") {
      return "Hat";
    } else if (key === "claimableForHats") {
      return "Hat";
    } else {
      throw new Error("Unexpected key");
    }
  } else {
    throw new Error("Unexpected object type");
  }
}

function getFirstFilter(
  currentObjType: GqlObjType,
  filters: Filters | undefined,
  key: string
): number {
  let first = 1000;
  if (filters !== undefined && filters.first !== undefined) {
    if (currentObjType === "Hat" && filters.first.hat !== undefined) {
      switch (key) {
        case "wearer": {
          first = filters.first.hat.wearers ?? first;
          break;
        }
        case "badStandings": {
          first = filters.first.hat.badStandings ?? first;
          break;
        }
        case "subHats": {
          first = filters.first.hat.subHats ?? first;
          break;
        }
        case "linkRequestFromTree": {
          first = filters.first.hat.linkRequestFromTree ?? first;
          break;
        }
        case "linkedTrees": {
          first = filters.first.hat.linkedTrees ?? first;
          break;
        }
        case "claimableBy": {
          first = filters.first.hat.claimableBy ?? first;
          break;
        }
        case "claimableForBy": {
          first = filters.first.hat.claimableBy ?? first;
          break;
        }
        case "events": {
          first = filters.first.hat.events ?? first;
          break;
        }
      }
    } else if (currentObjType === "Tree" && filters.first.tree !== undefined) {
      switch (key) {
        case "hats": {
          first = filters.first.tree.hats ?? first;
          break;
        }
        case "parentOfTrees": {
          first = filters.first.tree.parentOfTrees ?? first;
          break;
        }
        case "linkRequestFromTree": {
          first = filters.first.tree.linkRequestFromTree ?? first;
          break;
        }
        case "events": {
          first = filters.first.tree.events ?? first;
          break;
        }
      }
    } else if (
      currentObjType === "Wearer" &&
      filters.first.wearer !== undefined
    ) {
      switch (key) {
        case "currentHats": {
          first = filters.first.wearer.currentHats ?? first;
          break;
        }
        case "mintEvent": {
          first = filters.first.wearer.mintEvent ?? first;
          break;
        }
        case "burnEvent": {
          first = filters.first.wearer.burnEvent ?? first;
          break;
        }
      }
    } else if (
      currentObjType === "ClaimsHatter" &&
      filters.first.claimsHatter !== undefined
    ) {
      switch (key) {
        case "claimableHats": {
          first = filters.first.claimsHatter.claimableHats ?? first;
          break;
        }
        case "claimableForHats": {
          first = filters.first.claimsHatter.claimableForHats ?? first;
          break;
        }
      }
    }
  }

  return first;
}
