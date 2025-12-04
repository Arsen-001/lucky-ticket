import { getAppTranslations } from "@/i18n/getAppTranslations";

export default async function LoginPage() {
  const tag = await getAppTranslations();
  return <div className="bg-purple-gradient">{tag("hello world")}</div>;
}
