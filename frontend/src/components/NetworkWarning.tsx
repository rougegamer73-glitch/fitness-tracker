import { ReactElement } from 'react';
import styled from 'styled-components';

const HARDHAT_CHAIN_ID = 31337;

const StyledWarning = styled.div`
  border: 1px solid #b45309;
  background: #fffbeb;
  color: #92400e;
  padding: 12px 14px;
  border-radius: 6px;
  font-size: 0.95rem;
`;

interface NetworkWarningProps {
  chainId?: number;
  isWalletConnected: boolean;
}

export function NetworkWarning({
  chainId,
  isWalletConnected
}: NetworkWarningProps): ReactElement | null {
  if (!isWalletConnected || chainId === HARDHAT_CHAIN_ID) {
    return null;
  }

  return (
    <StyledWarning role="alert">
      Please switch MetaMask to Hardhat Local Network. Expected chain id{' '}
      {HARDHAT_CHAIN_ID}
      {chainId ? `, currently connected to ${chainId}.` : '.'}
    </StyledWarning>
  );
}

export { HARDHAT_CHAIN_ID };
