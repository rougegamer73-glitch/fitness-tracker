import React from "react";
import {
  AchievementCode,
  ACHIEVEMENT_LABELS,
  ACHIEVEMENT_REWARDS,
} from "../services/contract";
import ClaimRewardButton from "./ClaimRewardButton";

interface Props {
  code: AchievementCode;
  eligible: boolean;
  claimed: boolean;
  walletConnected: boolean;
  onClaimed: () => void;
}

const AchievementCard: React.FC<Props> = ({
  code,
  eligible,
  claimed,
  walletConnected,
  onClaimed,
}) => {
  return (
    <div className={`achievement-card ${claimed ? "claimed" : ""}`}>
      <h3>{ACHIEVEMENT_LABELS[code]}</h3>
      <p>{ACHIEVEMENT_REWARDS[code]} FIT reward points</p>

      {!walletConnected && !claimed && <span>Connect wallet first</span>}
      {walletConnected && !eligible && !claimed && <span>Not eligible yet</span>}

      {eligible && walletConnected && (
        <ClaimRewardButton
          achievementCode={code}
          alreadyClaimed={claimed}
          onClaimed={onClaimed}
        />
      )}

      {claimed && <span className="success">Stored on-chain</span>}
    </div>
  );
};

export default AchievementCard;
