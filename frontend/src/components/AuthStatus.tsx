import { ReactElement } from 'react';
import styled from 'styled-components';

const StyledStatus = styled.section`
  display: grid;
  gap: 8px;
  padding: 16px;
  border: 1px solid #d6d3d1;
  border-radius: 6px;
  background: #ffffff;
`;

const StyledTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  color: #143d59;
`;

const StyledText = styled.p`
  margin: 0;
  color: #374151;
  overflow-wrap: anywhere;
`;

interface AuthStatusProps {
  displayName: string;
  walletAddress: string;
  token: string;
}

export function AuthStatus({
  displayName,
  walletAddress,
  token
}: AuthStatusProps): ReactElement {
  const isLoggedIn = Boolean(token && walletAddress);

  return (
    <StyledStatus aria-live="polite">
      <StyledTitle>Backend Auth</StyledTitle>
      {isLoggedIn ? (
        <>
          <StyledText>
            Signed in as <strong>{displayName || 'FitChain User'}</strong>
          </StyledText>
          <StyledText>{walletAddress}</StyledText>
        </>
      ) : (
        <StyledText>Connect MetaMask and sign in to use the API.</StyledText>
      )}
    </StyledStatus>
  );
}
