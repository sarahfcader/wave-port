import logo from './logo.svg';
import './App.css';

export default function App() {

  const wave = () => {

  }


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hello!
        </div>
        
        <div className="bio">
          I'm Sarah, a computer science undergrad at UBC and growth manager at KLAP Finance. I'm passionate about DeFi and the future of Web3!
          <br/> <br/>
          Here you can interact with Wave Portal, a simple smart contract built on the Ethereum blockchain with Solidity.
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        <button className="connectWalletButton">
          Connect Wallet
        </button>

        <div className="footer"> 
          Sarah Cader © 2022
        </div>
      </div>

    </div>
  );
}

