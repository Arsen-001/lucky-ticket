'use client';

import { useRouter } from 'next/navigation';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CalendarDays, Coins, Image as ImageIcon, Link2, Trophy, Type } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { Form } from '@/components/shared/form-elements/Form';
import { FormItem } from '@/components/shared/form-elements/FormItem';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { NumberStepper } from '@/components/shared/form-elements/NumberStepper';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { TonAmount } from '@/components/shared/icons/TonAmount';
import { SponsoredTierSelector } from './SponsoredTierSelector';
import { PartnerStartTimeSelector } from './PartnerStartTimeSelector';
import { useCreateSponsoredTournamentMutation } from '@/api/tournaments.api';
import { useGetPartnerStatsQuery } from '@/api/partners.api';
import { appConfig } from '@/config/app.config';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { usePartnersEnabled } from '@/hooks/usePartnersEnabled';
import { useTonUsdRate } from '@/hooks/useTonUsdRate';
import { useToast } from '@/hooks/useToast';
import { getCreateSponsoredTournamentSchema } from '@/lib/yup/partners.schemes';
import { computeSponsoredTournamentCost } from '@/utils/global/partners.utils';
import { formatCompact } from '@/utils/global/number.utils';
import type { CreateSponsoredTournamentPayload } from '@/types/interfaces/tournaments.interfaces';
import '@/styles/components/date-input.css';

const cfg = appConfig.partners.sponsoredTournament;
const labelClass = 'text-sm font-medium text-white-secondary';

