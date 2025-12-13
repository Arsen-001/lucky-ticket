import { getAppTranslations } from '@/i18n/getAppTranslations';
import { ForgotPasswordForm } from '@/components/pages/auth/forgot-password/ForgotPasswordForm';
import { AuthLink } from '@/components/shared/links/AuthLink';
import { routes } from '@/constants/routes';

export default async function ForgotPasswordPage() {
  const t = await getAppTranslations();

  return (
    <div className="text-white-secondary flex flex-col justify-between h-full">
      <div>
        <h1 className="text-center text-2xl mt-6 text-white">{t('reset password')}</h1>

        <p className="text-center text-lg mt-2 px-10">{t('reset password description')}</p>

        <div className="flex flex-col w-full mt-8">
          <ForgotPasswordForm />

          <div className="flex  justify-center text-pink underline mt-5 mb-6">
            <AuthLink className="text-white-secondary" href={routes.login}>
              {t('back to sign in')}
            </AuthLink>
          </div>
        </div>
      </div>

      <p className="text-center text-sm">
        {t('dont have an account yet')} <AuthLink href={routes.register}>{t('sign up')}</AuthLink>
      </p>
    </div>
  );
}
