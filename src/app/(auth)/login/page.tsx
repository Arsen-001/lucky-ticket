import { getAppTranslations } from '@/i18n/getAppTranslations';
import { LoginForm } from '@/components/pages/auth/login/LoginForm';
import { AuthLink } from '@/components/shared/links/AuthLink';
import { routes } from '@/constants/routes';
import { Divider } from '@/components/shared/Divider';
import { GoogleSignInButton } from '@/components/shared/buttons/GoogleSignInButton';

export default async function LoginPage() {
  const t = await getAppTranslations();
  return (
    <div className="text-white-secondary flex flex-col justify-between h-full">
      <div>
        <h1 className="text-center text-2xl mt-6 text-white">{t('sign in')}</h1>
        <p className="text-center text-lg mt-2 px-10">
          {t('sign in description')}
        </p>
        <div className="flex flex-col w-full mt-8">
          <LoginForm />

          <div className="flex justify-end text-pink underline mt-5 mb-6">
            <AuthLink
              className="text-white-secondary"
              href={routes.forgotPassword}
            >
              {t('forgot password')}
            </AuthLink>
          </div>

          <Divider />
          <GoogleSignInButton />
        </div>
      </div>
      <p className="text-center text-sm">
        {t('dont have an account yet')}{' '}
        <AuthLink href={'/register'}>{t('sign up')}</AuthLink>
      </p>
    </div>
  );
}
