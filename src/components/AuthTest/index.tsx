import React, { useState, useEffect, useCallback } from 'react';
import {useDispatch, useSelector} from "react-redux";
import {updateWallet, clearWallet, WalletState} from "../../context/walletSlice";
import {RootState} from "../../context/store";

const AuthTest = () => {
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [tokenAmount, setTokenAmount] = useState(0);
    const [profile, setProfile] = useState<any>();
    const wallet = useSelector((state:RootState) => state.wallet) as WalletState | null;
    useEffect(() => {
        setPublicKey(wallet?.publicKey ?? null)
    }, [wallet])

    const requestTokenAmount = useCallback(async () => {
        try {
            if (!publicKey) {
                setPublicKey('abcd');
            }
            const tokenResponse = await fetch(`${process.env.REACT_APP_SERVER}/tokenamount`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                // body: JSON.stringify({
                //     publicKey: publicKey
                // })
            })

            if (!tokenResponse.ok) {
                setTokenAmount(0);
                throw new Error("Failed to fetch SIGX amount");

            }
            const tokenData = await tokenResponse.json();
            console.log("Success fetching token amount: ", tokenData)
            setTokenAmount(tokenData);
        } catch (error) {
            console.error(error);
        }

    }, [publicKey])
    const requestUserProfile = useCallback(async () => {
        const profileResponse = await fetch(`${process.env.REACT_APP_SERVER}/profile`, {
            method: "get",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!profileResponse.ok) {
            console.error(`Failed to fetch profile: ${profileResponse.statusText}`);
            setProfile('log in first to view your profile');
            return;
        }

        const profileData = await profileResponse.json();
        console.log("User profile: ", profileData);
        setProfile(profileData);
    }, [])
    return(
        <div>
            <button onClick={requestTokenAmount}>Get SIGX amount</button>
            <button onClick={requestUserProfile}>Get User Profile</button>
            <div>amount : {tokenAmount}</div>
            <div>profile</div>
            <div>{JSON.stringify(profile)}</div>
        </div>
    )
}

export default AuthTest;