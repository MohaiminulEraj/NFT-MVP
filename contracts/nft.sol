// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7 < 0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ENFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    struct NftItem {
        uint256 tokenId;
        uint256 price;
        address owner;
    }

    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => address) public tokenOwners;
    mapping(uint256 => uint256) public loanTime;
    mapping(uint256 => NftItem) private _idToNftItem;

    

    constructor() ERC721("E-Learning NFT", "ENFT") {}

    function safeMint(address to, uint256 tokenId,string memory uri) public onlyOwner {
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function mintToken(
        string memory tokenURI,
        uint256 numOfNft,
        uint256 price
    ) public payable returns (uint256) {
        require(msg.sender != address(0));

        for(uint256 i=0; i<numOfNft; i++){
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            safeMint(msg.sender, tokenId);
        }
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function lendNFT(uint256 _tokenId, address _to, uint256 _duration) public {
        require(tokenOwners[_tokenId] == msg.sender, "Only the owner can lend the NFT");
        require(_to != address(0), "The lending address cannot be the zero address");

        tokenOwners[_tokenId] = _to;
        loanTime[_tokenId] = now.add(_duration);
    }

    function returnNFT(uint256 _tokenId) public {
        require(tokenOwners[_tokenId] != msg.sender, "Only the current owner can return the NFT");

        if (loanTime[_tokenId].gt(now)) {
            // The NFT cannot be returned yet
        } else {
            tokenOwners[_tokenId] = msg.sender;
            loanTime[_tokenId] = 0;
        }
    }
}