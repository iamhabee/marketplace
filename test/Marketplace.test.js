const Marketplace = artifacts.require("Marketplace");

require('chai').use(require('chai-as-promised')).should()

contract('Marketplace', ([deployer, seller, buyer]) => {
  let marketplace

  before(async () => {
    marketplace = await Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('deploy successful', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })
    it('it has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'Dapps University Marketplace')
    })
  })

  describe('products', async () => {
    let result, productCount;
    before(async () => {
      result = await marketplace.createProduct("Iphone X", web3.utils.toWei('1', 'Ether'), { from: seller })
      productCount = await marketplace.productCount()
    })

    it('create product', async () => {
      assert.equal(productCount, 1)
      // console.log(result.logs)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), "id is correct")
      assert.equal(event.name, "Iphone X", "name is correct")
      assert.equal(event.price, "1000000000000000000", "price is correct")
      assert.equal(event.owner, seller, "owner is correct")
      assert.equal(event.purchased, false, "purchased is correct")

      // Failure test
      await await marketplace.createProduct("", web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      await await marketplace.createProduct("Iphone X", 0, { from: seller }).should.be.rejected;
    })

    it('list products', async () => {
      const products = await marketplace.products(productCount)

      assert.equal(products.id.toNumber(), productCount.toNumber(), "id is correct")
      assert.equal(products.name, "Iphone X", "name is correct")
      assert.equal(products.price, "1000000000000000000", "price is correct")
      assert.equal(products.owner, seller, "owner is correct")
      assert.equal(products.purchased, false, "purchased is correct")
    })

    it('sells products', async () => {
      let oldSellerBalance, newSellerBalance, price
      // check seller balance
      oldSellerBalance = await web3.eth.getBalance(seller)
      oldSellerBalance = new web3.utils.BN(oldSellerBalance)

      // Success : buyer purchase succesful
      result = await marketplace.productPurchased(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') })
      const event = result.logs[0].args
      //  check logs
      assert.equal(event.id.toNumber(), productCount.toNumber(), "id is correct")
      assert.equal(event.name, "Iphone X", "name is correct")
      assert.equal(event.price, "1000000000000000000", "price is correct")
      assert.equal(event.owner, buyer, "owner is correct")
      assert.equal(event.purchased, true, "purchased is correct")

      // check new seller balance
      newSellerBalance = await web3.eth.getBalance(seller)
      newSellerBalance = new web3.utils.BN(newSellerBalance)
      price = web3.utils.toWei('1', 'Ether')
      price = new web3.utils.BN(price)
      // console.log(oldSellerBalance, newSellerBalance, price)
      const expectedBalance = oldSellerBalance.add(price)
      assert.equal(newSellerBalance.toString(), expectedBalance.toString())

      // Failure test 
      // tries to buy product with non existing id i.e., product id must be valid
      await marketplace.productPurchased(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
      // tries to buy without enough ether
      await marketplace.productPurchased(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected
      // tries to buy the product twice
      await marketplace.productPurchased(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
      // tries to buy  with same buyer i.e., buyer can not buy same product twice and he cant buy his own product
      await marketplace.productPurchased(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
    })
  })

})