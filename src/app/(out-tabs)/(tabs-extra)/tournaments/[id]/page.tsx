import { TournamentInfo } from '@/components/pages/out-tabs/tabs-extra/tournament/TournamentInfo';
import { TournamentPlacements } from '@/components/pages/out-tabs/tabs-extra/tournament/TournamentPlacements';

export default async function TournamentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(116, 61, 245, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 100% 100%, rgba(222, 0, 155, 0.10) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 0% 60%, rgba(23, 141, 136, 0.06) 0%, transparent 60%)
          `,
        }}
      />
      <TournamentInfo id={id} />
      <TournamentPlacements id={id} />
    </>
  );
}
