import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { useState, useEffect } from "react";
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
  const [backendWallets, setBackendWallets] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      console.log("fetching backend wallets");
      // Fetch backend wallets when address is defined
      fetch('/api/backendwallets')
        .then(response => response.json())
        .then(data => setBackendWallets(data))
        .catch(error => console.error('Error fetching backend wallets:', error));
    }
  }, [address]);

  const handleWalletSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWallet(event.target.value);
  };

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
        <h2>Select a Backend Wallet to Add As Signer:</h2>
        <select value={selectedWallet || ''} onChange={handleWalletSelect} style={{ background: "#070707", color: "#e7e8e8" }}>
          <option value="" disabled>Select a wallet</option>
          {backendWallets.map(wallet => (
            <option key={wallet} value={wallet}>
              {wallet}
            </option>
          ))}
        </select>
        <button /*onClick={}*/ className={styles.addButton}>Add</button>
      </div>
    </main>
  );
};

export default Home;
