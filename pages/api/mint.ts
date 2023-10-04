// pages/api/backendwallets.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch'; 

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   // console.log("inside createsession.ts");
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.TW_SECRET_KEY}`,
        },
    };

    try {
       // console.log("calling backend-wallet/get-all at: " + process.env.TW_ENGINE_URL + " with key: " + process.env.TW_SECRET_KEY);
        const response = await fetch(`${process.env.TW_ENGINE_URL}/backend-wallet/get-all`, options);
        if (!response.ok) {
            throw new Error('Network response was not ok' + response.statusText);
        }
        const data: any = await response.json();
       // console.log("got all backend wallets: " + data);

        // Extracting only the address fields
        const addresses = data.result.map((wallet: { address: string }) => wallet.address);
        
        res.status(200).json(addresses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export default handler;
