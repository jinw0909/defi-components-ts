import React, {useCallback, useEffect, useState} from 'react';
import {BrowserProvider, hexlify, toUtf8Bytes} from "ethers";
import {useDispatch, useSelector} from "react-redux";
import {clearWallet, updateWallet, WalletState} from "../../context/walletSlice";
import {EIP1193Provider, EIP6963ProviderInfo, useEvmProvider} from "../../utils/useEvmProvider";
import {RootState} from "../../context/store";

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
    // const tokenContract = new Contract(tokenAddress, ERC20_ABI, ethersProvider);
    // const rawTokenBalance = await tokenContract.balanceOf(address);
    // const decimals = await tokenContract.decimals();
    // const tokenBalance = formatUnits(rawTokenBalance, decimals);
    // console.log("tokenBalance: ", tokenBalance);
    return 0;
};

const OkxWalletConnect = () => {
    const dispatch = useDispatch();
    const wallet = useSelector((state: RootState) => state.wallet) as WalletState | null;
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

    useEffect(() => {
        // Only run if a wallet is connected and it's MetaMask.
        if (wallet && wallet.publicKey && wallet.rdns === "com.okex.wallet") {
            const signAndAuthenticate = async () => {
                try {
                    // Step 1: Get the challenge from the backend.
                    const challengeResponse = await fetch(`${process.env.REACT_APP_SERVER}/auth/challenge?publicKey=${wallet.publicKey}`);
                    if (!challengeResponse.ok) {
                        throw new Error("Failed to fetch challenge");
                    }
                    const challenge = await challengeResponse.text()
                    console.log("Received challenge:", challenge);
                    console.log("challengeResponse: ", challengeResponse);
                    // const messageHash = ethers.hashMessage(challenge);
                    // console.log("Computed Message Hash:", messageHash);
                    // const challengeHex = `0x${Buffer.from(challenge, "utf8").toString("hex")}`;
                    const challengeHex = hexlify(toUtf8Bytes(challenge));
                    // Step 2: Use MetaMask to sign the challenge.
                    if (!provider) {
                        throw new Error("OKX wallet is not available");
                    }
                    const signature = await provider.request({
                        method: "personal_sign",
                        params: [challengeHex, wallet.publicKey],
                    });
                    console.log("Signature:", signature);

                    // Step 3: Send authentication request with the signed challenge.
                    const authResponse = await fetch(`${process.env.REACT_APP_SERVER}/auth/wallet`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            walletName: wallet.walletName,
                            publicKey: wallet.publicKey,
                            challenge,
                            signature,
                        }),
                    });

                    if (!authResponse.ok) {
                        throw new Error("Authentication failed");
                    }
                    const authData = await authResponse.json();
                    console.log("Authentication successful:", authData);
                    // Optionally, update your Redux state or perform further actions with authData.

                } catch (error: any) {
                    console.error("Error during authentication:", error.message);
                }
            };

            signAndAuthenticate();
        }
    }, [provider, wallet]);

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
            const rdns = info?.rdns;

            // Update the Redux store with wallet data
            dispatch(updateWallet({
                walletName: 'OKX Wallet',
                publicKey: userAccount,
                tokenBalance,
                icon,
                rdns
                //disconnect: handleDisconnect,
            }));
        } catch (error) {
            console.error('Error connecting OKX Wallet:', error);
        } finally {
            setLoading(false);
        }
    }, [provider, loading, info?.icon, info?.rdns, dispatch]);



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
