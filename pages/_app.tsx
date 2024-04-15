import type { AppProps } from "next/app";
import { ThirdwebProvider } from "thirdweb/react";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
