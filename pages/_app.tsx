import type { AppProps } from "next/app";
import { ThirdwebProvider, localWallet, embeddedWallet, smartWallet, metamaskWallet } from "@thirdweb-dev/react";
import {ArbitrumGoerli} from "@thirdweb-dev/chains";
import {ACCOUNT_FACTORY_ADDRESS} from "../lib/constants";
import "../styles/globals.css";

// configuration for front end smart wallet
const smartWalletOptions = {
  factoryAddress: ACCOUNT_FACTORY_ADDRESS,
  gasless: true,
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TW_CLIENT_ID}
      activeChain={ArbitrumGoerli}
      supportedWallets={[
        smartWallet(
          localWallet(),
          smartWalletOptions,
        ),
        smartWallet(
          embeddedWallet(),
          smartWalletOptions,
        )
      ]}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
