'use client';

import { LabSection } from './LabSection';
import { LabTabBar, type LabTabBarVariant } from './LabTabBar';
import { LabTabBarNotched, type LabTabBarNotchedVariant } from './LabTabBarNotched';
import { LabTabBarSignature, type LabTabBarSignatureVariant } from './LabTabBarSignature';
import { LabVariant } from './LabVariant';

const VARIANTS: { key: LabTabBarVariant; label: string; bet: string }[] = [
  {
    key: 'labeled',
    label: 'Т1 · подписи всегда',
    bet: 'Все пять названий на месте — видно, куда ведёт каждая иконка, ещё до нажатия. Активная помечена цветом и полоской сверху. Самый читаемый и самый обычный вариант.',
  },
  {
    key: 'quiet',
    label: 'Т2 · тихая',
    bet: 'Без пилюли: активная вкладка просто светится и одна получает подпись. Панель перестаёт спорить с контентом — но по неактивным иконкам надо догадываться.',
  },
  {
    key: 'center',
    label: 'Т3 · главная выносной кнопкой · ПРИНЯТ',
    bet: 'Выбран и перенесён в приложение — настоящая панель внизу экрана теперь такая же. Центр выходит из ряда: «Главная» становится якорем и попадает под большой палец. Игровой вид, но кнопка съедает 14px над панелью и ломает ровный ряд.',
  },
  {
    key: 'stacked',
    label: 'Т4 · пилюля растёт вниз',
    bet: 'Та же розовая пилюля, что сейчас, но подпись уезжает под иконку, а не вбок. Длина названия перестаёт быть проблемой — ширина у всех пяти вкладок одинаковая.',
  },
];

const SIGNATURE: { key: LabTabBarSignatureVariant; label: string; bet: string }[] = [
  {
    key: 'ticket',
    label: 'С1 · панель — это билет · был в приложении',
    bet: 'Стоял внизу экрана до Т3. Верхний край прорезан полукруглой перфорацией, между вкладками — линия отрыва, активная вкладка выглядит как оторванный корешок: подсвечена от линии отрыва вниз и приподнята.',
  },
  {
    key: 'ball',
    label: 'С2 · шар лототрона на рельсе',
    bet: 'Двигается ровно один предмет — шар. Он катится по рельсе к нажатой вкладке (и правда проворачивается на ходу) и светит на неё сверху. Панель при этом неподвижна: переключение читается как розыгрыш, а не как подсветка кнопки.',
  },
  {
    key: 'cube',
    label: 'С3 · куб поворачивает грань',
    bet: 'Тот же куб, что на главной у движка: плитка объёмная и при выборе поворачивает нижнюю грань наверх — светящуюся. Иконка не «загорается», а физически сменяется другой стороной.',
  },
];

const NOTCHED: { key: LabTabBarNotchedVariant; label: string; bet: string }[] = [
  {
    key: 'cradle',
    label: 'В1 · люлька — края скруглены',
    bet: 'Вырез уходит в панель дугой, а в местах, где он возвращается к верхнему краю, стоят маленькие радиусы: линия нигде не ломается под прямым углом. Самый мягкий и самый спокойный вариант — читается как выемка, отлитая под кружок.',
  },
  {
    key: 'scoop',
    label: 'В2 · вырез без радиусов',
    bet: 'Та же дуга, но она встречает верхний край в лоб, без сглаживания: получаются два острых угла по бокам. Резче и графичнее — панель выглядит пробитой, а не отлитой.',
  },
  {
    key: 'gap',
    label: 'В3 · разрыв во всю высоту',
    bet: 'Панель не надрезана, а разорвана: две части с закруглёнными торцами, между ними сквозная пустота на всю высоту, и кружок висит в ней сам по себе. Самый смелый — под активной вкладкой панели просто нет, подпись стоит на фоне страницы.',
  },
];

/**
 * Bottom-bar options. Each bar is live: it owns its active tab and does not
 * navigate, so tapping through them stays on this page.
 */
export function LabTabBarSection() {
  return (
    <>
      <LabSection
        title="Нижние табы — свои, не как у всех"
        note="Три варианта, собранных из того, что есть только у нас: билет, который печатает движок, шар розыгрыша и куб движка с главной. Такую панель нельзя взять из чужого приложения — она про этот продукт. Нажимается всё: важно смотреть не на статичный вид, а на переключение."
      >
        {SIGNATURE.map(v => (
          <LabVariant key={v.key} label={v.label} bet={v.bet}>
            <div className="-mx-4 overflow-hidden">
              <div className="bg-background h-12" />
              <LabTabBarSignature variant={v.key} />
            </div>
          </LabVariant>
        ))}
      </LabSection>

      <LabSection
        title="Нижние табы — обычные"
        note="Четыре привычных решения. Внизу экрана сейчас третье из них (Т3): «Главная» вынесена из ряда в приподнятую кнопку. До него там стоял билет (С1)."
      >
        {VARIANTS.map(v => (
          <LabVariant key={v.key} label={v.label} bet={v.bet}>
            <div className="-mx-4 overflow-hidden">
              <div className="bg-background h-12" />
              <LabTabBar variant={v.key} />
            </div>
          </LabVariant>
        ))}
      </LabSection>

      <LabSection
        title="Нижние табы — вырез под кружком"
        note="То же, что стоит сейчас, но панель под активной вкладкой РАСПОРОТА: кружок висит в пустоте, а не лежит на сплошной полосе. Полосатая подложка нарочно просвечивает — по ней видно, где дырка настоящая. Разница между вариантами в том, чем закрыты края рядом с вырезом. Нажимается всё: вырез переезжает вместе с кружком."
      >
        {NOTCHED.map(v => (
          <LabVariant key={v.key} label={v.label} bet={v.bet}>
            <div className="relative -mx-4 overflow-hidden">
              {/* Shows through the cut, so the hole cannot be mistaken for paint. */}
              <span
                aria-hidden
                className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.07)_0_8px,transparent_8px_16px)]"
              />
              <div className="h-14" />
              <LabTabBarNotched variant={v.key} className="relative" />
            </div>
          </LabVariant>
        ))}
      </LabSection>
    </>
  );
}
