import React, { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatUnits, Contract } from "ethers";
import { useDispatch } from "react-redux";
import { updateWallet, clearWallet } from "../../context/walletSlice";
import {EIP1193Provider, EIP6963ProviderInfo, useEvmProvider} from "../../utils/useEvmProvider";

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

const OkxWalletConnect = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState<EIP1193Provider>();
    const [info, setInfo] = useState<EIP6963ProviderInfo>();
    const [account, setAccount] = useState<string | null>(null);

    const { getOkxWalletProvider } = useEvmProvider();

    // On mount, detect the MetaMask provider.
    useEffect(() => {
        async function detectProvider() {
            const okxDetail = getOkxWalletProvider();
            if (okxDetail) {
                const { info, provider } = okxDetail;
                console.log("OKX Wallet provider detected / Provider name:", info.name);
                setProvider(provider);
                setInfo(info);
            } else {
                console.log("OKX Wallet is not installed");
            }
        }
        detectProvider();
    }, [getOkxWalletProvider]);

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

            const icon = info?.icon;

            // Update the Redux store with wallet data
            dispatch(updateWallet({
                walletName: 'OKX Wallet',
                publicKey: userAccount,
                tokenBalance,
                icon
                //disconnect: handleDisconnect,
            }));
        } catch (error) {
            console.error('Error connecting OKX Wallet:', error);
        } finally {
            setLoading(false);
        }
    }, [provider, loading, info?.icon, dispatch]);

    // Listen for chain and account events
    useEffect(() => {
        if (!provider) return;
        console.log('useEffect registered');
        // console.log('Provider is MetaMask? : ', provider.isMetaMask);
        const handleChainChanged = (chainId: any) => {
            console.log('Chain changed to:', chainId);
            window.location.reload();
        };

        return () => {
            // provider.removeListener('chainChanged', handleChainChanged);
            // console.log("Cleaning up event listeners");
        };
    }, [provider]);

    return (
        <div style={{margin: '8px'}}>
            {!provider ? (
                <button disabled style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px'}}>
                    <img style={{width: '16px', height: '16px'}} src={info?.icon} alt="OKX icon"/>
                    Okx Wallet Not Installed
                </button>
            ) : (
                <button onClick={handleConnect} disabled={loading} style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px'}}>
                    <img style={{width: '16px', height: '16px'}} src={info?.icon} alt="OKX icon"/>
                    {loading ? "Connecting..." : "Connect to OKX Wallet"}
                </button>
            )}
        </div>
    );
};

export default React.memo(OkxWalletConnect);
