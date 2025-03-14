import React, { useState, useEffect, useCallback } from 'react';
import {useDispatch, useSelector} from "react-redux";
import {updateWallet, clearWallet, WalletState} from "../../context/walletSlice";
import {RootState} from "../../context/store";

const AuthTest = () => {
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [tokenAmount, setTokenAmount] = useState(0);
    const wallet = useSelector((state:RootState) => state.wallet) as WalletState | null;
    useEffect(() => {
        setPublicKey(wallet?.publicKey ?? null)
    }, [wallet])

    const requestTokenAmount = useCallback(async () => {
        try {
            if (!publicKey) return;
            const tokenResponse = await fetch(`${process.env.REACT_APP_SERVER}/tokenamount`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    publicKey: publicKey
                })
            })

            if (!tokenResponse.ok) {
                throw new Error("Failed to fetch SIGX amount");

            }
            const tokenData = await tokenResponse.json();
            console.log("Success fetching token amount: ", tokenData)
        } catch (error) {
            console.error(error);
        }

    }, [publicKey])
    return(
        <div>
            <button onClick={requestTokenAmount}>Get SIGX amount</button>
            <div>amount : {tokenAmount}</div>
        </div>
    )
}

export default AuthTest;