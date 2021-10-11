pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint256 public productCount = 0;
    mapping(uint256 => Product) public products;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        address payable owner;
        bool purchased;
    }

    event productCreated(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    event purchasedProduct(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Shield Blockchain test";
    }

    function createProduct(string memory _name, uint256 _price) public {
        // make sure all params are correct
        // require a valid name
        require(bytes(_name).length > 0);
        // required price
        require(_price > 0);
        // increment product
        productCount++;
        // create product
        products[productCount] = Product(
            productCount,
            _name,
            _price,
            msg.sender,
            false
        );
        // triger event
        emit productCreated(productCount, _name, _price, msg.sender, false);
    }

    function productPurchased(uint256 _id) public payable {
        // fetch product
        Product memory _product = products[_id];
        // fetch the owner
        address payable _seller = _product.owner;
        // make sure the product is valid
        // make sure the product hs valid id
        require(_id > 0 && _id <= productCount);
        // make sure there is enough ether in the transaction
        require(msg.value >= _product.price);
        // make sure the product has not been purchase before
        require(!_product.purchased);
        // make sure the buyer is not the seller
        require(_seller != msg.sender);
        // transfer ownership to the buyer
        _product.owner = msg.sender;
        // mark as purchased
        _product.purchased = true;
        // update the product
        products[_id] = _product;
        // pay the seller by sending them ether
        address(_seller).transfer(msg.value);
        // trigger an event
        emit purchasedProduct(
            productCount,
            _product.name,
            _product.price,
            msg.sender,
            true
        );
    }
}
