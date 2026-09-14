/**
 * Состояние окна награды.
 *
 * `eligible: false` — строки в снимке нет: игрок пришёл после того, как снимок
 * сняли, либо исключён. Окно в этом случае не показывается ВОВСЕ — «твоя
 * награда 0 TON» худшее первое впечатление, какое можно показать новичку.
 */
export interface AirdropState {
  eligible: boolean;
  /** Мастер-выключатель: с ним выключенным забрать нельзя. */
  enabled: boolean;
  /** Есть только при `eligible: true`. Уже с учётом пола участия. */
  amountTon?: number;
  claimed?: boolean;
  claimedAt?: string | null;
}

export interface AirdropClaimResult {
  claimed: boolean;
  amountTon: number;
}
