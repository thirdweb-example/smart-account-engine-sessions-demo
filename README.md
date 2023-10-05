## Getting Started

This is a demo app that demonstrates creating and using scoped sessions using Smart Accounts + thirdweb Engine

## To install

```bash
yarn install
```

## Environment Variables

To run this project, you will need to add environment variables

* NEXT_PUBLIC_TW_CLIENT_ID: Your thirdweb client ID
* TW_SECRET_KEY: thirdweb secret key used by the Next JS backend to Engine
* TW_ENGINE_URL: the URL to your instance of thirdweb Engine

## Before Running 

1. Deploy a thirdweb [smart account factory](https://thirdweb.com/explore/smart-wallet) to the chain of your choice
2. Deploy a thirdweb [Open Edition contract](https://thirdweb.com/thirdweb.eth/OpenEditionERC721) to the chain of your choice
3. Modify the `activeChain={ArbitrumGoerli}` in `pages/_app.tsx` to the chain you are using
4. Modify the `lib/constants.ts` file with your Smart Account Factory Address and Open Edition Contract Addresses

## Learn More

To learn more about thirdweb, take a look at the following resources:

- [thirdweb React Documentation](https://docs.thirdweb.com/react) - learn about our React SDK.
- [thirdweb TypeScript Documentation](https://docs.thirdweb.com/typescript) - learn about our JavaScript/TypeScript SDK.
- [thirdweb Portal](https://docs.thirdweb.com) - check our guides and development resources.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Templates](https://thirdweb.com/templates)

You can check out [the thirdweb GitHub organization](https://github.com/thirdweb-dev) - your feedback and contributions are welcome!

## Join our Discord!

For any questions, suggestions, join our discord at [https://discord.gg/thirdweb](https://discord.gg/thirdweb).