/** Local "YYYY-MM-DD" for a native date input (avoids the UTC `toISOString` shift). */
const toDateInputValue = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function NewSponsoredTournamentContent() {
  const t = useAppTranslations();
  const partnersEnabled = usePartnersEnabled();
  const router = useRouter();
  const toast = useToast();
  const [createTournament, { isLoading }] = useCreateSponsoredTournamentMutation();
  const { data: stats } = useGetPartnerStatsQuery();

  const todayStr = toDateInputValue(new Date());

  const form = useForm<CreateSponsoredTournamentPayload>({
    resolver: yupResolver(
      getCreateSponsoredTournamentSchema(t)
    ) as Resolver<CreateSponsoredTournamentPayload>,
    mode: 'onBlur',
    defaultValues: {
      name: '',
      type: 'gold',
      shardType: 'speed',
      prizePool: cfg.defaultPrizePool,
      teamSize: cfg.defaultTeamSize,
      startDate: todayStr,
      startTime: '12:00',
      sponsorName: '',
      logoUrl: '',
      bannerUrl: '',
      sponsorUrl: '',
    },
  });

  const { control, setValue } = form;
  const type = useWatch({ control, name: 'type' });
  const prizePool = useWatch({ control, name: 'prizePool' });
  const startTime = useWatch({ control, name: 'startTime' });
  const tonUsdRate = useTonUsdRate();

  // Live cost preview — mirrors the server-side recompute on create, including
  // the TON price it converts the prize pool at.
  const cost = computeSponsoredTournamentCost(Number(prizePool) || 0, tonUsdRate);
  const insufficient = stats?.balanceTon != null && stats.balanceTon < cost.totalTon;

  const onSubmit = async (values: CreateSponsoredTournamentPayload) => {
    // Portal is gated → don't create, just surface the Coming Soon notice.
    if (!partnersEnabled) {
      toast.info(t('partners coming soon toast'));
      return;
    }
    try {
      await createTournament(values).unwrap();
      // Mandatory moderation (§11.8): back to the cabinet, where the new
      // tournament shows under "My Tournaments" as "In Review" until approved.
      toast.success(t('tournament submitted'));
      router.push(routes.partners.index);
    } catch (err) {
      // Backend rejects an underfunded advertiser with 400 "Not enough TON balance"
      // (not 402) — match the message so the specific copy actually shows.
      const error = err as { status?: number; data?: { message?: string } };
      const isBalance = error.data?.message === 'Not enough TON balance';
      toast.error(isBalance ? t('insufficient balance') : t('failed to create tournament'));
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit} noStyle>
      <div className="flex flex-col gap-4 pb-4">
        <FormItem name="name" label={t('tournament name')}>
          <Input
            prefix={<Trophy className="text-pink-secondary h-4 w-4" />}
            placeholder={t('tournament name placeholder')}
            maxLength={appConfig.partners.form.titleMaxLength}
          />
        </FormItem>

        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>{t('tier')}</span>
          <SponsoredTierSelector
            value={type}
            onChange={tier => setValue('type', tier, { shouldValidate: true })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>{t('prize pool')}</span>
          <NumberStepper
            value={Number(prizePool) || 0}
            onChange={n => setValue('prizePool', n, { shouldValidate: true })}
            step={cfg.prizePoolStep}
            min={cfg.prizePoolMin}
            max={cfg.prizePoolMax}
            suffix={<LcLabel size={16} />}
          />
          <span className="text-white-secondary/50 inline-flex items-center gap-1 text-[11px] font-medium">
            {formatCompact(cfg.prizePoolMin)}–{formatCompact(cfg.prizePoolMax)}
            <LcLabel size={11} />
          </span>
        </div>

        <FormItem name="startDate" label={t('start date')}>
          <Input
            type="date"
            min={todayStr}
            prefix={<CalendarDays className="text-pink-secondary h-4 w-4" />}
            classNames={{ input: 'date-input-light' }}
          />
        </FormItem>

        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>{t('start time')}</span>
          <PartnerStartTimeSelector
            value={startTime}
            onChange={time => setValue('startTime', time, { shouldValidate: true })}
          />
        </div>

        {/* Branding */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
          <span className="text-white-secondary/60 text-[11px] font-bold uppercase tracking-wider">
            {t('branding')}
          </span>

          <FormItem name="sponsorName" label={t('brand name')}>
            <Input
              prefix={<Type className="text-pink-secondary h-4 w-4" />}
              placeholder={t('brand name placeholder')}
              maxLength={appConfig.partners.form.titleMaxLength}
            />
          </FormItem>

          <FormItem
            name="logoUrl"
            label={t('logo url')}
            infoMessage={t('logo url hint', { size: `${cfg.logoSize.w}×${cfg.logoSize.h}` })}
          >
            <Input
              type="url"
              inputMode="url"
              prefix={<ImageIcon className="text-pink-secondary h-4 w-4" />}
              placeholder="https://"
            />
          </FormItem>

          <FormItem
            name="bannerUrl"
            label={t('banner url')}
            infoMessage={t('banner url hint', { size: `${cfg.bannerSize.w}×${cfg.bannerSize.h}` })}
          >
            <Input
              type="url"
              inputMode="url"
              prefix={<ImageIcon className="text-pink-secondary h-4 w-4" />}
              placeholder="https://"
            />
          </FormItem>

          <FormItem name="sponsorUrl" label={t('sponsor link')}>
            <Input
              type="url"
              inputMode="url"
              prefix={<Link2 className="text-pink-secondary h-4 w-4" />}
              placeholder="https://"
            />
          </FormItem>
        </div>

        {/* Cost summary */}
        <div className="bg-background-overlay flex flex-col gap-2 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-white-secondary inline-flex items-center gap-1.5">
              <Coins className="text-pink-secondary h-3.5 w-3.5" />
              {t('creation fee')}
            </span>
            <TonAmount value={cost.feeTon} size={13} />
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-white-secondary inline-flex items-center gap-1.5">
              <Trophy className="text-pink-secondary h-3.5 w-3.5" />
              {t('prize funding')}
              <span className="text-white-secondary/50 inline-flex items-center gap-0.5 text-[11px]">
                ({formatCompact(Number(prizePool) || 0)}
                <LcLabel size={11} />)
              </span>
            </span>
            <TonAmount value={cost.prizeTon} size={13} />
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2">
            <span className="text-sm font-bold text-white">{t('total due')}</span>
            <TonAmount
              value={cost.totalTon}
              size={15}
              classNames={{ value: 'font-extrabold text-white' }}
            />
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="from-background via-background sticky bottom-0 -mx-5 bg-gradient-to-t to-transparent px-5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-4">
        {insufficient && (
          <p className="text-error-text mb-2 text-center text-[11px] font-semibold">
            {t('insufficient balance')}
          </p>
        )}
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 flex-col gap-1">
            <span className="text-white-secondary/60 text-[10px] font-bold uppercase leading-none tracking-wider">
              {t('total due')}
            </span>
            <TonAmount
              value={cost.totalTon}
              size={16}
              classNames={{ value: 'text-base font-extrabold text-white' }}
            />
          </div>
          <Button type="submit" loading={isLoading} disabled={insufficient} className="flex-1">
            {t('create tournament')}
          </Button>
        </div>
        {!partnersEnabled && (
          <p className="text-white-secondary/60 mt-2 text-center text-[11px] font-medium">
            {t('partners preview submit hint')}
          </p>
        )}
      </div>
    </Form>
  );
}
