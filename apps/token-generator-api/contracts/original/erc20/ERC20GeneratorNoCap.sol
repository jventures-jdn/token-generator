// contracts/ERC20Generator.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';

contract ERC20GeneratorUpdate is ERC20Pausable, ERC20Burnable, AccessControl {
    bool public immutable mintable; // @init_mintable
    bool public immutable burnable; // @init_burnable
    bool public immutable pausable; // @init_pausable

    bytes32 public constant TRANSFEROR_ROLE = keccak256('TRANSFEROR_ROLE'); // @init_transferor
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE'); // @init_minter
    bytes32 public constant BURNER_ROLE = keccak256('BURNER_ROLE'); // @init_burner
    bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE'); // @init_pauser

    struct Args {
        string name;
        string symbol;
        uint256 initialSupply;
        bool mintable; // @init_mintable
        bool burnable; // @init_burnable
        bool pausable; // @init_pausable
        address payee;
        address transferor; // @init_transferor
        address minter; // @init_minter
        address burner; // @init_burner
        address pauser; // @init_pauser
    }

    constructor(Args memory args_) ERC20(args_.name, args_.symbol) {
        // Grant roles to a specified account
        _setupRole(TRANSFEROR_ROLE, args_.transferor); // @init_transferor
        _setupRole(MINTER_ROLE, args_.minter); // @init_minter
        _setupRole(BURNER_ROLE, args_.burner); // @init_burner
        _setupRole(PAUSER_ROLE, args_.pauser); // @init_pausera

        // Mint `initialSupply` to the owner
        _mint(args_.payee, args_.initialSupply);

        mintable = args_.mintable; // @init_mintable
        burnable = args_.burnable; // @init_burnable
        pausable = args_.pausable; // @init_pausable
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

    // @start_minter
    /**
     * @dev Modifier to make a function callable only when the caller is minter role.
     */
    modifier onlyMinter() {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            'ERC20Generator: caller must have minter role'
        );
        _;
    } // @end_minter

    // @start_burner
    /**
     * @dev Modifier to make a function callable only when the caller is burner role.
     */
    modifier onlyBurner() {
        require(
            hasRole(BURNER_ROLE, _msgSender()),
            'ERC20Generator: caller must have burner role'
        );
        _;
    } // @end_burner

    // @start_pauser
    /**
     * @dev Modifier to make a function callable only when the caller is pauser role.
     */
    modifier onlyPauser() {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            'ERC20Generator: caller must have pauser role'
        );
        _;
    } // @end_pauser

    // @start_transferor
    /**
     * @dev Modifier to make a function callable only when the caller is transferor role.
     */
    modifier onlyTransferor() {
        require(
            hasRole(TRANSFEROR_ROLE, _msgSender()),
            'ERC20Generator: caller must have transferor role'
        );
        _;
    } // @end_transferor

    /* -------------------------------------------------------------------------- */
    /*                                   Method                                   */
    /* -------------------------------------------------------------------------- */
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
    // @start_replace ['onlyMinter'] to ['']
    function mint(
        address to,
        uint256 amount
    ) public virtual onlyMinter whenMintable {
        _mint(to, amount);
    }

    // @end_replace ['onlyMinter'] to ['']

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

    function adminBurn(
        address account,
        uint256 amount
    ) public virtual onlyBurner {
        _approve(account, _msgSender(), amount);
        burnFrom(account, amount);
    }

    /* -------------------------------- Transfer -------------------------------- */
    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * Requirements:
     *
     * - the caller must be have transferor role
     * - the contract must enabled burnable
     */
    function adminTransfer(
        address from,
        address to,
        uint256 amount
    ) public virtual onlyTransferor returns (bool) {
        _transfer(from, to, amount);
        return true;
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
    function pause() public onlyPauser whenPausable {
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
    function unpause() public onlyPauser whenPausable {
        _unpause();
    }

    /* --------------------------------- Decimal -------------------------------- */
    /**
     * @dev Returns the number of decimal places used for token balances.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}
