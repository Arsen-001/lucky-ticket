import { getAppTranslations } from '@/i18n/getAppTranslations';
import { TwoFactorForm } from '@/components/pages/auth/two-factor/TwoFactorForm';
import { AuthLink } from '@/components/shared/links/AuthLink';
import { routes } from '@/constants/routes';

export default async function TwoFactorPage() {
  const t = await getAppTranslations();

  return (
    <div className="text-white-secondary flex flex-col justify-between h-full">
      <div>
        <h1 className="text-center text-2xl mt-6 text-white">{t('two factor authentication')}</h1>

        <p className="text-center text-lg mt-2 px-10">
          {t('enter the code from your authenticator app')}
        </p>

        <div className="flex flex-col w-full mt-8">
          <TwoFactorForm />

          <div className="flex justify-center mt-5 mb-6">
            <p className="text-center text-sm">
              {t('didn’t receive a code?')}{' '}
              <AuthLink href={routes.forgotPassword}>{t('resend')}</AuthLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
