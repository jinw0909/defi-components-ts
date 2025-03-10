import React, { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatUnits, Contract } from "ethers";
import { useDispatch } from "react-redux";
import { updateWallet, clearWallet } from "../../context/walletSlice";
import {EIP1193Provider, useMetaMaskProvider} from "../../utils/useMetaMaskProvider";

const tokenAddress = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

// Helper function to fetch the ERC20 token balance
const fetchTokenBalance = async (provider: any, address: any) => {
    // Create an ethers BrowserProvider from the injected provider
    const ethersProvider = new BrowserProvider(provider);

    // Create a contract instance for the token
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, ethersProvider);
    const rawTokenBalance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    const tokenBalance = formatUnits(rawTokenBalance, decimals);
    console.log("tokenBalance: ", tokenBalance);
    return tokenBalance;
};

const MetamaskConnect = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState<EIP1193Provider>();
    const [account, setAccount] = useState<string | null>(null);

    const { getMetaMaskProvider } = useMetaMaskProvider();

    // On mount, detect the MetaMask provider.
    useEffect(() => {
        async function detectProvider() {
            const detectedProvider = getMetaMaskProvider();
            if (detectedProvider) {
                console.log('MetaMask provider detected');
                setProvider(detectedProvider);
            } else {
                console.error('MetaMask is not installed');
            }
        }
        detectProvider();
    }, [getMetaMaskProvider]);

    // Disconnect: clear local state and update Redux state
    const handleDisconnect = useCallback(() => {
        setAccount(null);
        dispatch(clearWallet());
    }, [dispatch]);

    // Connect: request accounts, fetch token balance, and update Redux state
    const handleConnect = useCallback(async () =>  {
        if (!provider || loading) return;
        setLoading(true);
        try {
            const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
            console.log('All eth accounts: ', accounts);
            const userAccount = accounts[0];
            console.log('Connected account:', userAccount);
            setAccount(userAccount);

            // Fetch the token balance
            const tokenBalance = await fetchTokenBalance(provider, userAccount);
            console.log('Token Balance:', tokenBalance);

            // Update the Redux store with wallet data
            dispatch(updateWallet({
                walletName: 'metamask',
                publicKey: userAccount,
                tokenBalance,
                //disconnect: handleDisconnect,
            }));
        } catch (error) {
            console.error('Error connecting MetaMask:', error);
        } finally {
            setLoading(false);
        }
    }, [provider, loading, dispatch]);

    // Listen for chain and account events
    useEffect(() => {
        if (!provider) return;
        console.log('useEffect registered');
        // console.log('Provider is MetaMask? : ', provider.isMetaMask);
        const handleChainChanged = (chainId: any) => {
            console.log('Chain changed to:', chainId);
            window.location.reload();
        };

        // provider.on('chainChanged', handleChainChanged);
        // provider.on('connect', (connectInfo) => {
        //     console.log("MetaMask connectInfo: ", connectInfo);
        //     console.log("Connection status: ", provider.isConnected);
        // });
        // provider.on('disconnect', () => {
        //     console.log("MetaMask wallet disconnected");
        // });
        // provider.on('accountsChanged', (accounts) => {
        //     console.log("Accounts changed: ", accounts);
        // });

        return () => {
            // provider.removeListener('chainChanged', handleChainChanged);
            // console.log("Cleaning up event listeners");
        };
    }, [provider]);

    return (
        <div>
            {!provider ? (
                <button disabled>
                    MetaMask Not Installed
                </button>
            ) : !account ? (
                <button onClick={handleConnect} disabled={loading}>
                    {loading ? "Connecting..." : "Connect to MetaMask"}
                </button>
            ) : (
                <div>
                    <p>Connected Account: {account}</p>
                    <button onClick={handleDisconnect}>Disconnect</button>
                </div>
            )}
        </div>
    );
};

export default React.memo(MetamaskConnect);
