import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import { NextPage } from "next";
import { ConnectWalletProps } from "@thirdweb-dev/react/dist/declarations/src/wallet/ConnectWallet/ConnectWallet";

const connectWalletConfig = {
  theme: "dark",
  btnTitle: "Login",
  modalTitle: "Select Your Sign-In",
  switchToActiveChain: true,
  modalSize: "wide",
  welcomeScreen: {
    subtitle: "Enter your email to get started",
    img: {
      src: "ipfs://QmZ1512rWfso1iUh2UkK5LUjw73zCHsxc5RXnsh6NfJo63/TreasureChests.png",
      width: 150,
      height: 150,
    },
    title: "ERC 4337 Smart Accounts Made Easy",
  },
  modalTitleIconUrl: "ipfs://QmdV9ZAaMPpj113CwmjpsCYWgezsk9G3gEynYARTdGDF3F/cryptotoken.jpeg",
} as ConnectWalletProps;


const Home: NextPage = () => {
  const address = useAddress();

  if(!address) 
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Header />

          <div className={styles.connect}>
          <ConnectWallet {...connectWalletConfig}/>
        </div>
      </div>
    </main>
  );
  
  if(address) return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Header />
        <div className={styles.connect}>
          <ConnectWallet {...connectWalletConfig}/>
        </div>
      </div>
    </main>
  );
};

export default Home;
