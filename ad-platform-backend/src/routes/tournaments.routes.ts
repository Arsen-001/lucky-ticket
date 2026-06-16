import { Router } from 'express';
import { z } from 'zod';

import { PRICING, formatUsd } from '../config/pricing';
import { ValidationError } from '../errors';
import { asyncHandler } from '../middleware/asyncHandler';
import { calculateCost } from '../services/calculate.service';
import { createTournament, processClick } from '../services/tournaments.service';

export const tournamentsRouter = Router();

/** Validate a request body with zod, re-throwing as a 400 ValidationError. */
function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map(i => `${i.path.join('.') || 'body'}: ${i.message}`)
      .join('; ');
    throw new ValidationError(message || 'Invalid request body');
  }
  return result.data;
}

// ---------------------------------------------------------------------------
//  POST /api/tournaments/calculate — live price preview for the builder UI.
// ---------------------------------------------------------------------------
const calculateSchema = z.object({
  url: z.string().min(1),
  clicksRequested: z.number().int().positive(),
  withBanner: z.boolean().optional(),
  withLongText: z.boolean().optional(),
  longText: z.string().optional(),
});

tournamentsRouter.post(
  '/calculate',
  asyncHandler(async (req, res) => {
    const input = parse(calculateSchema, req.body);
    const b = calculateCost(input);

    res.json({
      linkType: b.linkType,
      cpcRate: b.cpcRate,
      clicksRequested: b.clicksRequested,
      fixed: b.fixed,
      clickBudget: b.clickBudget,
      total: b.total,
      // Pre-formatted USD strings so the frontend can render without math.
      display: {
        cpcRate: formatUsd(b.cpcRate),
        fixedTotal: formatUsd(b.fixed.total),
        clickBudget: formatUsd(b.clickBudget),
        total: formatUsd(b.total),
      },
    });
  })
);

// ---------------------------------------------------------------------------
//  POST /api/tournaments/create — fund + launch a campaign.
// ---------------------------------------------------------------------------
const createSchema = z.object({
  advertiserId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  shortText: z.string().max(300).optional(),
  longText: z.string().max(PRICING.LONG_TEXT_MAX_LENGTH).optional(),
  bannerUrl: z.string().url().optional(),
  targetUrl: z.string().min(1),
  clicksRequested: z.number().int().positive(),
  durationHours: z.number().int().positive().max(8760), // ≤ 1 year
});

tournamentsRouter.post(
  '/create',
  asyncHandler(async (req, res) => {
    const input = parse(createSchema, req.body);
    const { tournament, balanceAfter } = await createTournament(input);

    res.status(201).json({
      tournament,
      balanceAfter,
      display: { balanceAfter: formatUsd(balanceAfter) },
    });
  })
);

// ---------------------------------------------------------------------------
//  POST /api/tournaments/click — handle a player jumping to the sponsor link.
// ---------------------------------------------------------------------------
const clickSchema = z.object({
  tournamentId: z.number().int().positive(),
  telegramId: z.number().int().positive(),
});

tournamentsRouter.post(
  '/click',
  asyncHandler(async (req, res) => {
    const { tournamentId, telegramId } = parse(clickSchema, req.body);
    const result = await processClick(tournamentId, telegramId);
    res.json(result);
  })
);
