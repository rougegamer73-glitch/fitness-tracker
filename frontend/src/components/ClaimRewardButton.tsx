import React, { useState } from "react";
import {
  AchievementCode,
  claimAchievementOnChain,
} from "../services/contract";

interface Props {
  achievementCode: AchievementCode;
  alreadyClaimed: boolean;
  onClaimed: () => void;
}

const ClaimRewardButton: React.FC<Props> = ({
  achievementCode,
  alreadyClaimed,
  onClaimed,
}) => {
  const [status, setStatus] = useState("");

  const claimHandler = async () => {
    try {
      setStatus("Waiting for MetaMask confirmation...");
      const receipt = await claimAchievementOnChain(achievementCode);

      setStatus(`Confirmed in block ${receipt.blockNumber}`);
      onClaimed();
    } catch (error: any) {
      setStatus(error.message || "Transaction failed.");
    }
  };

  if (alreadyClaimed) {
    return <button disabled>Already Claimed</button>;
  }

  return (
    <div>
      <button onClick={claimHandler}>Claim on Blockchain</button>
      {status && <p className="message">{status}</p>}
    </div>
  );
};

export default ClaimRewardButton;