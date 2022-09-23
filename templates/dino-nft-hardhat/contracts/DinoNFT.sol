// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { MetadataBuilder } from "../metadata_builder/contracts/MetadataBuilder.sol";

contract DinoNFT is ERC721Enumerable{

    uint8 constant MAX_NFTS = 8;

    string[MAX_NFTS] public DINO_IMAGES = [
        "https://i.ibb.co/WKBvKjv/dino1.png",
        "https://i.ibb.co/J36BC8s/dinopink.png",
        "https://i.ibb.co/4M01k3p/dinoblue.png",
        "https://i.ibb.co/V2tk7SZ/dinogold.png",
        "https://i.ibb.co/gwJVFkL/ape.png",
        "https://i.ibb.co/Wkwm9zM/punk.png",
        "https://i.ibb.co/zQNLS9V/ghost.png",
        "https://i.ibb.co/GM94gLD/pacman.png"
    ];

    constructor() ERC721("Atlas Dino", "DINO") {}

    function mint() external payable {
        _mint(msg.sender, totalSupply());
    }

    function tokenURI(uint tokenId) override public view returns (string memory) {
        return MetadataBuilder.finalizeSimpleMetadata(
            MetadataBuilder.initMetadata(
                name(),
                "Atlas Chain P2E NFT Dinosaur Game!",
                DINO_IMAGES[tokenId % MAX_NFTS], ""
            )
        );
    }
}