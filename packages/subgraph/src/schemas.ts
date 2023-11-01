import { z } from "zod";
import type {
  HatConfig,
  TreeConfig,
  WearerConfig,
  ClaimsHatterConfig,
  HatsEventConfig,
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
    events: z.lazy(() => hatsEventConfigSchema).optional(),
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
    events: z.lazy(() => hatsEventConfigSchema).optional(),
  })
  .strict();

export const wearerConfigSchema: z.ZodType<WearerConfig> = z
  .object({
    currentHats: z.lazy(() => hatConfigSchema).optional(),
    mintEvent: z.lazy(() => hatsEventConfigSchema).optional(),
    burnEvent: z.lazy(() => hatsEventConfigSchema).optional(),
  })
  .strict();

export const claimsHatterConfigSchema: z.ZodType<ClaimsHatterConfig> = z
  .object({
    claimableHats: z.lazy(() => hatConfigSchema).optional(),
    claimableForHats: z.lazy(() => hatConfigSchema).optional(),
  })
  .strict();

export const hatsEventConfigSchema: z.ZodType<HatsEventConfig> = z
  .object({
    timestamp: z.boolean().optional(),
    blockNumber: z.boolean().optional(),
    transactionID: z.boolean().optional(),
    hat: z.lazy(() => hatConfigSchema).optional(),
    tree: z.lazy(() => treeConfigSchema).optional(),
  })
  .strict();
