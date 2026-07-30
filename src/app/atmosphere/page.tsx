'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { AtmosphericBackground } from '@/components/shared/AtmosphericBackground';
import '@/styles/components/atmosphere-preview.css';

/**
 * Backdrop viewer — the app's sky with no interface on top of it, so a change
 * to it can be judged on its own.
 *
 * It renders the real `<AtmosphericBackground />`, which pulls the real
 * `atmosphere.css`. That is the whole point: an earlier version of this page
 * was a standalone HTML file holding a *copy* of the layer CSS, which would
 * have gone on showing the old backdrop, silently, the first time the real one
 * changed.
 *
 * Developer instrument, not a product screen: it is not in `routes`, nothing
 * links to it, and its labels are deliberately not run through `t()` — three
 * translations of "Bokeh" would be noise in the message files.
 */
type LayerKey = 'rays' | 'dust' | 'bokeh' | 'vignette';

const LAYER_LABEL: Record<LayerKey, string> = {
  rays: 'Лучи',
  dust: 'Пыль',
  bokeh: 'Боке',
  vignette: 'Виньетка',
};

const LAYER_ORDER: readonly LayerKey[] = ['rays', 'dust', 'bokeh', 'vignette'];

export default function AtmospherePreviewPage() {
  const [hidden, setHidden] = useState<Record<LayerKey, boolean>>({
    rays: false,
    dust: false,
    bokeh: false,
    vignette: false,
  });
  const [motion, setMotion] = useState(true);
  const [phoneFrame, setPhoneFrame] = useState(false);

  const layerClass = (key: LayerKey) => (hidden[key] ? 'hidden' : undefined);

  return (
    <div
      // Fixed, not in flow: the root layout caps its children at the phone
      // column, and a viewer that can only ever show 430px cannot answer what
      // the backdrop does at other proportions — which is most of what the
      // rays' geometry depends on.
      className="atmosphere-preview fixed inset-0 z-40 overflow-hidden bg-[#0b0a16]"
      data-motion={motion ? 'on' : 'off'}
    >
      {/* `absolute` and `z-0` override the component's own `fixed -z-10`: here
          it is a specimen inside a box, not the page's backdrop. The opaque box
          also hides the global one, which is mounted in the root layout. */}
      <AtmosphericBackground
        className={twMerge(
          'absolute z-0',
          phoneFrame &&
            'left-1/2 right-auto w-[min(430px,100vw)] -translate-x-1/2 shadow-[0_0_0_1px_rgba(232,214,255,0.14)]'
        )}
        classNames={{
          rays: layerClass('rays'),
          dust: layerClass('dust'),
          bokeh: layerClass('bokeh'),
          vignette: layerClass('vignette'),
        }}
      />

      {/* What the header and the tab bar cover in the app — both are 5rem. */}
      {phoneFrame && (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-1 w-[min(430px,100vw)] -translate-x-1/2">
          {(['шапка', 'таб-бар'] as const).map((label, index) => (
            <div
              key={label}
              className={twMerge(
                'absolute inset-x-0 h-20 border-y border-[rgba(232,214,255,0.14)] bg-[rgba(11,10,22,0.55)]',
                index === 0 ? 'top-0' : 'bottom-0'
              )}
            >
              <span
                className={twMerge(
                  'absolute left-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8f86b8]',
                  index === 0 ? 'bottom-1.5' : 'top-1.5'
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="atmosphere-preview-rail absolute bottom-[max(18px,env(safe-area-inset-bottom))] left-1/2 z-2 flex max-w-[calc(100vw-24px)] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-full border border-[rgba(232,214,255,0.14)] bg-[rgba(11,10,22,0.72)] p-2 shadow-[0_10px_40px_rgba(0,0,0,0.55)] backdrop-blur-[14px]">
        {LAYER_ORDER.map(key => (
          <PreviewToggle
            key={key}
            label={LAYER_LABEL[key]}
            pressed={!hidden[key]}
            onClick={() => setHidden(prev => ({ ...prev, [key]: !prev[key] }))}
          />
        ))}
        <span className="mx-1 self-stretch border-l border-[rgba(232,214,255,0.14)]" />
        <PreviewToggle label="Движение" pressed={motion} onClick={() => setMotion(v => !v)} />
        <PreviewToggle label="430px" pressed={phoneFrame} onClick={() => setPhoneFrame(v => !v)} />
      </div>
    </div>
  );
}

interface PreviewToggleProps {
  label: string;
  pressed: boolean;
  onClick: () => void;
}

function PreviewToggle({ label, pressed, onClick }: PreviewToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={twMerge(
        'rounded-full border px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c671bd]',
        pressed
          ? 'border-[rgba(198,113,189,0.55)] bg-[rgba(116,61,245,0.22)] text-[#e8dcff]'
          : 'border-transparent text-[#8f86b8] hover:text-[#e8dcff]'
      )}
    >
      {label}
    </button>
  );
}
