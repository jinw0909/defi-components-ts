// useEvmProvider.ts
import { useState, useEffect } from "react";

export interface EIP6963ProviderInfo {
    rdns: string;
    uuid: string;
    name: string;
    icon: string;
}

export interface EIP1193Provider {
    isStatus?: boolean;
    host?: string;
    path?: string;
    sendAsync?: (
        request: { method: string; params?: Array<unknown> },
        callback: (error: Error | null, response: unknown) => void
    ) => void;
    send?: (
        request: { method: string; params?: Array<unknown> },
        callback: (error: Error | null, response: unknown) => void
    ) => void;
    request: (request: { method: string; params?: Array<unknown> }) => Promise<unknown>;
}

export interface EIP6963ProviderDetail {
    info: EIP6963ProviderInfo;
    provider: EIP1193Provider;
}

export type EIP6963AnnounceProviderEvent = CustomEvent<{
    info: EIP6963ProviderInfo;
    provider: Readonly<EIP1193Provider>;
}>;

declare global {
    interface WindowEventMap {
        "eip6963:announceProvider": EIP6963AnnounceProviderEvent;
    }
}

export const useEvmProvider = () => {
    const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);

    useEffect(() => {
        const handleProviderAnnounce = (event: EIP6963AnnounceProviderEvent) => {
            console.log("Provider announced:", event.detail);
            setProviders((prevProviders) => {
                // Avoid duplicates based on provider name
                const exists = prevProviders.some((p) => p.info.name === event.detail.info.name);
                return exists
                    ? prevProviders
                    : [...prevProviders, { info: event.detail.info, provider: event.detail.provider }];
            });
        };

        window.addEventListener("eip6963:announceProvider", handleProviderAnnounce as EventListener);
        window.dispatchEvent(new Event("eip6963:requestProvider"));

        return () => {
            window.removeEventListener("eip6963:announceProvider", handleProviderAnnounce as EventListener);
        };
    }, []);

    const getMetaMaskProvider = (): EIP6963ProviderDetail | undefined =>
        providers.find((detail) => detail.info.name.toLowerCase() === "metamask");

    const getOkxWalletProvider = () : EIP6963ProviderDetail | undefined =>
        providers.find((detail) => detail.info.rdns === "com.okex.wallet");

    return { providers, getMetaMaskProvider, getOkxWalletProvider };
};
