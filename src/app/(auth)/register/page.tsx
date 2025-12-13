import { getAppTranslations } from '@/i18n/getAppTranslations';
import { AuthLink } from '@/components/shared/links/AuthLink';
import { Divider } from '@/components/shared/Divider';
import { GoogleSignInButton } from '@/components/shared/buttons/GoogleSignInButton';
import { routes } from '@/constants/routes';
import { RegisterForm } from '@/components/pages/auth/register/RegisterForm';

export default async function RegisterPage() {
  const t = await getAppTranslations();

  return (
    <div className="text-white-secondary flex flex-col justify-between gap-8 h-full">
      <div>
        <h1 className="text-center text-2xl mt-6 text-white">{t('sign up')}</h1>

        <p className="text-center text-lg mt-2 px-10">{t('sign up description')}</p>

        <div className="flex flex-col w-full mt-8">
          <RegisterForm />

          <Divider className="mt-6" />
          <GoogleSignInButton />
        </div>
      </div>

      <p className="text-center text-sm">
        {t('already have an account')} <AuthLink href={routes.login}>{t('sign in')}</AuthLink>
      </p>
    </div>
  );
}
