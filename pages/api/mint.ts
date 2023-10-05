// pages/api/backendwallets.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch'; 
import { OE_CONTRACT_ADDRESS } from '../../lib/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log("inside mint.ts: " + req.body);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { backendWalletAddress, smartAccountAddress, chain } = req.body;

    console.log("backendWalletAddress: " + backendWalletAddress + " smartAccountAddress: " + smartAccountAddress + " chain: " + chain);

    const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.TW_SECRET_KEY}`,
          "x-backend-wallet-address": backendWalletAddress,
          "x-account-address": smartAccountAddress,
        },
        body: JSON.stringify({
            receiver: smartAccountAddress,
            quantity: 1,
        }),
    };

    try {
       // console.log("calling backend-wallet/get-all at: " + process.env.TW_ENGINE_URL + " with key: " + process.env.TW_SECRET_KEY);
        const response = await fetch(`${process.env.TW_ENGINE_URL}/contract/${chain}/${OE_CONTRACT_ADDRESS}/erc721/claim-to`, options);
        if (!response.ok) {
            throw new Error('Network response was not ok' + response.statusText);
        }
        const data: any = await response.json();
        console.log("result: " + data.result);
        
        res.status(200).json({ result: data.result });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export default handler;
