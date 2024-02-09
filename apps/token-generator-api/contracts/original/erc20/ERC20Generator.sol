// contracts/ERC20Generator.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';

contract ERC20Generator is ERC20Capped, ERC20Pausable, ERC20Burnable, Ownable {
    bool public immutable mintable;
    bool public immutable burnable;
    bool public immutable pausable;

    struct Args {
        string name;
        string symbol;
        uint256 initialSupply;
        uint256 supplyCap;
        bool mintable;
        bool burnable;
        bool pausable;
    }

    constructor(
        Args memory args_
    ) ERC20(args_.name, args_.symbol) ERC20Capped(args_.supplyCap) {
        // mint the value of the `initialSupply` to the owner
        _mint(_msgSender(), args_.initialSupply);

        mintable = args_.mintable;
        burnable = args_.burnable;
        pausable = args_.pausable;
    }

    /* -------------------------------------------------------------------------- */
    /*                                  Modifier                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Modifier to make a function callable only when the mintable is enabled.
     */
    modifier whenMintable() {
        require(mintable, 'ERC20Generator: mint functionality not enabled');
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the burnable is enabled.
     */
    modifier whenBurnable() {
        require(burnable, 'ERC20Generator: burn functionality not enabled');
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the pausable is enabled.
     */
    modifier whenPausable() {
        require(pausable, 'ERC20Generator: pause functionality not enabled');
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   Method                                   */
    /* -------------------------------------------------------------------------- */

    /* --------------------------------- Capped --------------------------------- */
    /* https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.0/contracts/token/ERC20/extensions/ERC20Capped.sol */

    /**
     * @dev See {ERC20-_mint}.
     */
    function _mint(
        address account,
        uint256 amount
    ) internal override(ERC20Capped, ERC20) {
        require(
            ERC20.totalSupply() + amount <= cap(),
            'ERC20Capped: cap exceeded'
        );
        super._mint(account, amount);
    }

    /* -------------------------------- Mintable -------------------------------- */
    /*https://docs.icenetwork.io/build/evm/evm-and-solidity-smart-contracts/using-openzeppelin/erc20-standard/mintable-erc20 */

    /**
     * @dev Create `amount` tokens from the caller.
     *
     * See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must be owner
     * - the contract must enabled mintable
     */
    function mint(
        address to,
        uint256 amount
    ) public virtual onlyOwner whenMintable {
        _mint(to, amount);
    }

    /* -------------------------------- Burnable -------------------------------- */
    /* https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol */

    /**
     * @dev Destroys `amount` tokens from the owner.
     *
     * See {ERC20-_burn}.
     *
     * Requirements:
     *
     * - the contract must enabled burnable
     */
    function burn(uint256 amount) public virtual override whenBurnable {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * See {ERC20-_burn} and {ERC20-allowance}.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least `amount`.
     * - the contract must enabled burnable
     */
    function burnFrom(
        address account,
        uint256 amount
    ) public virtual override whenBurnable {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }

    /* -------------------------------- Pausable -------------------------------- */
    /* https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Pausable.sol */

    /**
     * @dev See {ERC20-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - the contract must not be paused.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     * - The caller mustber owner
     */
    function pause() public onlyOwner whenPausable {
        _pause();
    }

    /**
     * @dev Triggers normal state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     * - The caller mustber owner
     */
    function unpause() public onlyOwner whenPausable {
        _unpause();
    }
}
