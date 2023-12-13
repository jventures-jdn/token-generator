// contracts/ERC721/ERC721Libs.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

library ERC721Libs {
    struct Args {
        string name;
        string symbol;
        string baseTokenURI;
        bool burnable;
        bool pausable;
        bool baseTokenURIChangeable;
        bool autoId;
    }
}
