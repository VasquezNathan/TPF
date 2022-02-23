import React, { Component } from "react";
import GlassKey from "./contracts/GlassKey.json";
import getWeb3 from "./getWeb3";
import NFTRow from "./components/NFTRow";
import ChangeURI from "./components/ChangeURI";

import "./App.css";

class App extends Component {
  state = {web3: null, accounts: null, contract: null, table: []};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = GlassKey.networks[networkId];
      const instance = new web3.eth.Contract(
        GlassKey.abi,
        deployedNetwork && deployedNetwork.address,
      );

      //variables used to keep track of the tickers
      const currentSupply = parseInt(await instance.methods.currentSupply().call());
      const maxSupply = parseInt(await instance.methods._maxSupply().call());
      const balance = parseInt(await instance.methods.balanceOf(accounts[0]).call());
      const owner = await instance.methods.owner().call() == accounts[0];
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ 
        web3,
        accounts, 
        contract: instance, 
        currentSupply,
        maxSupply,
        balance,
        owner,
      });

      // when the page is loaded it will show the nfts associated with the connected wallet
      var _table = [];

      for(var i = 1 ; i <= this.state.currentSupply; i++) {
          if(await instance.methods.ownerOf(i).call() == accounts[0]) {
            var nft_uri = String(await instance.methods.tokenURI(i).call());
            var nft_atts = await fetch(nft_uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"));
              try {
                nft_atts = await nft_atts.json();
              }
              catch (error){
                console.log(error);
              }
            
            _table.push(nft_atts);
          }
      }
      this.setState({ table: _table });


      //when there is a purchased event then update ticker on screen
      instance.events.Transfer()
          .on('data', async (emitted) => {
            if(emitted.returnValues.to == accounts[0]) {
              var nft_uri = String(await instance.methods.tokenURI(emitted.returnValues.tokenId).call());
              var nft_atts = await fetch(nft_uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"));
              nft_atts = await nft_atts.json();
              _table.push(nft_atts);
            }
            this.setState({ 
              table: _table,
              balance: parseInt(await instance.methods.balanceOf(accounts[0]).call()),
              currentSupply: parseInt(await instance.methods.currentSupply().call()),
            });
          });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  async mintKey(e) {
    e.preventDefault();
    const {accounts, contract, web3} = this.state;
    var total;
    var amount_to_purchase = parseFloat(document.getElementById("amount").value);
    var price_per_key = parseFloat("0.10");


    if (await contract.methods.balanceOf(accounts[0]).call() == 0) {
      total = ( ((amount_to_purchase-1) * price_per_key) + (price_per_key/2) ).toPrecision(2).toString();
    }
    else {
        total = (amount_to_purchase * price_per_key).toPrecision(2).toString();
    }
    
    await contract.methods.purchase(amount_to_purchase).send({
      from: accounts[0],
      value: web3.utils.toWei(total, "ether"),
    })
  }


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    let rows = [];
    console.log(this.state.table);
    for (let i = 0; i < this.state.table.length; i++ ) {
      rows.push(<NFTRow key={i} atts={this.state.table[i]}></NFTRow>);
    }

    return (
      <div className="App">
        <p>minted: {this.state.currentSupply}/{this.state.maxSupply}</p>
        <input id = "amount" name = "amount" type="number" style={{marginRight: 10}}></input>
        <a href="#" onClick={this.mintKey.bind(this)}>Mint</a>
        <p>(max mints per wallet: 10)</p>
        <p>price: 1st Key (0.05 ETH/Key), 2nd-10th Key (0.10 ETH/Key)</p>
        <p>you have: {this.state.balance} keys</p>
        <div id = "table">{rows}</div>
        <ChangeURI owner = {this.state.owner} this = {this}></ChangeURI>
      </div>
    );
  }
}

export default App;
