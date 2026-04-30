import { useWeb3React } from '@web3-react/core';
import { ReactElement, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  ACHIEVEMENT_REWARDS,
  AchievementCode,
  getRewardBalance,
  getUserAchievements,
  hasAchievement
} from '../services/contract';
import { Provider } from '../utils/provider';

const StyledContractPanel = styled.section`
  display: grid;
  gap: 12px;
  place-self: center;
  max-width: 680px;
  text-align: center;
`;

const StyledHeading = styled.h2`
  margin: 0;
  color: #143d59;
`;

const StyledCopy = styled.p`
  margin: 0;
  color: #4a5568;
`;

const StyledStatus = styled.div`
  justify-self: center;
  min-width: 220px;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  border: 1px solid #2f855a;
  color: #22543d;
  background: #f0fff4;
`;

const StyledControls = styled.div`
  display: grid;
  gap: 8px;
  justify-items: center;
`;

export function ContractSandbox(): ReactElement {
  const { active, account } = useWeb3React<Provider>();
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementCode>('FIRST_WORKOUT');
  const [status, setStatus] = useState('');
  const [rewardBalance, setRewardBalance] = useState<number | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [selectedClaimed, setSelectedClaimed] = useState<boolean | null>(null);

  const rewardHint = useMemo(
    () => ACHIEVEMENT_REWARDS[selectedAchievement],
    [selectedAchievement]
  );

  async function readContractState(): Promise<void> {
    if (!account) {
      setStatus('Connect wallet first.');
      return;
    }

    try {
      setStatus('Reading contract...');
      const [balance, unlocked, claimed] = await Promise.all([
        getRewardBalance(account),
        getUserAchievements(account),
        hasAchievement(account, selectedAchievement)
      ]);

      setRewardBalance(balance);
      setAchievements(unlocked);
      setSelectedClaimed(claimed);
      setStatus('Contract state loaded.');
    } catch (error: any) {
      setStatus(error?.message || 'Could not read contract.');
    }
  }

  return (
    <StyledContractPanel>
      <StyledHeading>Smart Contract Sandbox</StyledHeading>
      <StyledCopy>
        Test read-only calls against the FitnessAchievement contract. This keeps
        the original starter sandbox concept while using FitChain functions.
      </StyledCopy>
      <StyledStatus>{active ? 'Wallet connected' : 'Wallet not connected'}</StyledStatus>
      <StyledControls>
        <select
          value={selectedAchievement}
          onChange={(event) =>
            setSelectedAchievement(event.target.value as AchievementCode)
          }
        >
          <option value="FIRST_WORKOUT">FIRST_WORKOUT</option>
          <option value="TEN_THOUSAND_STEPS">TEN_THOUSAND_STEPS</option>
          <option value="FIVE_HUNDRED_CALORIES">FIVE_HUNDRED_CALORIES</option>
          <option value="SEVEN_DAY_STREAK">SEVEN_DAY_STREAK</option>
        </select>
        <button onClick={readContractState}>Read Contract State</button>
        <StyledCopy>
          Selected reward: <strong>{rewardHint} FIT</strong>
        </StyledCopy>
        <StyledCopy>
          Reward balance: <strong>{rewardBalance ?? '-'}</strong>
        </StyledCopy>
        <StyledCopy>
          Selected achievement claimed:{' '}
          <strong>
            {selectedClaimed === null ? '-' : selectedClaimed ? 'Yes' : 'No'}
          </strong>
        </StyledCopy>
        <StyledCopy>
          On-chain achievements: <strong>{achievements.join(', ') || 'None'}</strong>
        </StyledCopy>
        <StyledCopy>{status}</StyledCopy>
      </StyledControls>
    </StyledContractPanel>
  );
}
