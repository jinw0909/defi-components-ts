import React from 'react';
import './App.css';
import ProviderList from "./screens/ProviderList";
import PhantomConnect from "./components/PhantomConnect";
import {Provider} from "react-redux";
import { store } from "./context/store";
import {WalletConnect} from "./screens";

function App() {
  return (
    <div className="App">
        <Provider store={store}>
            <WalletConnect/>
            {/*<ProviderList/>*/}
        </Provider>
    </div>
  );
}

export default App;
