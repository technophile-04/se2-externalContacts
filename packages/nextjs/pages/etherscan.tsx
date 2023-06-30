import { ChangeEventHandler, useState } from "react";
import Head from "next/head";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import type { NextPage } from "next";
import * as chains from "wagmi/chains";
import { notification } from "~~/utils/scaffold-eth";

const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

const chainNames = Object.keys(chains);
const targetChainArr = chainNames.filter(chainName => {
  const wagmiChain = chains[chainName as keyof typeof chains];
  // @ts-expect-error
  if (wagmiChain?.blockExplorers?.etherscan) return true;
});

const getAbiFromEtherscan = async (address: string) => {
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscanApiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "0") {
    notification.error(data.result);
    return [];
  }
  return JSON.parse(data.result);
};

interface DeployedContractStructure {
  [key: number]: [
    {
      name: string;
      chainId: string;
      contracts: {
        [key: string]: {
          address: string;
          abi: any[];
        };
      };
    },
  ];
}

const FormInput = ({
  onChange,
  placeholder,
  inputName,
  value,
  name,
}: {
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  name: string;
  value: string;
  inputName: string;
}) => {
  return (
    <div className="flex flex-col my-4">
      <p className="my-0 mb-1 ml-1">{inputName}</p>
      <div className="flex rounded-full border-2 border-base-300 bg-base-200 text-accent">
        <input
          className="px-4 w-full font-medium text-gray-400 border focus:text-gray-400 focus:bg-transparent focus:outline-none input input-ghost h-[2.2rem] min-h-[2.2rem] placeholder:text-accent/50"
          placeholder={placeholder}
          name={name}
          autoComplete="off"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

const Etherscan: NextPage = () => {
  const [formState, setFormState] = useState({
    contractName: "",
    contractAddress: "",
    chainId: "",
    deployedContractsValue: "{}",
    mergedContractsObject: "",
  });
  const [mergedContractsObject, setMergedContractsObject] = useState({});
  // const [contractAbi, setContractAbi] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  return (
    <>
      <Head>
        <title>Scaffold-ETH 2 App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth-2" />
      </Head>

      <div className="flex flex-col flex-grow space-y-8 items-center justify-center pt-10 w-full">
        <div className="flex flex-col p-4 rounded-2xl bg-primary w-[50%]">
          <p className="self-center my-0 text-xl font-semibold text-center">Enter Contract details</p>
          <FormInput
            inputName="Contract Name"
            name="contractName"
            value={formState.contractName}
            placeholder="contractName"
            onChange={handleChange}
          />
          <FormInput
            inputName="Contract Address"
            name="contractAddress"
            value={formState.contractAddress}
            placeholder="contractAddress"
            onChange={handleChange}
          />
          <select
            className="select w-full max-w-xs"
            onChange={e =>
              setFormState(prevState => ({
                ...prevState,
                chainId: chains[e.target.value as keyof typeof chains].id.toString(),
              }))
            }
          >
            <option disabled selected>
              Pick the chain
            </option>
            {targetChainArr.map(chainName => {
              return (
                <option key={chainName} value={chainName}>
                  {chains[chainName as keyof typeof chains].name}
                </option>
              );
            })}
          </select>
          <p className="my-0">Generated with SE-2:</p>
          <div className="mb-5">
            <CodeMirror
              value={formState.deployedContractsValue}
              height="200px"
              extensions={[javascript({ jsx: true })]}
              onChange={value => {
                setFormState(prevState => ({ ...prevState, deployedContractsValue: value }));
              }}
            />
          </div>
          <button
            className="btn-secondary btn btn-md mt-5"
            onClick={async () => {
              const trimmedSpaceValue = formState.deployedContractsValue.trim();
              const isStringSafe =
                trimmedSpaceValue !== "" && trimmedSpaceValue.startsWith("{") && trimmedSpaceValue.endsWith("}");
              if (isStringSafe) {
                const deployedContractsObject = eval(
                  `(${formState.deployedContractsValue})`,
                ) as DeployedContractStructure;

                // We will fetch abi from etherscan and assign it to the newContractAbiObject
                const newContractAbiObject = { address: "", abi: [] };
                try {
                  newContractAbiObject.address = formState.contractAddress;
                  newContractAbiObject.abi = await getAbiFromEtherscan(formState.contractAddress);
                  console.log("newContractAbiObject:", newContractAbiObject);
                } catch (error) {
                  notification.error("Cannot fetch Abi from etherscan, please enter a valid contract address");
                }
                const chainNames = Object.keys(chains);

                const targetChainName = chainNames.find(chainName => {
                  return chains[chainName as keyof typeof chains].id === parseInt(formState.chainId);
                });

                if (targetChainName === undefined) {
                  notification.error("Please enter a valid chainId");
                  return;
                }

                const targetChain = chains[targetChainName as keyof typeof chains];

                const newDeployedContractsObject = {
                  ...deployedContractsObject,
                  [parseInt(formState.chainId)]: [
                    {
                      name: targetChain.name,
                      chainId: formState.chainId,
                      contracts: {
                        ...deployedContractsObject[parseInt(formState.chainId)]?.[0].contracts,
                        [formState.contractName]: newContractAbiObject,
                      },
                    },
                  ],
                };

                console.log("Converted Object:", newDeployedContractsObject);
                setMergedContractsObject(newDeployedContractsObject);
              } else {
                notification.error("Please enter a valid object");
              }
            }}
          >
            Submit
          </button>
        </div>
        <div className="flex flex-col p-4 rounded-2xl bg-primary w-[50%]">
          <p className="self-center my-0 text-xl font-semibold text-center">Merged Object</p>
          <CodeMirror
            value={JSON.stringify(mergedContractsObject, null, 2)}
            height="200px"
            extensions={[javascript({ jsx: true })]}
            onChange={(value, viewUpdate) => {
              console.log("value:", value);
              console.log("viewUpdate:", viewUpdate);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Etherscan;
