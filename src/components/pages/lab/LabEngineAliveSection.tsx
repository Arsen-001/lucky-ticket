import { EngineIcon } from '@/components/shared/icons/EngineIcon';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TicketType } from '@/types/types/ticket.types';
import { LabEngineAlive, type EngineAliveLayer } from './LabEngineAlive';
import { LabEngineAliveTierCell } from './LabEngineAliveTierCell';
import { LabSection } from './LabSection';
import { LabVariant } from './LabVariant';

/** Production sizes of the render: home cube (86 * 1.36) and engine page (110 * 1.36). */
const SLIDER_PX = 117;
const PAGE_PX = 150;
/** Judging size — the same layers blown up, to see what each one actually does. */
const INSPECT_PX = 260;
/** Real cycles are hours. 3.2s so the loop repeats while you are looking at it. */
const LAB_CYCLE_MS = 3200;

const TIERS: readonly TicketType[] = [
  TicketsEnum.BRONZE,
  TicketsEnum.SILVER,
  TicketsEnum.GOLD,
  TicketsEnum.PLATINUM,
  TicketsEnum.DIAMOND,
];

const EJECT_ONLY: readonly EngineAliveLayer[] = ['stamp', 'eject'];
const WITH_LIFE: readonly EngineAliveLayer[] = ['stamp', 'eject', 'core', 'sparks'];

/**
 * "Option 1" under comparison: making the engine look alive without producing a
 * new asset. Each variant adds one layer to the previous one, so the question
 * the row answers is not "does it look good" but "which layer is the one that
 * is actually doing the work".
 */
export function LabEngineAliveSection() {
  return (
    <>
      <LabSection
        title="Живой движок — по слоям"
        note="Рендер плоский, шестерни в нём крутиться не могут. Каждый вариант добавляет один слой к предыдущему. Цикл ускорен до 3.2с; на проде это интервал производства."
      >
        <LabVariant label="0 · как сейчас" bet="Статичная картинка. Точка отсчёта.">
          <div className="flex-center rounded-2xl bg-background-overlay py-4">
            <EngineIcon tier="gold" size={INSPECT_PX} />
          </div>
        </LabVariant>

        <LabVariant
          label="A · билет + штамповка"
          bet="Билет выезжает из лотка и улетает, корпус вздрагивает в момент печати. Всё остальное неподвижно."
        >
          <div className="flex-center rounded-2xl bg-background-overlay py-4">
            <LabEngineAlive
              tier="gold"
              size={INSPECT_PX}
              cycleMs={LAB_CYCLE_MS}
              layers={EJECT_ONLY}
            />
          </div>
        </LabVariant>

        <LabVariant
          label="B · + жизнь внутри"
          bet="Плюс свет, ползущий внутри механизма, и искры у щели. Стекло gold/platinum/diamond читает это как движение шестерён."
        >
          <div className="flex-center rounded-2xl bg-background-overlay py-4">
            <LabEngineAlive
              tier="gold"
              size={INSPECT_PX}
              cycleMs={LAB_CYCLE_MS}
              layers={WITH_LIFE}
            />
          </div>
        </LabVariant>

        <LabVariant
          label="C · всё"
          bet="Плюс блик по раме (маска — альфа самого рендера) и световое пятно под кубом."
        >
          <div className="flex-center rounded-2xl bg-background-overlay py-4">
            <LabEngineAlive tier="gold" size={INSPECT_PX} cycleMs={LAB_CYCLE_MS} />
          </div>
        </LabVariant>
      </LabSection>

      <LabSection
        title="Все тиры — калибровка щели"
        note="Позиция лотка у каждого рендера своя и снята вручную. Здесь проверяем, что билет выезжает из щели, а не из рамы."
      >
        <LabVariant label="Полный набор · 150px (размер на странице движка)">
          <div className="flex flex-wrap justify-center gap-4 rounded-2xl bg-background-overlay p-4">
            {TIERS.map(tier => (
              <LabEngineAliveTierCell
                key={tier}
                tier={tier}
                size={PAGE_PX}
                cycleMs={LAB_CYCLE_MS}
              />
            ))}
          </div>
        </LabVariant>

        <LabVariant
          label="Реальный размер · 117px (куб на главной)"
          bet="Главный вопрос: что из этого вообще различимо в слайдере. Ниже — предполагаемый ответ, только вылет и штамповка."
        >
          <div className="flex flex-wrap justify-center gap-4 rounded-2xl bg-background-overlay p-4">
            {TIERS.map(tier => (
              <LabEngineAliveTierCell
                key={tier}
                tier={tier}
                size={SLIDER_PX}
                cycleMs={LAB_CYCLE_MS}
                layers={EJECT_ONLY}
              />
            ))}
          </div>
        </LabVariant>
      </LabSection>
    </>
  );
}
