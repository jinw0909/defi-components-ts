import React, { useState, useEffect } from "react";
import { useMetaMaskProvider } from "../../utils/useMetaMaskProvider";

const ProviderList: React.FC = () => {
    const { providers, getMetaMaskProvider } = useMetaMaskProvider();

    const handleConnectMetaMask = async () => {
        const metamaskProvider = getMetaMaskProvider();
        if (metamaskProvider) {
            try {
                await metamaskProvider.request({method: "eth_requestAccounts"});
            } catch (error) {
                console.error("Failed to connect to MetaMask:", error);
            }
        } else {
            console.error("MetaMask provider not found");
        }
    }

    return (
        <div>
            <h3>All Detected Providers</h3>
            {providers.map((detail, index) => (
                <button key={index} onClick={() => metamaskProviderOrFallback(detail.provider)}>
                    <img src={detail.info.icon} alt={detail.info.name} style={{width: 24, height: 24}}/>
                    <span>{detail.info.name}</span>
                </button>
            ))}
            <hr/>
            <button onClick={handleConnectMetaMask}>Connect with MetaMask</button>
        </div>
    );
};

const metamaskProviderOrFallback = (provider: any) => {
    // Your logic for connecting with a given provider (optional)
};

export default ProviderList;
