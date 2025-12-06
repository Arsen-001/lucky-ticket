import { getAppTranslations } from '@/i18n/getAppTranslations';
import { ResetPasswordForm } from '@/components/pages/auth/reset-password/ResetPasswordForm';

export default async function ResetPasswordPage() {
  const t = await getAppTranslations();

  return (
    <div className="text-white-secondary flex flex-col justify-between h-full">
      <div>
        <h1 className="text-center text-2xl mt-6 text-white">
          {t('reset password')}
        </h1>

        <p className="text-center text-lg mt-2 px-10">
          {t('reset password description')}
        </p>

        <div className="flex flex-col w-full mt-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
