'use client';

import { useEffect, useState } from 'react';
import { EnginePreviewCard } from '@/components/pages/tabs/tickets/EnginePreviewCard';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import { LabEngineCard, type LabEngineVariant } from './LabEngineCard';
import { LabSection } from './LabSection';
import { LabVariant } from './LabVariant';

/**
 * Four engines covering what the grid actually contains: one ready to claim,
 * one just started, one nearly done, and a slow high-capacity one.
 */
const ENGINES: { engine: TicketEngine; tier: 'bronze' | 'silver' | 'gold'; elapsed: number }[] = [
  {
    engine: {
      id: 'lab-e1',
      cycleSeconds: 4500,
      cycleStartedAt: '2026-08-05T00:00:00.000Z',
      pendingCount: 1,
      engineLevel: 1,
    },
    tier: 'bronze',
    elapsed: 4500,
  },
  {
    engine: {
      id: 'lab-e2',
      cycleSeconds: 5400,
      cycleStartedAt: '2026-08-05T00:00:00.000Z',
      pendingCount: 0,
      engineLevel: 1,
    },
    tier: 'bronze',
    elapsed: 120,
  },
  {
    engine: {
      id: 'lab-e3',
      cycleSeconds: 7200,
      cycleStartedAt: '2026-08-05T00:00:00.000Z',
      pendingCount: 0,
      engineLevel: 2,
    },
    tier: 'silver',
    elapsed: 6900,
  },
  {
    engine: {
      id: 'lab-e4',
      cycleSeconds: 25200,
      cycleStartedAt: '2026-08-05T00:00:00.000Z',
      pendingCount: 0,
      engineLevel: 2,
      capacityLevel: 3,
    },
    tier: 'gold',
    elapsed: 9000,
  },
];

const VARIANTS: { key: LabEngineVariant; label: string; bet: string }[] = [
  {
    key: 'ready',
    label: 'Д1 · готовый выделен',
    bet: 'Самая осторожная правка: строка чисел получает подписи «цикл / вместимость», а готовый движок — розовую кнопку и свет тира вместо тусклой коричневой плашки.',
  },
  {
    key: 'board',
    label: 'Д2 · как карточка задания',
    bet: 'Тот же язык, что уже стоит на турнирах и заданиях: контейнер из двух подписанных ячеек, под ним полоса цикла и одно действие.',
  },
  {
    key: 'ring',
    label: 'Д3 · кольцо цикла',
    bet: 'Цикл нарисован кольцом вокруг движка — прогресс виден без полосы и без второго времени. Куб становится центром карточки.',
  },
];

const noop = () => {};

export function LabEnginesSection() {
  // Ticks like the real grid does, so «next in» counts down instead of freezing.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick(n => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <LabSection
      title="Карточка движка — страница билетов"
      note="Четыре движка: готовый к сбору, только запущенный, почти дошедший и медленный ёмкий. Во всех кандидатах чинится одно и то же — одно время вместо двух, подписи у «×N», и готовый выглядит готовым. Тап открывает движок, «забрать» работает."
    >
      <LabVariant
        label="0 · как сейчас"
        bet="Два времени в одном формате (длительность цикла и остаток), два безымянных «×N», и кнопка «забрать» залита цветом тира на 30% — на бронзе почти не отличается от серой «next in»."
      >
        <div className="grid grid-cols-2 gap-2">
          {ENGINES.map((item, i) => (
            <EnginePreviewCard
              key={item.engine.id}
              engine={item.engine}
              tier={item.tier}
              index={i}
              elapsedSeconds={item.elapsed + tick}
              onClaim={noop}
            />
          ))}
        </div>
      </LabVariant>

      {VARIANTS.map(v => (
        <LabVariant key={v.key} label={v.label} bet={v.bet}>
          <div className="grid grid-cols-2 gap-2">
            {ENGINES.map((item, i) => (
              <LabEngineCard
                key={item.engine.id}
                engine={item.engine}
                tier={item.tier}
                index={i}
                elapsedSeconds={item.elapsed + tick}
                onClaim={noop}
                variant={v.key}
              />
            ))}
          </div>
        </LabVariant>
      ))}
    </LabSection>
  );
}
