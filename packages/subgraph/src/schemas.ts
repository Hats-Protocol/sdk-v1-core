import { z } from "zod";
import type {
  HatConfig,
  TreeConfig,
  WearerConfig,
  ClaimsHatterConfig,
  HatEventConfig,
  TreeEventConfig,
  HatMintedEventConfig,
  HatBurnedEventConfig,
} from "./types";

export const hatConfigSchema: z.ZodType<HatConfig> = z
  .object({
    prettyId: z.boolean().optional(),
    status: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    details: z.boolean().optional(),
    maxSupply: z.boolean().optional(),
    eligibility: z.boolean().optional(),
    toggle: z.boolean().optional(),
    mutable: z.boolean().optional(),
    imageUri: z.boolean().optional(),
    levelAtLocalTree: z.boolean().optional(),
    currentSupply: z.boolean().optional(),
    tree: z.lazy(() => treeConfigSchema).optional(),
    wearers: z.lazy(() => wearerConfigSchema).optional(),
    badStandings: z.lazy(() => wearerConfigSchema).optional(),
    admin: z.lazy(() => hatConfigSchema).optional(),
    subHats: z.lazy(() => hatConfigSchema).optional(),
    linkRequestFromTree: z.lazy(() => treeConfigSchema).optional(),
    linkedTrees: z.lazy(() => treeConfigSchema).optional(),
    claimableBy: z.lazy(() => claimsHatterConfigSchema).optional(),
    claimableForBy: z.lazy(() => claimsHatterConfigSchema).optional(),
    events: z.lazy(() => hatEventConfigSchema).optional(),
  })
  .strict();

export const treeConfigSchema: z.ZodType<TreeConfig> = z
  .object({
    hats: z.lazy(() => hatConfigSchema).optional(),
    childOfTree: z.lazy(() => treeConfigSchema).optional(),
    parentOfTrees: z.lazy(() => treeConfigSchema).optional(),
    linkedToHat: z.lazy(() => hatConfigSchema).optional(),
    linkRequestFromTree: z.lazy(() => treeConfigSchema).optional(),
    requestedLinkToTree: z.lazy(() => treeConfigSchema).optional(),
    requestedLinkToHat: z.lazy(() => hatConfigSchema).optional(),
    events: z.lazy(() => treeEventConfigSchema).optional(),
  })
  .strict();

export const wearerConfigSchema: z.ZodType<WearerConfig> = z
  .object({
    currentHats: z.lazy(() => hatConfigSchema).optional(),
    mintEvent: z.lazy(() => hatMintedEventConfigSchema).optional(),
    burnEvent: z.lazy(() => hatBurnedEventConfigSchema).optional(),
  })
  .strict();

export const claimsHatterConfigSchema: z.ZodType<ClaimsHatterConfig> = z
  .object({
    claimableHats: z.lazy(() => hatConfigSchema).optional(),
    claimableForHats: z.lazy(() => hatConfigSchema).optional(),
  })
  .strict();

export const hatEventConfigSchema: z.ZodType<HatEventConfig> = z
  .object({
    timestamp: z.boolean().optional(),
    blockNumber: z.boolean().optional(),
    transactionID: z.boolean().optional(),
  })
  .strict();

export const treeEventConfigSchema: z.ZodType<TreeEventConfig> = z
  .object({
    timestamp: z.boolean().optional(),
    blockNumber: z.boolean().optional(),
    transactionID: z.boolean().optional(),
    hat: z.lazy(() => hatConfigSchema).optional(),
  })
  .strict();

export const hatMintedEventConfigSchema: z.ZodType<HatMintedEventConfig> = z
  .object({
    timestamp: z.boolean().optional(),
    blockNumber: z.boolean().optional(),
    transactionID: z.boolean().optional(),
    hat: z.lazy(() => hatConfigSchema).optional(),
  })
  .strict();

export const hatBurnedEventConfigSchema: z.ZodType<HatBurnedEventConfig> = z
  .object({
    timestamp: z.boolean().optional(),
    blockNumber: z.boolean().optional(),
    transactionID: z.boolean().optional(),
    hat: z.lazy(() => hatConfigSchema).optional(),
  })
  .strict();
