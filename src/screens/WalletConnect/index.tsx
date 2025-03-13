import React, { useState, useEffect } from 'react';
import { PhantomConnect, MetaMaskConnect } from '../../components';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../context/store";
import {clearWallet, WalletState} from "../../context/walletSlice";
import OkxWalletConnect from "../../components/OkxConnect";


const ComponentA = React.memo(({ connectedWallet, onClick, onLogout, showLogoutButton } : any) => {
    return (
        <div
            onClick={onClick}
            style={{
                border: '1px solid black',
                padding: '10px',
                cursor: 'pointer',
                maxWidth: '300px',
                margin: '0 auto',
            }}
        >
            {connectedWallet && connectedWallet.publicKey ? (
                <>
                    <img src={connectedWallet.icon} alt={`${connectedWallet.walletName} icon`}/>
                    <div>{`${connectedWallet.walletName} Connected`}</div>
                    <div>{`Public Key: ${connectedWallet.publicKey}`}</div>
                    {showLogoutButton && (
                        <button onClick={(e) => { e.stopPropagation(); onLogout(); }}>
                            Logout
                        </button>
                    )}
                </>
            ) : (
                <div>Connect Wallet</div>
            )}
        </div>
    );
});
const ComponentB = React.memo(({onClick} : any) => {
    return (
        <div
            style={{
                border: '1px solid gray',
                padding: '10px',
                marginTop: '10px',
                maxWidth: '300px',
                margin: '10px auto',
                position: 'relative'
            }}
        >

            <h4>Select a wallet to connect:</h4>
            {/* Pass the onWalletConnected callback to PhantomConnect */}
            <PhantomConnect/>
            <MetaMaskConnect/>
            <OkxWalletConnect/>
            <div onClick={onClick} style={{position: 'absolute', top: '4px', right: '4px', cursor: 'pointer'}}>X</div>
        </div>
    );
});

const WalletConnect = () => {
    // Get wallet state from Redux store.
    const wallet = useSelector((state: RootState) => state.wallet) as WalletState | null;
    const dispatch = useDispatch();

    const [showWalletOptions, setShowWalletOptions] = useState(false);
    const [showLogoutButton, setShowLogoutButton] = useState(false);
    // Local state to store the disconnect function received from PhantomConnect.
    const [disconnectFn, setDisconnectFn] = useState<(() => void) | null>(null);

    const handleLogout = async () => {
        if (disconnectFn) {
            disconnectFn();
        }
        dispatch(clearWallet());
        setDisconnectFn(null);
        setShowLogoutButton(false);
    };

    const handlePanelClick = () => {
        if (!wallet && !showWalletOptions) {
            setShowWalletOptions(true);
        } else if (!wallet && showWalletOptions) {
            setShowWalletOptions(false);
        } else if (wallet) {
            setShowLogoutButton(prev => !prev);
            setShowWalletOptions(false);
        }
    };

    const handleCloseClick = () => {
        setShowWalletOptions(prev => !prev);
    }

    useEffect(() => {
        if (wallet) {
            console.log('Wallet updated in Redux store:', wallet);
            setShowWalletOptions(false);
        } else {
            console.log('No wallet connected.');
        }
    }, [wallet]);


    return (
        <div>
            <ComponentA
                connectedWallet={wallet}
                onClick={handlePanelClick}
                onLogout={handleLogout}
                showLogoutButton={showLogoutButton}
            />
            <div style={{display: (showWalletOptions) ? 'block' : 'none'}}>
                <ComponentB onClick={handleCloseClick}/>
            </div>
        </div>
    );
};


export default WalletConnect;
