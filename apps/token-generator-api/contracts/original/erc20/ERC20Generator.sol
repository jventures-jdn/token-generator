// prettier-ignore
// contracts/ERC20Generator.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/security/Pausable.sol'; // @pause
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol'; // @supplyCap
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol'; // @pause
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol'; // @burn

// @start_replace_burn[ERC20Burnable,]
// @start_replace_pause[ERC20Pausable,]
contract ERC20Generator is ERC20Pausable, ERC20Burnable, AccessControl {
    // @end_replace_burn  @end_replace_pause
    uint256 private immutable _cap; // @supplyCap
    bytes32 public constant TRANSFEROR_ROLE = keccak256('TRANSFEROR_ROLE'); // @adminTransfer
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE'); // @mint
    bytes32 public constant BURNER_ROLE = keccak256('BURNER_ROLE'); // @adminBurn
    bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE'); // @pause

    struct Args {
        string name;
        string symbol;
        uint256 initialSupply;
        uint256 supplyCap; // @supplyCap
        address payee;
        address transferor; // @adminTransfer
        address minter; // @mint
        address burner; // @adminBurn
        address pauser; // @pause
    }

    constructor(Args memory args_) ERC20(args_.name, args_.symbol) {
        // @start_supplyCap
        // Initialize supply cap
        require(args_.supplyCap > 0, 'ERC20Capped: cap is 0');
        _cap = args_.supplyCap;
        // @end_supplyCap

        // Grant roles to a specified account
        _setupRole(TRANSFEROR_ROLE, args_.transferor); // @adminTransfer
        _setupRole(MINTER_ROLE, args_.minter); // @mint
        _setupRole(BURNER_ROLE, args_.burner); // @adminBurn
        _setupRole(PAUSER_ROLE, args_.pauser); // @pause

        // Mint `initialSupply` to the owner
        _mint(args_.payee, args_.initialSupply);
    }

    /* -------------------------------------------------------------------------- */
    /*                                  Modifier                                  */
    /* -------------------------------------------------------------------------- */
    // @start_mint
    /**
     * @dev Modifier to make a function callable only when the caller is minter role.
     */
    modifier onlyMinter() {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            'ERC20Generator: caller must have minter role'
        );
        _;
    } // @end_mint

    // @start_adminBurn
    /**
     * @dev Modifier to make a function callable only when the caller is burner role.
     */
    modifier onlyBurner() {
        require(
            hasRole(BURNER_ROLE, _msgSender()),
            'ERC20Generator: caller must have burner role'
        );
        _;
    } // @end_adminBurn

    // @start_pause
    /**
     * @dev Modifier to make a function callable only when the caller is pauser role.
     */
    modifier onlyPauser() {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            'ERC20Generator: caller must have pauser role'
        );
        _;
    } // @end_pause

    // @start_adminTransfer
    /**
     * @dev Modifier to make a function callable only when the caller is transferor role.
     */
    modifier onlyTransferor() {
        require(
            hasRole(TRANSFEROR_ROLE, _msgSender()),
            'ERC20Generator: caller must have transferor role'
        );
        _;
    } // @end_adminTransfer

    /* -------------------------------------------------------------------------- */
    /*                                   Method                                   */
    /* -------------------------------------------------------------------------- */
    // @start_supplyCap
    /* --------------------------------- Capped --------------------------------- */
    /* https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.0/contracts/token/ERC20/extensions/ERC20Capped.sol */

    /**
     * @dev Returns the cap on the token's total supply.
     */
    function cap() public view virtual returns (uint256) {
        return _cap;
    } // @end_supplyCap

    /**
     * @dev See {ERC20-_mint}.
     */
    function _mint(address account, uint256 amount) internal override(ERC20) {
        // @start_supplyCap
        require(
            ERC20.totalSupply() + amount <= cap(),
            'ERC20Capped: cap exceeded'
        ); // @end_supplyCap
        super._mint(account, amount);
    }

    /* ------------------------------ AccessControl ----------------------------- */
    //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.0/contracts/access/AccessControl.sol

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - The caller must have the same role as the grant role.
     *
     * May emit a {RoleGranted} event.
     */
    function grantRole(
        bytes32 role,
        address account
    ) public virtual override(AccessControl) onlyRole(role) {
        super._grantRole(role, account);
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - The caller must  have the same role as the grant role.
     *
     * May emit a {RoleRevoked} event.
     */
    function revokeRole(
        bytes32 role,
        address account
    ) public virtual override(AccessControl) onlyRole(role) {
        super._revokeRole(role, account);
    }

    // @start_mint
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
     */
    function mint(address to, uint256 amount) public virtual onlyMinter {
        _mint(to, amount);
    } // @end_mint

    // @start_adminBurn
    /* -------------------------------- Burnable -------------------------------- */
    /* https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol */

    function adminBurn(
        address account,
        uint256 amount
    ) public virtual onlyBurner {
        _approve(account, _msgSender(), amount);
        burnFrom(account, amount);
    } // @end_adminBurn

    // @start_adminTransfer
    /* -------------------------------- Transfer -------------------------------- */
    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * Requirements:
     *
     * - the caller must be have transferor role
     */
    function adminTransfer(
        address from,
        address to,
        uint256 amount
    ) public virtual onlyTransferor returns (bool) {
        _transfer(from, to, amount);
        return true;
    } // @end_adminTransfer

    // @start_pause
    /* -------------------------------- Pausable -------------------------------- */
    /* https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Pausable.sol */

    /**
     * @dev See {ERC20-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - the contract must not be paused.
     */
    // @start_replace_burn[(ERC20, ERC20Pausable)]
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    } // @end_replace_burn

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     * - The caller mustber owner
     */
    function pause() public onlyPauser {
        _pause();
    }

    /**
     * @dev Triggers normal state.
     *
     * Requirements:
     * - The caller mustber owner
     */
    function unpause() public onlyPauser {
        _unpause();
    } // @end_pause

    /* --------------------------------- Decimal -------------------------------- */
    /**
     * @dev Returns the number of decimal places used for token balances.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}
