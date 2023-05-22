## Examplle structure :

```js
const contracts = {
  31337: [
    {
      name: "localhost",
      chainId: "31337",
      contracts: {
        YourContract: {
          address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          abi: [...],
        },
      },
    },
  ],
} as const;

export default contracts;
```

## Flow :

1. User copy paste his `deployedContracts.ts` file in the input box
2. User will enter new external contracts details
3. It will merge and generate a new `deployedContracts.ts` easily copy pastable

## Required data from User:

1. chainId
2. contractName
3. contractAddress
4. contractAbi

## TODO:

- [ ] Get minimal thing work with user passing abi
- [ ] Add an option to fetch from etherscan
