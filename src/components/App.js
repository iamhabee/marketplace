import React, { Component } from 'react';
import Web3 from 'web3';
// import logo from '../logo.png';
import './App.css';
import Navbar from './Navbar';
import Main from './Main';
import Marketplace from '../abis/Marketplace.json'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      accounts: "",
      productCounts: 0,
      products: [],
      loading: true,
    }
    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainAccount()
    // console.log(window.web3)
  }

  async loadWeb3() {
    if (window.etherium) {
      window.web3 = new Web3(window.etherium)
      await window.etherium.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      console.log("Non etherium browser detected, please consider downloading meta mask")
    }
  }

  async loadBlockchainAccount() {
    const web3 = window.web3
    // get accounts
    const accounts = await web3.eth.getAccounts()
    this.setState({ accounts: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkId]
    if (networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address)
      const productCount = await marketplace.methods.productCount().call()
      this.setState({ productCount })
      // Load products
      for (var i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call()
        this.setState({
          products: [...this.state.products, product]
        })
      }
      this.setState({ loading: false, marketplace })
    } else {
      window.alert("Market palce is not deployed to detected network")
    }
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  async createProduct(name, price) {
    const { accounts } = this.state
    this.setState({ loading: true })
    // console.log(this.state.marketplace.methods)
    this.state.marketplace.methods.createProduct(name, price).send({ from: accounts })
      .once('reciept', (reciept) => {
        this.setState({ loading: false })
      })
  }

  render() {
    const { loading, accounts, products } = this.state
    return (
      <div>
        <Navbar accounts={accounts} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              {loading ?
                <div className="text-center" id="loader"><p className="text-center">Loading...</p></div> :
                <Main
                  products={products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
