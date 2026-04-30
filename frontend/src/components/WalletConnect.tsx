import { ethers } from 'ethers';
import { FormEvent, ReactElement, useEffect, useState } from 'react';
import styled from 'styled-components';
import { HARDHAT_CHAIN_ID } from './NetworkWarning';
import {
  requestLoginNonce,
  verifyWalletSignature,
} from '../services/backendApi';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const AUTH_TOKEN_KEY = 'fitchain_auth_token';

const StyledPanel = styled.section`
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid #d6d3d1;
  border-radius: 6px;
  background: #ffffff;
`;

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto auto;
  gap: 10px;
  align-items: center;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const StyledInput = styled.input`
  height: 2.25rem;
  border: 1px solid #a8a29e;
  border-radius: 6px;
  padding: 0 10px;
`;

const StyledButton = styled.button`
  min-height: 2.25rem;
  border: 1px solid #143d59;
  border-radius: 6px;
  background: #143d59;
  color: #ffffff;
  cursor: pointer;
  padding: 0 14px;

  &:disabled {
    border-color: #a8a29e;
    background: #d6d3d1;
    color: #57534e;
    cursor: not-allowed;
  }
`;

const StyledSecondaryButton = styled(StyledButton)`
  border-color: #78716c;
  background: #ffffff;
  color: #292524;
`;

const StyledMessage = styled.p`
  margin: 0;
  color: #374151;
`;

const StyledError = styled.p`
  margin: 0;
  color: #b91c1c;
`;

export interface AuthSession {
  token: string;
  walletAddress: string;
  displayName: string;
}

interface WalletConnectProps {
  onChainChanged: (chainId?: number) => void;
  onSessionChanged: (session: AuthSession) => void;
  onWalletChanged: (walletAddress: string) => void;
}

export function WalletConnect({
  onChainChanged,
  onSessionChanged,
  onWalletChanged,
}: WalletConnectProps): ReactElement {
  const [displayName, setDisplayName] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    async function refreshChainId(): Promise<void> {
      try {
        const chainIdHex = await window.ethereum.request({
          method: 'eth_chainId',
        });

        onChainChanged(Number(chainIdHex));
      } catch {
        onChainChanged(undefined);
      }
    }

    function handleChainChanged(chainIdHex: string): void {
      onChainChanged(Number(chainIdHex));
    }

    function handleAccountsChanged(accounts: string[]): void {
      const nextWalletAddress = accounts[0] || '';
      setWalletAddress(nextWalletAddress);
      onWalletChanged(nextWalletAddress);
    }

    refreshChainId();

    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return (): void => {
      if (!window.ethereum?.removeListener) {
        return;
      }

      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [onChainChanged, onWalletChanged]);

  async function handleLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage('');

    if (!window.ethereum) {
      setErrorMessage('MetaMask is not installed.');
      return;
    }

    setIsConnecting(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const accounts: string[] = await provider.send('eth_requestAccounts', []);

      if (!accounts || accounts.length === 0) {
        throw new Error('No MetaMask account selected.');
      }

      const connectedWallet = accounts[0].toLowerCase();
      const network = await provider.getNetwork();

      onChainChanged(network.chainId);
      setWalletAddress(connectedWallet);
      onWalletChanged(connectedWallet);

      if (network.chainId !== HARDHAT_CHAIN_ID) {
        setErrorMessage('Switch MetaMask to Hardhat Local Network before login.');
        return;
      }

      const nonceResponse = await requestLoginNonce(connectedWallet);

      if (!nonceResponse.message) {
        throw new Error('Backend did not return a login message.');
      }

      const signature = await provider
        .getSigner()
        .signMessage(nonceResponse.message);

      const authResponse = await verifyWalletSignature(
        connectedWallet,
        signature,
        displayName.trim() || undefined
      );

      if (!authResponse.token) {
        throw new Error('Backend did not return an authentication token.');
      }

      const safeDisplayName =
        authResponse.user?.displayName ||
        displayName.trim() ||
        'FitChain User';

      const safeWalletAddress =
        authResponse.user?.walletAddress?.toLowerCase() || connectedWallet;

      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);

      onSessionChanged({
        token: authResponse.token,
        walletAddress: safeWalletAddress,
        displayName: safeDisplayName,
      });
    } catch (error: any) {
      setErrorMessage(error?.message || 'Wallet login failed.');
    } finally {
      setIsConnecting(false);
    }
  }

  function handleLogout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('fitchain_token');

    setWalletAddress('');
    setDisplayName('');
    setErrorMessage('');

    onWalletChanged('');

    onSessionChanged({
      token: '',
      walletAddress: '',
      displayName: '',
    });
  }

  return (
    <StyledPanel>
      <StyledForm onSubmit={handleLogin}>
        <StyledInput
          aria-label="Display name"
          placeholder="Display name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />

        <StyledButton type="submit" disabled={isConnecting}>
          {isConnecting ? 'Signing in...' : 'Connect and Sign In'}
        </StyledButton>

        <StyledSecondaryButton type="button" onClick={handleLogout}>
          Sign Out
        </StyledSecondaryButton>
      </StyledForm>

      {walletAddress ? (
        <StyledMessage>Connected wallet: {walletAddress}</StyledMessage>
      ) : (
        <StyledMessage>MetaMask wallet not connected.</StyledMessage>
      )}

      {errorMessage ? (
        <StyledError role="alert">{errorMessage}</StyledError>
      ) : null}
    </StyledPanel>
  );
}

export { AUTH_TOKEN_KEY };