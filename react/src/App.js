import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

export default function App() {

  const [ currentAccount, setCurrentAccount] = useState("");
  const [ loading, setLoading ] = useState(false);
  // testnet contract address 
  const contractAddress = "0xCfEEA80a9E6181082A6E40F014557D3B6A6D5b91";
  const contractABI = abi.abi;

  // TODO: mining loading bar
  async function wave() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Get signer from metamask provider node
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // TODO: optimize gas: remove console log calls in contract and front-end
        // TODO: loading state if user cancels transaction?
        setLoading(true);
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        setLoading(false);
        console.log("Mined --", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Total wave count: ", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist.")
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  // Checks if MetaMask is found, and if user has connected a wallet account
  async function checkIfWalletIsConnected() {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you use MetaMask!");
      } else {
        console.log("MetaMask found:", ethereum);
      }

      const accounts = await ethereum.request({method: "eth_accounts"});

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found.")
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function connectWallet() {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      } 

      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }


  // Checks for connected wallet after render/DOM update
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hello!
        </div>
        
        <div className="bio">
          I'm Sarah, a computer science undergrad at UBC and community growth manager at KLAP Finance. I'm passionate about the future of Web3!
          <br/> <br/>
          Here you can interact with Wave Portal, a simple smart contract built with Solidity on the Ethereum blockchain.
        </div>

        {!currentAccount ? <p>Connect your MetaMask wallet first!</p> : null}
        {/* TODO: greyed out until wallet connected, add alternate emoji buttons*/}
        <button disabled={loading || !currentAccount} className="wave-button" onClick={wave}>
          {loading ? <img src={process.env.PUBLIC_URL + "/spinner.gif"}/> : "Wave at Me"}
        </button>

        {/* Render connect wallet button if there is no current account */}
        {/* TODO: make this into a connect/disconnect wallet button*/}

          <button className="connect-wallet-button" onClick={connectWallet}>
            {currentAccount ? "Connected: "+currentAccount : "Connect Wallet"}
          </button>


        {/* TODO: Animated list of all previous messages */}
        <div className="previousWaves">
          Previous waves:
        </div>

        <div className="footer"> 
          Sarah Cader © 2022
        </div>
      </div>

    </div>
  );
}

