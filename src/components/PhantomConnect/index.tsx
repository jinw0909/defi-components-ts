import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import getPhantomProvider from '../../utils/getPhantomProvider';
import bs58 from 'bs58';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {useDispatch, useSelector} from "react-redux";
import {updateWallet, clearWallet, WalletState} from "../../context/walletSlice";
import {Buffer} from "buffer";
import {RootState} from "../../context/store";

const CUSTOM_RPC_URL = 'https://winter-evocative-silence.solana-mainnet.quiknode.pro/04a5e639b0bd9ceeec758a6140dc1aa1b08f62bd';
const connection = new Connection(CUSTOM_RPC_URL);
const provider = getPhantomProvider();
const PHANTOM_ICON = "data:image/png;base64,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";

const usePhantomProps = () => {
    const dispatch = useDispatch();
    const wallet = useSelector((state: RootState) => state.wallet) as WalletState | null;
    const [publicKey, setPublicKey] = useState(null);

    const handleDisconnect = useCallback(async () => {
        console.log("calling phantom handleDisconnect()");
        if (!provider) return;
        try {
            await provider.disconnect();
            dispatch(clearWallet());
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
        }
    }, [dispatch]);

    // Connect function to trigger wallet connection
    const handleConnect = useCallback(async () => {
        if (!provider) return;
        try {
            await provider.connect();
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
        }
    }, []);

    // Fetch SOL balance for the connected wallet
    const handleFetchSolana = useCallback(async () => {
        if (!provider || !provider.publicKey) return;
        try {
            let walletPublicKey = new PublicKey(provider.publicKey.toBase58());
            console.log("walletPublicKey: ", walletPublicKey);
            const balanceLamports = await connection.getBalance(walletPublicKey);
            const balanceSOL = balanceLamports / 1e9;
            console.log("balanceSOL: ", balanceSOL);
            return balanceSOL;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
        }
    }, []);

    const handleFetchToken = useCallback(async () => {
        if (!provider || !provider.publicKey) return;
        try {
            const walletPublicKey = new PublicKey(provider.publicKey.toBase58());
            const tokenMintAddress = new PublicKey("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN");

            // Fetch all token accounts for the specified mint owned by the wallet.
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
                mint: tokenMintAddress,
            });

            // Sum up the uiAmount from all token accounts (if there are more than one).
            let tokenBalance = 0;
            tokenAccounts.value.forEach(({ account }) => {
                const tokenAmount = account.data.parsed.info.tokenAmount.uiAmount;
                tokenBalance += tokenAmount;
            });

            console.log("Token Balance:", tokenBalance);
            return tokenBalance;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
        }
    }, []);


    const connectedMethods = useMemo(() => [
        { name: 'Disconnect', onClick: handleDisconnect }
    ], [handleDisconnect]);

    // const prevWalletKey = useRef<string | null>(null);

    useEffect(() => {
        // Only run if a wallet is connected and it's MetaMask.
        if (wallet && wallet.publicKey && wallet.walletName === "phantom") {

            // Only run if the publicKey has changed
            // if (prevWalletKey.current === wallet.publicKey) return;
            // prevWalletKey.current = wallet.publicKey;
            const signAndAuthenticate = async () => {
                try {
                    // Step 1: Get the challenge from the backend.
                    const challengeResponse = await fetch(`${process.env.REACT_APP_SERVER}/auth/challenge?publicKey=${wallet.publicKey}`);
                    if (!challengeResponse.ok) {
                        throw new Error("Failed to fetch challenge");
                    }
                    const challenge = await challengeResponse.text()
                    console.log("Received challenge:", challenge);
                    // const messageHash = ethers.hashMessage(challenge);
                    // console.log("Computed Message Hash:", messageHash);
                    const encodedChallenge = new TextEncoder().encode(challenge);
                    // Step 2: Use MetaMask to sign the challenge.
                    if (!provider) {
                        throw new Error("OKX wallet is not available");
                    }
                    const signedMessage = await provider.signMessage(encodedChallenge);
                    const signature = bs58.encode(signedMessage.signature);
                    console.log("Signature: ", signature);

                    // Step 3: Send authentication request with the signed challenge.
                    const authResponse = await fetch(`${process.env.REACT_APP_SERVER}/auth/phantom`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
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
    }, [wallet]);

    useEffect(() => {
        if (!provider) return;

        provider.on('connect', async (pk) => {
            const keyStr = pk.toBase58();
            console.log('Phantom connected:', keyStr);
            setPublicKey(keyStr);
            // let solAmount = await handleFetchSolana();

            //let tokenAmount = await handleFetchToken();

            // Update Redux state without including the disconnect function.
            dispatch(updateWallet({
                walletName: 'phantom',
                publicKey: keyStr,
                // tokenBalance: tokenAmount,
                icon: PHANTOM_ICON }));
        });

        provider.on('disconnect', () => {
            console.log('Phantom disconnected');
            setPublicKey(null);
            dispatch(clearWallet());
        });

        provider.on('accountChanged', (pk) => {
            if (pk) {
                console.log('Switched to Phantom account:', pk.toBase58());
                setPublicKey(pk.toBase58());
            } else {
                // Attempt to reconnect if needed.
                provider.connect().catch((error) => {
                    console.error(`Failed to re-connect: ${error.message}`);
                });
            }
        });

        return () => {
            // provider.removeAllListeners('connect');
            // provider.removeAllListeners('disconnect');
            // provider.removeAllListeners('accountChanged');
            provider.disconnect();
        };
    }, [dispatch, handleDisconnect, handleFetchSolana, handleFetchToken]);

    return {
        publicKey,
        connectedMethods,
        handleConnect,
        handleDisconnect,
    };
};

const PhantomConnect = () => {
    const phantomProps = usePhantomProps();

    return (
        <div style={{margin: '8px'}}>
            {!provider ? (
            <button disabled style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px'}}>
                <img style={{width: '16px', height: '16px'}} src={PHANTOM_ICON} alt="phantom icon"/>
                Phantom Not Installed
            </button>
        ) : (
                <button onClick={phantomProps.handleConnect} style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px'}}>
                    <img style={{width: '16px', height: '16px'}} src={PHANTOM_ICON} alt="phantom icon"/>
                    Connect to Phantom
                </button>
            )}
        </div>
    );
};

export default React.memo(PhantomConnect);
