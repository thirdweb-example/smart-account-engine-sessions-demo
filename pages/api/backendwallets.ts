// pages/api/backendwallets.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Engine } from '@thirdweb-dev/engine';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   // console.log("inside backendwallets.ts");
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
       // console.log("calling backend-wallet/get-all at: " + process.env.TW_ENGINE_URL + " with key: " + process.env.TW_SECRET_KEY);
       const engine = new Engine({
        url: process.env.TW_ENGINE_URL as string,
        accessToken: process.env.TW_ACCESS_KEY as string,
        });

       const response = await engine.backendWallet.getAll();
       
       //console.log("got all backend wallets: " + response.result);

        // Extracting only the address fields
        const addresses = response.result.map((wallet: { address: string }) => wallet.address);
        
        res.status(200).json(addresses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export default handler;
