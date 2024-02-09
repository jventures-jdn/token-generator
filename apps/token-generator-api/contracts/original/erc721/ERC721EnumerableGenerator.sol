// contracts/ERC721/ERC721EnumerableGeneratorExperiment.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import './ERC721Generator.sol';

// ERC721 Enumerable Generator for experiment (optimized)
contract ERC721EnumerableGenerator is ERC721Generator, ERC721Enumerable {
    constructor(ERC721Libs.Args memory args_) ERC721Generator(args_) {}

    /**
     * @dev return _baseTokenURI
     */
    function _baseURI()
        internal
        view
        virtual
        override(ERC721, ERC721Generator)
        returns (string memory)
    {
        return super._baseURI();
    }

    /**
     * @dev See {ERC721-_burn}. This override additionally checks to see if a
     * token-specific URI was set for the token, and if so, it deletes the token URI from
     * the storage mapping.
     */
    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721Generator) {
        super._burn(tokenId);
    }

    /**
     * @dev See {ERC721-tokenURI}.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721, ERC721Generator) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev See {ERC721-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - the contract must not be paused.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override(ERC721Generator, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Generator, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
