import { Cpu, type LucideIcon, MemoryStick, Plus } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QUALITY_ACCENT, TYPE_ACCENT } from '@/utils/global/inventory.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const TYPE_ICON: Record<InventoryChipType, LucideIcon> = {
  speed: Cpu,
  capacity: MemoryStick,
};

export interface InventoryMintCardProps {
  type: InventoryChipType;
  quality: TicketType;
  existingChipsCount: number;
  shardsAvailable: number;
  chipBuildersOwned: number;
  onMint?: () => void;
}

export function InventoryMintCard({
  type,
  quality,
  existingChipsCount,
  shardsAvailable,
  chipBuildersOwned,
  onMint,
}: InventoryMintCardProps) {
  const t = useAppTranslations();

  const isFirst = existingChipsCount === 0;
  const Icon = TYPE_ICON[type];
  const accent = QUALITY_ACCENT[quality];
  const typeAccent = TYPE_ACCENT[type];

  const hasShard = shardsAvailable >= 1;
  const hasBuilder = chipBuildersOwned >= 1;
  const canMint = isFirst ? hasShard : hasShard && hasBuilder;

  return (
    <div
      className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-dashed p-3.5"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 8%, var(--color-background-overlay)) 0%, var(--color-background-overlay) 80%)`,
      }}
    >
      <div
        className="flex-center h-12 w-12 shrink-0 rounded-xl border"
        style={{
          borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
        }}
      >
        <Plus size={26} stroke={accent} strokeWidth={2.4} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Icon
            size={13}
            stroke={typeAccent}
            fill={typeAccent}
            fillOpacity={0.25}
            strokeWidth={2.4}
          />
          <span className="text-sm font-extrabold text-white">{t('mint new chip')}</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>
          {t(quality)} · {type === 'speed' ? t('time') : t('capacity')}
        </span>
        <span className="text-pink-secondary mt-0.5 text-[10px] font-bold tabular-nums">
          {isFirst ? t('first chip free') : t('cost: 1 chip builder + 1 shard')}
        </span>
      </div>

      <div className="shrink-0">
        <Button onClick={onMint} disabled={!canMint} className="px-3 py-2 text-[11px]">
          {isFirst ? t('mint free') : t('mint')}
        </Button>
      </div>
    </div>
  );
}
