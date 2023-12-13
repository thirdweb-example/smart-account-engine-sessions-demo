// pages/api/backendwallets.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OE_CONTRACT_ADDRESS } from '../../lib/constants';
import { Engine } from '@thirdweb-dev/engine';

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

        // call claimTo on the contract
        const response = await engine.erc721.claimTo(
            chain as string, 
            OE_CONTRACT_ADDRESS as string,
            backendWalletAddress as string, 
            {
                receiver: smartAccountAddress,
                quantity: "1",
            },
            smartAccountAddress as string); 

        console.log("result: " + response.result);
        
        res.status(200).json({ result: response.result });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export default handler;
