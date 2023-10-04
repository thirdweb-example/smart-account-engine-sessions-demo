import { ConnectWallet, useAddress, useContract, useSDK, /*useCreateSessionKey,*/ useWallet } from "@thirdweb-dev/react";
import { SmartWallet } from "@thirdweb-dev/wallets";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../components/Header";
import { NextPage } from "next";
import { ConnectWalletProps } from "@thirdweb-dev/react/dist/declarations/src/wallet/ConnectWallet/ConnectWallet";
import { ACCOUNT_ABI, OE_CONTRACT_ADDRESS } from "../lib/constants";

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
  const userWallet : SmartWallet | undefined = useWallet();
  const {contract}  = useContract(address, ACCOUNT_ABI);
  const sdk = useSDK();
 //const userWallet = useThirdwebSigner();

  const [backendWallets, setBackendWallets] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isAddingSession, setIsAddingSession] = useState<boolean>(false);
  const [isReadyToMint, setIsReadyToMint] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  // const {
  //   mutate: createSessionKey,
  //   isLoading,
  //   error,
  // } = useCreateSessionKey();

  useEffect(() => {
    if (address) {
      console.log("connected address: " + address);
      console.log("fetching backend wallets");
      // Fetch backend wallets when address is defined
      fetch('/api/backendwallets')
        .then(response => response.json())
        .then(data => setBackendWallets(data))
        .catch(error => console.error('Error fetching backend wallets:', error));
    }
  }, [address]);

  const handleWalletSelect =  (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWallet(event.target.value);

  };

  const handleAddToSession = async () => {
    if (selectedWallet) {

      setIsAddingSession(true);
   
        // make sure smart wallet has been deployed
        const isDeployed = await userWallet?.isDeployed();
        if(!isDeployed) {
          console.log("deploying user wallet");
          const deployTx = await userWallet?.deploy();
          console.log(deployTx);
        }

        // grant permissions to backend wallet for 1 hr
        const startTime = new Date();

        // Define the end time as 30 minutes from now
        const endTime = new Date(startTime.getTime() + 30 * 60000); // 60000 milliseconds in a minute
        console.log("adding to session: " + selectedWallet + " from " + startTime + " to " + endTime);
        const sessionTx = await contract?.account.grantPermissions(selectedWallet, {approvedCallTargets: [OE_CONTRACT_ADDRESS], startDate: startTime, expirationDate: endTime});
        //const sessionKey = await createSessionKey({approvedCallTargets: [OE_CONTRACT_ADDRESS], startDate: startTime, expirationDate: endTime});
        console.log(sessionTx);

        setIsReadyToMint(true);
        setIsAddingSession(false);

        // notify user
        toast.success("added to session: " + selectedWallet + " from " + startTime + " to " + endTime + " with tx: " + sessionTx?.receipt.transactionHash);
    }
  }

  const handleMintNFT = async () => {
    setIsMinting(true);

    // fetch api/mint endpoint
    const mintTx = await fetch('/api/mint');
  }

  if(!address) 
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Header />
        <div className={styles.connect}>
          <h3>Create Embedded Wallet + Smart Account for User &#8594; <i>Connect Wallet SDK</i></h3>
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
        <h3>Create Embedded Wallet + Smart Account for User &#8594; <i>Connect Wallet SDK</i></h3>
          <ConnectWallet {...connectWalletConfig}/>
        </div>
        <h3>Select a Backend Wallet to Create 30 min Session With:</h3>
        <select value={selectedWallet || ''} onChange={handleWalletSelect} style={{ background: "#070707", color: "#e7e8e8" }}>
          <option value="" disabled>Select a wallet</option>
          {backendWallets.map(wallet => (
            <option key={wallet} value={wallet}>
              {wallet}
            </option>
          ))}
        </select>
          &nbsp;&nbsp;<i>&#8594; GET /backend-wallet/get-all with Engine</i>
        <br/><br/>
          {selectedWallet && <button onClick={handleAddToSession} className={styles.addButton} disabled={isAddingSession}>{isAddingSession ? 'Adding...' : 'Add to Session'}</button>}
          {selectedWallet && <i>&nbsp;&nbsp;&#8594; account.grantPermission() using Client Smart Wallet SDK</i>}
          <br/><br/>
          {isReadyToMint && <h3>Mint an NFT to Smart Account Using Engine</h3>}
          {isReadyToMint && <button onClick={handleMintNFT} className={styles.addButton} disabled={isMinting}>{isMinting ? 'Minting...' : 'Mint NFT'}</button>}
      </div>
      <ToastContainer />
    </main>
  );
};

export default Home;
