import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

export default function App() {

  const [ currentAccount, setCurrentAccount] = useState("");
  const [ totalWaves, setTotalWaves ] = useState(0);
  const [ loading, setLoading ] = useState(false);
  const [ allWaves, setAllWaves ] = useState([]);
  // testnet contract address 
  const contractAddress = "0x95f4a8953E983AB45068CAe472E5C6b87864023C";
  const contractABI = abi.abi;

  /* FUNCTIONS */
  async function wave() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Get signer from metamask provider node
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // TODO: optimize gas: remove console log calls in contract and front-end
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

  // Get all the Wave structs
  async function getAllWaves() {

  }

  // Get the total count of waves -- doesn't require MetaMask
  async function getTotalWaves() {
    try {
      const url = process.env.REACT_APP_NODE_URL;
      const provider = new ethers.providers.JsonRpcProvider(url);
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);
      let count = await wavePortalContract.getTotalWaves();
      
      console.log(count.toNumber());
      setTotalWaves(count.toNumber());
      
    } catch (error) {
      console.log(error);
    }
  }

  // Listens for changes in the connected MetaMask accounts.
  async function checkAccountChange() {
    const { ethereum } = window;
    if (ethereum) {
      // Listening to Event
      ethereum.on('accountsChanged', accounts => {
        if (accounts.length !== 0) {
          const account = accounts[0];
          setCurrentAccount(account);
        } else {
          setCurrentAccount("");
          window.location.reload(false);
        }})
   }
 }

  // Connects user's wallet when button clicked
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
    checkAccountChange();
    getTotalWaves();
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
        <button disabled={loading || !currentAccount} className="wave-button" onClick={wave}>
          {loading ? <img src={process.env.PUBLIC_URL + "/spinner.gif"}/> : "Wave at Me"}
        </button>

        {/* Render connect wallet button if there is no current account */}
          <button className={"connect-wallet-button " + (currentAccount ? "no-hover" : "")} onClick={!currentAccount ? connectWallet : null}>
            {currentAccount ? "Connected: "+currentAccount : "Connect Wallet"}
          </button>


        {/* TODO: Animated list of all previous messages */}
        <div className="previousWaves">
        <p>I've been waved at {totalWaves} times. 😊</p>

          Previous waves:
        </div>

        <div className="footer"> 
          Sarah Cader © 2022
        </div>
      </div>

    </div>
  );
}

