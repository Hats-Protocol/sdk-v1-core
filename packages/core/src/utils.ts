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

/**
 * Converts a Hat's IP to a valid Hex value.
 * @param hatIp Full IP of a hat. I.E. 68.1.2
 * @returns Hat IP in Hex format.
 */
export function HatIpToHex(hatIp: string): string {

  //observedChunk is used in the while loop and acts as a temporary variable
  //storing the currently observed "chunk" of the IP.
  //I.E. 68.1.2
  let observedChunk = hatIp;

  //going to break up the full IP into chunks and add to this array.
  const chunks: Number[] = [];

  //while still parsing all chunks of the IP.
  while (true) {
    //If no more chunks to parse
    if (observedChunk.indexOf(".") === -1) {
      //Acess the final chunk
      //I.E. the 2 at the end of 68.1.2.
      let chunk = observedChunk.substring(0, observedChunk.length);
      //Push the final chunk to the array
      chunks.push(Number(chunk));
      break;
    }

    //Proceed to break up the chunks 
    //I.E. 
    //  Chunk 1: 68
    //  Chunk 2: 1
    let chunk = observedChunk.substring(0, observedChunk.indexOf("."));
    //Sets the observed chunk to be the next set of numbers in the IP
    observedChunk = observedChunk.substring(observedChunk.indexOf(".") + 1, observedChunk.length);

    //Push the final chunk to the array
    chunks.push(Number(chunk));
  }

  //Start constructing the valid Hat Hex 
  let fullHex = "0x";

  //loop through all the chunks
  for (let i = 0; i < chunks.length; i++) {
    //convert the chunk to hex
    let hex = chunks[i].toString(16);

    //If the Tree chunk
    if (i === 0) {
      //Add a number of 0s to the beginning of the hexed value with max 10 padding
      //and concat the resulting value to fullHex.
      fullHex += hex.padStart(10 - hex.length, "0");
    } else {
      //Add a number of 0s to the beginning of the hexed value with max 5 padding
      //and concat the resulting value to fullHex.
      fullHex += hex.padStart(5 - hex.length, "0");
    }
  }

  //Fill up the rest of the the hex with 0s onto the end of it. 
  fullHex = fullHex.padEnd(66, "0");
  return fullHex;
}

/**
 * Gets the Tree IP from a Full IP
 * @param hatIp Full IP of a hat.
 * @returns the base tree IP of the hat as a number.
 */
export function treeIpFromIp(hatIp: string): Number {
  let treeIp;

  //If hatIp is the tree IP
  if (hatIp.indexOf(".") === -1)
    treeIp = hatIp;
  //Else grab the tree IP from the Full IP
  else
    treeIp = hatIp.substring(0, hatIp.indexOf("."));

  return Number(treeIp);
}
