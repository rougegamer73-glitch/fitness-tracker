import React from "react";
import AchievementCard from "./AchievementCard";
import { AchievementCode } from "../services/contract";

interface Props {
  eligibleAchievements: AchievementCode[];
  claimedAchievements: string[];
  walletConnected: boolean;
  onClaimed: () => void;
}

const allAchievements: AchievementCode[] = [
  "FIRST_WORKOUT",
  "TEN_THOUSAND_STEPS",
  "FIVE_HUNDRED_CALORIES",
];

const AchievementList: React.FC<Props> = ({
  eligibleAchievements,
  claimedAchievements,
  walletConnected,
  onClaimed,
}) => {
  return (
    <div className="panel">
      <h2>Achievements</h2>

      <div className="achievement-grid">
        {allAchievements.map((code) => (
          <AchievementCard
            key={code}
            code={code}
            eligible={eligibleAchievements.includes(code)}
            claimed={claimedAchievements.includes(code)}
            walletConnected={walletConnected}
            onClaimed={onClaimed}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementList;