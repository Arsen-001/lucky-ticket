import type { AirdropClaimResult, AirdropState } from '@/types/interfaces/airdrop.interfaces';

/**
 * Мок окна награды.
 *
 * Сумма взята не с потолка: 0.05 TON — это пол участия, то есть ровно то, что
 * увидит БОЛЬШИНСТВО игроков на проде (у 1 180 из 1 535 прайс набрал меньше
 * пола). Мок, показывающий крупную награду, проверял бы редкий случай и врал бы
 * про то, как экран выглядит обычно.
 */
export const airdropMock = {
  airdrop: {
    eligible: true,
    enabled: true,
    amountTon: 0.05,
    claimed: false,
    claimedAt: null,
  } satisfies AirdropState,

  'POST airdrop/claim': {
    data: { claimed: true, amountTon: 0.05 } satisfies AirdropClaimResult,
  },
};
