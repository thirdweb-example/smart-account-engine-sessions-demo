import { ConnectWallet, useAddress, useCreateSessionKey, useRevokeSessionKey, useChain, useAddAdmin } from "@thirdweb-dev/react";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../components/Header";
import { NextPage } from "next";
import { ConnectWalletProps } from "@thirdweb-dev/react/dist/declarations/src/wallet/ConnectWallet/ConnectWallet";
import { OE_CONTRACT_ADDRESS } from "../lib/constants";

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
  const chain = useChain();

  const [backendWallets, setBackendWallets] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isRevokable, setIsRevokable] = useState<boolean>(false);
  const [isReadyToMint, setIsReadyToMint] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  const {
    mutateAsync: createSessionKey,
    isLoading,
    error,
  } = useCreateSessionKey();

  const {
    mutateAsync: revokeSessionKey,
    isLoading: isRevoking,
    error: revokeError,
  } = useRevokeSessionKey();

  // fetch backend wallets from Engine
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

  // function to handle adding a backend wallet to a smart account session
  const handleAddToSession = async () => {
    if (selectedWallet) {
   
      const startTime = new Date();

      // Define the end time as 15 minutes from now
      const endTime = new Date(startTime.getTime() + 15 * 60000); // 60000 milliseconds in a minute
      console.log("adding to session: " + selectedWallet + " from " + startTime + " to " + endTime);

      // create session key
      const sessionKey = await createSessionKey({
        keyAddress: selectedWallet,
        permissions: {approvedCallTargets: [OE_CONTRACT_ADDRESS], startDate: startTime, expirationDate: endTime}
      });
      console.log(sessionKey);

      setIsRevokable(true);
      setIsReadyToMint(true);

      // notify user
      toast.success("added to session: " + selectedWallet + " from " + startTime + " to " + endTime + " with tx: " + sessionKey.receipt.transactionHash);
    }
  }

  // function to handle revoking a backend wallet from a smart account session
  const handleRevokeSigners = async () => {
    if(selectedWallet) {
      const revokeTx = await revokeSessionKey(selectedWallet);
      toast.success("revoked session for: " + selectedWallet + " with tx: " + revokeTx.receipt.transactionHash);
      setIsRevokable(false);
      setIsReadyToMint(false);
    }
    else {
      toast.error("no selected wallet");
    }
  }

  // function to handle minting an NFT using Engine and the session key
  const handleMintNFT = async () => {
    setIsMinting(true);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        backendWalletAddress: selectedWallet,
        smartAccountAddress: address,
        chain: chain?.chainId}),
    };

    // fetch api/mint endpoint
    const mintTx = await fetch('/api/mint', options)
    .then((response) => {
      // if status is 200 display toast success
      if(response.status === 200) {
        toast.success("minted NFT successfully");
        setIsMinting(false);
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error("error minting NFT: " + err)
      setIsMinting(false);
    });
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Header />
        <div className={styles.connect}>
          <h3>Create Embedded Wallet + Smart Account for User &#8594; <i>Connect Wallet SDK</i></h3>
          <ConnectWallet {...connectWalletConfig}/>
        </div>
  
  {address ? (
    <>
        <h3>Select a Backend Wallet to Create 15 min Session With:</h3>
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
          {selectedWallet && <button onClick={handleAddToSession} className={styles.addButton} disabled={isLoading}>{isLoading ? 'Adding...' : 'Add to Session'}</button>}
          {selectedWallet && <i>&nbsp;&nbsp;&#8594; createSessionKey() using Client Smart Wallet SDK</i>}
          <br/><br/>
          {isRevokable && <h3>Revoke Session</h3>}
          {isRevokable && <button onClick={handleRevokeSigners} className={styles.addButton} disabled={isRevoking}>{isRevoking ? 'Revoking...' : 'Revoke Session'}</button>}
          {isRevokable && <i>&nbsp;&nbsp;&#8594; revokeSessionKey() using Client Smart Wallet SDK</i>}
          <br/><br/>
          {isReadyToMint && <h3>Mint an Open Edition NFT to Smart Account Using Engine</h3>}
          {isReadyToMint && <button onClick={handleMintNFT} className={styles.addButton} disabled={isMinting}>{isMinting ? 'Minting...' : 'Mint NFT'}</button>}
          {isReadyToMint && <i>&nbsp;&nbsp;&#8594; {'POST /contract/{chain}/{contract}/claim-to'} with Engine</i>}
          </>
  ) : (
    <></>
  )}
      </div>
      <ToastContainer />
    </main>
  );
};

export default Home;
