import { ConnectButton, ThirdwebProvider, useActiveAccount, useActiveWallet, useActiveWalletChain } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { addSessionKey, removeSessionKey, addAdmin } from 'thirdweb/extensions/erc4337';
import { arbitrumSepolia } from "thirdweb/chains";
import { createThirdwebClient, sendTransaction, getContract } from "thirdweb";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../components/Header";
import { NextPage } from "next";
import { OE_CONTRACT_ADDRESS, ACCOUNT_FACTORY_ADDRESS } from "../lib/constants";

const smartWalletOptions = {
  chain: arbitrumSepolia,
  factoryAddress: ACCOUNT_FACTORY_ADDRESS,
  gasless: true,
};

const buttonOptions = {
  label: "Login",
};

const connectModalOptions = {
  size: "wide",
}

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "email",
        "google",
        "apple",
        "facebook",
        "phone",
      ],
    },
  }),
];

const Home: NextPage = () => {
  const clientId = process.env.NEXT_PUBLIC_TW_CLIENT_ID as string;
  const client = createThirdwebClient({clientId});

  const account = useActiveAccount();
  const smartWallet = useActiveWallet();
  const chain = useActiveWalletChain();

  const [backendWallets, setBackendWallets] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isRevokable, setIsRevokable] = useState<boolean>(false);
  const [isReadyToMint, setIsReadyToMint] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  // fetch backend wallets from Engine
  useEffect(() => {
    if (account) {
      console.log("connected address: " + account.address);
      console.log("fetching backend wallets");
      // Fetch backend wallets when address is defined
      fetch('/api/backendwallets')
        .then(response => response.json())
        .then(data => setBackendWallets(data))
        .catch(error => console.error('Error fetching backend wallets:', error));
    }
  }, [account]);

  const handleWalletSelect =  (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWallet(event.target.value);
  };

  // function to handle adding an admin to a smart account
  const handleAddAdmin = async (adminAddress: string) => {
    if (account) {
      setIsLoading(true);
      
      // get smart account contract
      const contract = getContract({
        client: client,
        chain: arbitrumSepolia,
        address: account.address,
      });

      // create session key
      const transaction = addAdmin({
        account: account,
        contract: contract,
        adminAddress: adminAddress,
      });

      const addTx = await sendTransaction({ transaction, account });
      console.log("wallet added as admin:" + addTx);

      setIsRevokable(true);
      setIsReadyToMint(true);

      // notify user
      toast.success("added as Admin to smart account: " + adminAddress);
      setIsLoading(false);
    }
  }
  // function to handle adding a backend wallet to a smart account session
  const handleAddToSession = async () => {
    if (selectedWallet && account) {
      setIsLoading(true);
      const startTime = new Date();

      // Define the end time as 15 minutes from now
      const endTime = new Date(startTime.getTime() + 15 * 60000); // 60000 milliseconds in a minute
      console.log("adding to session: " + selectedWallet + " from " + startTime + " to " + endTime);
      
      // get smart account contract
      const contract = getContract({
        client: client,
        chain: arbitrumSepolia,
        address: account.address,
      });

      // create session key
      const transaction = addSessionKey({
        account: account,
        contract: contract,
        sessionKeyAddress: selectedWallet,
        permissions: {approvedTargets: [OE_CONTRACT_ADDRESS], permissionStartTimestamp: startTime, permissionEndTimestamp: endTime}
      });

      const sessionKey = await sendTransaction({ transaction, account });
      console.log(sessionKey);

      setIsRevokable(true);
      setIsReadyToMint(true);

      // notify user
      toast.success("added session key: " + selectedWallet + " from " + startTime + " to " + endTime);
      setIsLoading(false);
    }
  }

  // function to handle revoking a backend wallet from a smart account session
  const handleRevokeSigners = async () => {
    if(selectedWallet && account) {
      setIsRevoking(true);

      // get smart account contract
      const contract = getContract({
        client: client,
        chain: arbitrumSepolia,
        address: account.address,
      });

      // remove session key
      const transaction = removeSessionKey({
        account: account,
        contract: contract,
        sessionKeyAddress: selectedWallet,
      });

      const revokeTx = await sendTransaction({ transaction, account });
      toast.success("removed session key for: " + selectedWallet);
      setIsRevokable(false);
      setIsReadyToMint(false);
    }
    else {
      toast.error("no selected wallet");
    }
    setIsRevoking(false);
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
        smartAccountAddress: account?.address,
        chain: chain?.id}),
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
          <h3>Create Embedded Wallet + Smart Account for User</h3>
          <ConnectButton 
            client={client} 
            chain={arbitrumSepolia} 
            autoConnect={true}
            wallets={wallets} 
            accountAbstraction={smartWalletOptions} 
            connectButton={buttonOptions} 
          />
        </div>
  
  {account ? (
    <>
    <h3>Add EOA Wallet to Smart Account as Admin</h3>
    <button  onClick={() => {
      const mmask = createWallet('io.metamask');
      mmask.connect({client}).then((account) => {
        console.log("connected to metamask");
        console.log("address: " + account.address);
        handleAddAdmin(account.address);
      });
    }} className={styles.addButton} disabled={isLoading}>{isLoading ? 'Adding Role...' : 'Add Metamask as Admin'}</button>
    <hr className="divider" />
        <h3>Select a Backend Wallet to Create 15 min Session With</h3>
        <select value={selectedWallet || ''} onChange={handleWalletSelect} style={{ background: "#070707", color: "#e7e8e8" }}>
          <option value="" disabled>Select a wallet</option>
          {backendWallets.map(wallet => (
            <option key={wallet} value={wallet}>
              {wallet}
            </option>
          ))}
        </select>
        <br/><br/>
        {selectedWallet && <h3>Add Backend Wallet to Smart Account Session using <code className="code">{"addSessionKey()"}</code></h3>}
          {selectedWallet && <button onClick={handleAddToSession} className={styles.addButton} disabled={isLoading}>{isLoading ? 'Adding Role...' : 'Add to Session'}</button>}
          <br/><br/>
          {selectedWallet && <h3>Remove Backend Wallet from Smart Account Session using <code className="code">{"removeSessionKey()"}</code></h3>}
          {selectedWallet && <button onClick={handleRevokeSigners} className={styles.addButton} disabled={isRevoking}>{isRevoking ? 'Revoking...' : 'Revoke Session'}</button>}
          <br/><br/>
          <hr className="divider" />
          {isReadyToMint && <h3>Gasless Mint of Open Edition NFT with Engine Using Smart Account</h3>}
          {isReadyToMint && <button onClick={handleMintNFT} className={styles.addButton} disabled={isMinting}>{isMinting ? 'Minting...' : 'Mint NFT'}</button>}
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
