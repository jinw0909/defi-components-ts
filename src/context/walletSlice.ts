import { createSlice } from '@reduxjs/toolkit';

export interface WalletState {
    publicKey: string,
    walletName: string,
    icon: string,
    rdns: string
}

const initialState: WalletState | null = null;

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        updateWallet(state, action) {
            return action.payload;
        },
        clearWallet() {
            return null;
        }
    }
});

export const { updateWallet, clearWallet } = walletSlice.actions;
export default walletSlice.reducer;