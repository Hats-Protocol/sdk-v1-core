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

export function normalizedPropsToQueryFields(props: any): any {
  let fields = "";

  // first iteration without opening comma
  const elem = props[0];
  if (typeof elem === "string") {
    fields = fields + `${elem}`;
  }

  if (typeof elem === "object") {
    const elemKey = Object.keys(elem)[0];
    if (elemKey === "hats") {
      fields =
        fields +
        `${elemKey} (first: $firstHats) { ${normalizedPropsToQueryFields(
          elem[elemKey]
        )} }`;
    } else {
      fields =
        fields +
        `${elemKey} { ${normalizedPropsToQueryFields(elem[elemKey])} }`;
    }
  }

  // loop over the rest
  for (let i = 1; i < props.length; i++) {
    const elem = props[i];
    if (typeof elem === "string") {
      fields = fields + `, ${elem}`;
    }

    if (typeof elem === "object") {
      const elemKey = Object.keys(elem)[0];
      if (elemKey === "hats") {
        fields =
          fields +
          `, ${elemKey} (first: $firstHats) { ${normalizedPropsToQueryFields(
            elem[elemKey]
          )} }`;
      } else {
        fields =
          fields +
          `, ${elemKey} { ${normalizedPropsToQueryFields(elem[elemKey])} }`;
      }
    }
  }

  return fields;
}
