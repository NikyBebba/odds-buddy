'use client';

import MatchVibesHub from '@/components/MatchVibesHub';
import LegendsQuiz from '@/components/LegendsQuiz';

export default function TabExtra({ match }) {
  return (
    <div className="space-y-4">
      <LegendsQuiz />
      <MatchVibesHub homeTeam={match.homeTeam} awayTeam={match.awayTeam} analytics={match.analytics} />
    </div>
  );
}