import { createSlice } from '@reduxjs/toolkit';

const initialState = null;

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