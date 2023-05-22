import { ChangeEventHandler, useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";

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
  const [formState, setFormState] = useState({
    contractName: "",
    contractAddress: "",
    chainId: "",
  });

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

      <div className="flex flex-col flex-grow items-center pt-10">
        <div className="flex flex-col p-4 rounded-2xl bg-primary">
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
          <button className="btn-secondary btn btn-md" onClick={() => console.log(formState)}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
