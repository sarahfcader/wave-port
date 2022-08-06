import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

export default function App() {

  const [ currentAccount, setCurrentAccount] = useState("");
  const [ totalWaves, setTotalWaves ] = useState(0);
  const [ loading, setLoading ] = useState(false);
  const [ allWaves, setAllWaves ] = useState([]);
  const [ fetchingData, setFetchingData ] = useState([false]);
  const [ messageInput, setMessageInput ] = useState("");
  // testnet contract address 
  const contractAddress = "0xCC32E3E5a70C2064f4f9CF971C255435A2314E52";
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
        const waveTxn = await wavePortalContract.wave(messageInput);
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        setLoading(false);
        console.log("Mined --", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        setTotalWaves(count.toNumber());
        console.log("Total wave count: ", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist.")
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  // Get all the Wave structs and total waves
  async function fetchDataViewsFromContract() {
    try {
      setFetchingData(true);
      const url = process.env.REACT_APP_NODE_URL;
      const provider = new ethers.providers.JsonRpcProvider(url);
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);
      const waveCount = await wavePortalContract.getTotalWaves();
      setTotalWaves(waveCount.toNumber());
      const allWaves = await wavePortalContract.getAllWaves();

      let wavesTrim = [];
      allWaves.forEach(wave => {
        wavesTrim.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        });
      });
      wavesTrim = wavesTrim.reverse();
      setFetchingData(false);
      setAllWaves(wavesTrim);
    } catch (error) {
      console.log(error);
    }
  }

  
  // Checks if wallet is initally connected
  // And makes a listener for changes in the connected MetaMask accounts.
  async function checkAccountChange() {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get MetaMask!");
      return;
    }
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setCurrentAccount(accounts[0]);
    // Create event listener
    ethereum.on('accountsChanged', accounts => {
      console.log(accounts[0])
      setCurrentAccount(accounts[0]);
    });
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

  function handleMessageUpdate(event) {
    setMessageInput(event.target.value);
  }

  // Checks for connected wallet after render/DOM update
  useEffect(() => {
    fetchDataViewsFromContract();
    checkAccountChange();
  }, [totalWaves]);


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hello!
        </div>
        
        <div className="bio">
          I'm Sarah, a computer science undergrad at UBC and community growth manager at KLAP Finance. I'm passionate about the future of Web3.
          <br/> <br/>
          Here you can interact with Wave Portal, a simple smart contract built with Solidity on Ethereum. If you write me a quick message it will be preserved on the blockchain forever! 😊
        </div>

        {/* {value} == the value of the text box maps onto a state variable. onchange == the state variable is updated to reflect. event.target is the triggering element, event.target.value grabs user-inputted value */}
        <textarea id="messageForm" onChange={handleMessageUpdate} autoFocus="autofocus" rows={5} cols="6" maxLength="200" placeholder="Type your message here..."></textarea>

        {!currentAccount&&!fetchingData ? <span>Connect your MetaMask wallet first!</span> : null}

        <button disabled={loading || !currentAccount} className="wave-button" onClick={wave}>
          {loading ? <img src={process.env.PUBLIC_URL + "/spinner.gif"} alt="" id="spinLoad"/> : "Wave at Me 👋"}
        </button>

          <button className={"connect-wallet-button " + (currentAccount ? "no-hover" : "")} onClick={!currentAccount ? connectWallet : null}>
            {currentAccount ? "Connected: "+currentAccount : "Connect Wallet"}
          </button>

        {fetchingData ? <span></span> : <span>I've been waved at {totalWaves} times 🎉</span>}
        <div className="previousWaves">
          Previous Waves
          <br />
          {/* TODO: pagination/animation on load */}
          {fetchingData ? <img src={process.env.PUBLIC_URL + "/pulse.gif"} alt="" id="pulseLoad" /> : null}
          {allWaves.map((wave, index) => {
          return (
            <div key={index} className="waveListItem">
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
        </div>


        <div className="footer"> 
          Sarah Cader © 2022
        </div>
      </div>

    </div>
  );
}

