// pages/api/backendwallets.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { LAYER_ZERO_NFT_CONTRACT_ADDRESS } from '../../lib/constants';
import { getContract, readContract, resolveMethod, createThirdwebClient } from 'thirdweb';
import { arbitrumSepolia } from 'thirdweb/chains';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { Engine } from '@thirdweb-dev/engine';
import { ethers } from 'ethers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    //console.log("inside mint.ts: " + req.body);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { backendWalletAddress, smartAccountAddress, chain } = req.body;

    console.log("inside mint.ts => backendWalletAddress: " + backendWalletAddress + " smartAccountAddress: " + smartAccountAddress + " chain: " + chain);

    try {

        // create Engine connection
        const engine = new Engine({
            url: process.env.TW_ENGINE_URL as string,
            accessToken: process.env.TW_ENGINE_ACCESS_KEY as string,
        });

        // connect to the SDK with the wallet using the relayer URL for the Mumbai testnet
        const client = createThirdwebClient({
            secretKey: process.env.TW_SECRET_KEY as string,
         });
  
        const adminAccount = privateKeyToAccount({
            client,
            privateKey: process.env.ADMIN_PRIVATE_KEY as string,
        });

        const nftContract =  getContract({
            client,
            chain: arbitrumSepolia,
            address: LAYER_ZERO_NFT_CONTRACT_ADDRESS as string,
          });
          
          console.log("got contract: " + nftContract.address);
          
          const adapterParams = ethers.solidityPacked(["uint16", "uint256"], [1, 500000]);
          console.log("generated adapter params: " + adapterParams);
          
          const estimateGas = await readContract({
            contract: nftContract,
            method: resolveMethod("estimateSendFee"),
            params: [10251, smartAccountAddress, 1, false, adapterParams],
          });
          
          console.log("estimated gas for sending: " + estimateGas[0]);

          const response = await engine.contract.write(
            chain as string,
            nftContract.address,
            backendWalletAddress,
            {
                functionName: "sendFrom",
                args: [smartAccountAddress,"10251",smartAccountAddress,"59", smartAccountAddress, smartAccountAddress, adapterParams.toString()],
                txOverrides: {
                    value: String(estimateGas[0]),
                }
            },
            false,
            smartAccountAddress as string,
          );
        
        res.status(200).json({ result: response.result });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export default handler;
