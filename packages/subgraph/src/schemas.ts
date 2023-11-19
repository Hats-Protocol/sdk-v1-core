import { z } from "zod";
import type {
  HatPropsConfig,
  HatsConfig,
  TreePropsConfig,
  TreesConfig,
  WearerPropsConfig,
  WearersConfig,
  ClaimsHatterPropsConfig,
  ClaimsHattersConfig,
  HatsEventPropsConfig,
  HatsEventsConfig,
} from "./types";

export const hatPropsConfigSchema: z.ZodType<HatPropsConfig> = z
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
    tree: z.lazy(() => treePropsConfigSchema).optional(),
    wearers: z.lazy(() => wearersConfigSchema).optional(),
    badStandings: z.lazy(() => wearersConfigSchema).optional(),
    admin: z.lazy(() => hatPropsConfigSchema).optional(),
    subHats: z.lazy(() => hatsConfigSchema).optional(),
    linkRequestFromTree: z.lazy(() => treesConfigSchema).optional(),
    linkedTrees: z.lazy(() => treesConfigSchema).optional(),
    claimableBy: z.lazy(() => claimsHattersConfig).optional(),
    claimableForBy: z.lazy(() => claimsHattersConfig).optional(),
    events: z.lazy(() => hatsEventsConfigSchema).optional(),
  })
  .strict();

export const hatsConfigSchema: z.ZodType<HatsConfig> = z
  .object({
    props: z.object({
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
      tree: z.lazy(() => treePropsConfigSchema).optional(),
      wearers: z.lazy(() => wearersConfigSchema).optional(),
      badStandings: z.lazy(() => wearersConfigSchema).optional(),
      admin: z.lazy(() => hatPropsConfigSchema).optional(),
      subHats: z.lazy(() => hatsConfigSchema).optional(),
      linkRequestFromTree: z.lazy(() => treesConfigSchema).optional(),
      linkedTrees: z.lazy(() => treesConfigSchema).optional(),
      claimableBy: z.lazy(() => claimsHattersConfig).optional(),
      claimableForBy: z.lazy(() => claimsHattersConfig).optional(),
      events: z.lazy(() => hatsEventsConfigSchema).optional(),
    }),
    filters: z
      .object({
        first: z.number().optional(),
      })
      .optional(),
  })
  .strict();

export const treePropsConfigSchema: z.ZodType<TreePropsConfig> = z
  .object({
    hats: z.lazy(() => hatsConfigSchema).optional(),
    childOfTree: z.lazy(() => treePropsConfigSchema).optional(),
    parentOfTrees: z.lazy(() => treesConfigSchema).optional(),
    linkedToHat: z.lazy(() => hatPropsConfigSchema).optional(),
    linkRequestFromTree: z.lazy(() => treesConfigSchema).optional(),
    requestedLinkToTree: z.lazy(() => treePropsConfigSchema).optional(),
    requestedLinkToHat: z.lazy(() => hatPropsConfigSchema).optional(),
    events: z.lazy(() => hatsEventsConfigSchema).optional(),
  })
  .strict();

export const treesConfigSchema: z.ZodType<TreesConfig> = z
  .object({
    props: z.object({
      hats: z.lazy(() => hatsConfigSchema).optional(),
      childOfTree: z.lazy(() => treePropsConfigSchema).optional(),
      parentOfTrees: z.lazy(() => treesConfigSchema).optional(),
      linkedToHat: z.lazy(() => hatPropsConfigSchema).optional(),
      linkRequestFromTree: z.lazy(() => treesConfigSchema).optional(),
      requestedLinkToTree: z.lazy(() => treePropsConfigSchema).optional(),
      requestedLinkToHat: z.lazy(() => hatPropsConfigSchema).optional(),
      events: z.lazy(() => hatsEventsConfigSchema).optional(),
    }),
    filters: z
      .object({
        first: z.number().optional(),
      })
      .optional(),
  })
  .strict();

export const wearerPropsConfigSchema: z.ZodType<WearerPropsConfig> = z
  .object({
    currentHats: z.lazy(() => hatsConfigSchema).optional(),
    mintEvent: z.lazy(() => hatsEventsConfigSchema).optional(),
    burnEvent: z.lazy(() => hatsEventsConfigSchema).optional(),
  })
  .strict();

export const wearersConfigSchema: z.ZodType<WearersConfig> = z
  .object({
    props: z.object({
      currentHats: z.lazy(() => hatsConfigSchema).optional(),
      mintEvent: z.lazy(() => hatsEventsConfigSchema).optional(),
      burnEvent: z.lazy(() => hatsEventsConfigSchema).optional(),
    }),
    filters: z
      .object({
        first: z.number().optional(),
      })
      .optional(),
  })
  .strict();

export const claimsHatterPropsConfigSchema: z.ZodType<ClaimsHatterPropsConfig> =
  z
    .object({
      claimableHats: z.lazy(() => hatsConfigSchema).optional(),
      claimableForHats: z.lazy(() => hatsConfigSchema).optional(),
    })
    .strict();

export const claimsHattersConfig: z.ZodType<ClaimsHattersConfig> = z
  .object({
    props: z.object({
      claimableHats: z.lazy(() => hatsConfigSchema).optional(),
      claimableForHats: z.lazy(() => hatsConfigSchema).optional(),
    }),
    filters: z
      .object({
        first: z.number().optional(),
      })
      .optional(),
  })
  .strict();

export const hatsEventPropsConfigSchema: z.ZodType<HatsEventPropsConfig> = z
  .object({
    timestamp: z.boolean().optional(),
    blockNumber: z.boolean().optional(),
    transactionID: z.boolean().optional(),
    hat: z.lazy(() => hatPropsConfigSchema).optional(),
    tree: z.lazy(() => treePropsConfigSchema).optional(),
  })
  .strict();

export const hatsEventsConfigSchema: z.ZodType<HatsEventsConfig> = z
  .object({
    props: z.object({
      timestamp: z.boolean().optional(),
      blockNumber: z.boolean().optional(),
      transactionID: z.boolean().optional(),
      hat: z.lazy(() => hatPropsConfigSchema).optional(),
      tree: z.lazy(() => treePropsConfigSchema).optional(),
    }),
    filters: z
      .object({
        first: z.number().optional(),
      })
      .optional(),
  })
  .strict();
