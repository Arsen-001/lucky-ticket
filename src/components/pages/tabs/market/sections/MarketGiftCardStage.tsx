'use client';

export interface MarketGiftCardStageProps {
  emoji: string;
  size: number;
}

/**
 * The gift's own emoji, big.
 *
 * Telegram gives us no artwork for a gift — `getAvailableGifts` returns a
 * sticker reference the Mini App cannot render and an emoji. So the emoji IS
 * the product shot here, and it needs a stage of its own rather than floating
 * in a box.
 *
 * The stage draws no plate of its own. Both places that host it — the card's
 * icon slot and the info modal's header — already lay down a surface tinted
 * with the section accent, and this used to stack a second pink plate on top:
 * a 45% border, another 12% fill, a 32% inner glow and a 38% radial at 70%
 * opacity. Together they turned every gift into a hot magenta brick, the
 * loudest thing on a screen whose every other surface is dark. A plate in any
 * other colour just moves the problem — it reads as a rectangle pasted inside
 * the host's rectangle. So the emoji sits directly on the host surface, lit
 * from above and grounded by a shadow, exactly like the engine and cosmetic
 * art next to it.
 */
export function MarketGiftCardStage({ emoji, size }: MarketGiftCardStageProps) {
  return (
    <div className="flex-center relative" style={{ width: size, height: size }}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 40%, transparent 68%)',
        }}
      />
      <span
        className="relative leading-none"
        style={{
          // 60% of the stage, not 46%: with no plate of its own the emoji has to
          // cover the host's accent tint itself, or the tile reads as a coloured
          // rectangle with a small character in the middle of it.
          fontSize: Math.round(size * 0.6),
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
        }}
      >
        {emoji}
      </span>
    </div>
  );
}
