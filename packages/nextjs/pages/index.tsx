import { ChangeEventHandler, useState } from "react";
import Head from "next/head";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight } from "@uiw/codemirror-theme-github";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import CodeMirror from "@uiw/react-codemirror";
import type { NextPage } from "next";
import { useDarkMode } from "usehooks-ts";
import * as chains from "wagmi/chains";
import { notification } from "~~/utils/scaffold-eth";

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

const Home: NextPage = () => {
  const { isDarkMode } = useDarkMode();
  const [formState, setFormState] = useState({
    contractName: "",
    contractAddress: "",
    chainId: "",
    deployedContractsValue: "{}",
    newContractAbi: "",
  });

  const [mergedContractsObject, setMergedContractsObject] = useState({});

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
          <FormInput
            inputName="Chain Id"
            name="chainId"
            value={formState.chainId}
            placeholder="chainId"
            onChange={handleChange}
          />
          <p className="my-0">Generated with SE-2:</p>
          <div className="mb-5">
            <CodeMirror
              value={formState.deployedContractsValue}
              theme={isDarkMode ? tokyoNight : githubLight}
              height="200px"
              extensions={[javascript({ jsx: true })]}
              onChange={value => {
                setFormState(prevState => ({ ...prevState, deployedContractsValue: value }));
              }}
            />
          </div>
          <p className="my-0">New Contract Abi</p>
          <CodeMirror
            theme={isDarkMode ? tokyoNight : githubLight}
            value={formState.newContractAbi}
            height="200px"
            extensions={[javascript({ jsx: true })]}
            onChange={value => {
              setFormState(prevState => ({ ...prevState, newContractAbi: value }));
            }}
          />
          <button
            className="btn-secondary btn btn-md mt-5"
            onClick={() => {
              const trimmedSpaceValue = formState.deployedContractsValue.trim();
              const isStringSafe =
                trimmedSpaceValue !== "" && trimmedSpaceValue.startsWith("{") && trimmedSpaceValue.endsWith("}");
              if (isStringSafe) {
                const deployedContractsObject = eval(
                  `(${formState.deployedContractsValue})`,
                ) as DeployedContractStructure;
                const newContractAbiObject = { address: "", abi: [] };
                try {
                  newContractAbiObject.address = formState.contractAddress;
                  newContractAbiObject.abi = eval(formState.newContractAbi);
                  console.log("newContractAbiObject:", newContractAbiObject);
                } catch (error) {
                  notification.error("Cannot parse Abi, please enter a valid Abi");
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
                      name: targetChain.network,
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
            theme={isDarkMode ? tokyoNight : githubLight}
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

export default Home;
