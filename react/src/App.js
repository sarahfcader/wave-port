import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

export default function App() {

  const [ currentAccount, setCurrentAccount] = useState("");
  const [ totalWaves, setTotalWaves ] = useState(0);
  const [ loading, setLoading ] = useState(false);
  const [ allWaves, setAllWaves ] = useState([]);
  const [ fetchingData, setFetchingData ] = useState(false);
  const [ requestingMetaMask, setRequestingMetaMask ] = useState(false);
  const [ messageInput, setMessageInput ] = useState("");
  // testnet contract address 
  const contractAddress = "0xa8Ffb1Fc712BE1c93ccBA39b4b439b35110421Be";
  const contractABI = abi.abi;

  /* FUNCTIONS */
  // TODO: add some handling for <30 seconds waves
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
        const waveTxn = await wavePortalContract.wave(messageInput, { gasLimit: 300000 });
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
  async function getAllWaves() {
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
  async function checkIfWalletConnected(ethereum) {
    try {
      if (!ethereum) {
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        setCurrentAccount(accounts[0])
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleAccountsChanged(accounts) {

    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
      setCurrentAccount("");
    } else if (accounts[0] !== currentAccount) {
      console.log("accounts changed:", accounts[0]);
      setCurrentAccount(accounts[0]);
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
      setRequestingMetaMask(true);

      ethereum.request({ method: "eth_requestAccounts"})
              .then((accounts) => {
                setRequestingMetaMask(false);
                console.log("Connected", accounts[0]);
                setCurrentAccount(accounts[0]);
              })
              .catch((error) => {
                setRequestingMetaMask(false);
              });

    } catch (error) {
      console.log(error);
    }
  }

  function handleMessageUpdate(event) {
    setMessageInput(event.target.value);
  }

  
  useEffect(() => {
    const { ethereum } = window;
    checkIfWalletConnected(ethereum);
    getAllWaves();

    let wavePortalContract;
    function onNewWave(from, timestamp, message) {
      console.log("NewWave event", from, timestamp, message);
      setAllWaves(prevState => [
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
        ...prevState,
      ]);
    };

    // Contract listener for new wave events
    const url = process.env.REACT_APP_NODE_URL;
    const provider = new ethers.providers.JsonRpcProvider(url);
    wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);
    wavePortalContract.on("NewWave", onNewWave);

    // Sets up a listener for MetaMask account changes
    ethereum.on('accountsChanged', handleAccountsChanged);

    // Cleanup when unmounts (removed from DOM) + before the effect runs
    return () => {
      if (wavePortalContract) {
        console.log("Unmounting");
        wavePortalContract.off("NewWave", onNewWave);
      }
    }
  }, []);


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hello!
          <div style={{ marginTop:"10px", marginLeft:"44%", marginRight:"44%", backgroundColor: "#0061c8", height: "5px" }}></div>
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

          <button disabled={requestingMetaMask} className={"connect-wallet-button " + (currentAccount ? "no-hover" : "")} onClick={!currentAccount&&!requestingMetaMask ? connectWallet : null}>
            {currentAccount ? "Connected: "+currentAccount : 
              (requestingMetaMask ? <img src={process.env.PUBLIC_URL + "/spinner.gif"} alt="" id="spinLoad"/> : "Connect Wallet")
            }
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
              <div >From: {wave.address}</div>
              <div style={{ color: "#3996E2", fontSize: "10px"}}>Time: {wave.timestamp.toString()}</div>
              <br />
              <div>{wave.message}</div>
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

