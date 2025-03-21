// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "./IERC20.sol";

struct LoanPool {
    address poolOwner;

    uint256 totalAmount;
    uint256 poolLenderFee;

    address[] lenders;
    uint256[] loanIds;
    bool isActive;
}

struct Loan {
    uint256 total;
    uint256 left;
    uint256 fee;

    uint256 loanStart;
    uint256 duration;

    address borrower;
    bool isPayed;
}

struct LenderInfo {
    uint256[] poolsId;
    bool isActive;
}

struct BorrowerInfo {
    uint256[] loanIds;
    bool isActive;
}

contract P2PLoans {
    address public owner;
    address private trustedTokenAddress = 0x7169D38820dfd117C3FA1f22a697dBA58d90BA06; // Sepolia Tether USD
    IERC20 public trustedToken;

    uint256 public appFee; // [0, 100]

    LoanPool[] public pools;
    
    mapping(address => LenderInfo) public lenders;
    mapping(address => mapping(uint256 => uint256)) public lenderToPoolAmount;
    mapping(address => BorrowerInfo) public borrowers;
    Loan[] loans;

    event PoolCreated(address indexed creator);
    event WithdrawnFromPool();
    event ContributedToPool();
    event BorrowMade();

    constructor(uint256 _appFee) {
        owner = msg.sender;
        trustedToken = IERC20(trustedTokenAddress);
        appFee = _appFee;
    }

    function changeAppFee(uint256 newFee) external onlyOwner {
        require(newFee >= 0, "Fee should be positive.");
        appFee = newFee;
    }

    function createPool(uint256 _poolLenderFee, address[] calldata _lenders) external payable {
        require(msg.sender == owner || lenders[msg.sender].isActive, "Only owner and active lenders can create pool.");
        require(msg.value > 0, "Creator should provide initial pool amount.");

        uint256[] memory _loanIds;
        pools.push(LoanPool(msg.sender, msg.value, _poolLenderFee, _lenders, _loanIds, true));

        emit PoolCreated(msg.sender);
    }

    function joinPool(uint256 poolId) external {
        require(poolId < pools.length, "Given pool id is bigger than pool amount.");
        require(lenders[msg.sender].isActive, "Only lenders can join pool.");
        lenders[msg.sender].poolsId.push(poolId);
        pools[poolId].lenders.push(msg.sender);
    }

    function contibuteToPool(uint256 poolId) external payable {
        require(lenders[msg.sender].isActive, "Only lenders can contribute to pool.");
        require(isInPool(msg.sender, poolId), "Lender should be in pool.");
        lenderToPoolAmount[msg.sender][poolId] += msg.value;
        pools[poolId].totalAmount += msg.value;

        emit ContributedToPool();
    }  

     function withdrawFromPool(uint256 poolId, uint256 amount) external {
        require(lenders[msg.sender].isActive, "Only lenders can withdraw from pool.");
        require(isInPool(msg.sender, poolId), "Lender should be in pool.");
        lenderToPoolAmount[msg.sender][poolId] -= amount;
        pools[poolId].totalAmount -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");

        require(success, "Successfully withdrawn from pool");
        emit WithdrawnFromPool();
    } 

    // Make approve before 
    function makeBorrow(uint256 amount, uint256 duration, uint256 poolId) external { // duration in second
        require(borrowers[msg.sender].isActive, "Should be active borrower.");
        uint256 fee = amount * appFee / 10000;
        Loan memory loan = Loan(amount, amount + fee, fee, block.timestamp, duration, msg.sender, false);

        uint256 loanId = loans.length;

        trustedToken.transferFrom(msg.sender, address(this), amount + fee);

        pools[poolId].loanIds.push(loanId);
        loans.push(loan);

        emit BorrowMade();
    }

    function becomeLender() external {
        require(!lenders[msg.sender].isActive, "Should not be lender.");
        uint[] memory poolsId;
        lenders[msg.sender] = LenderInfo(poolsId, true);
    }

    function becomeBorrower() external {
        require(!borrowers[msg.sender].isActive, "Should not be borrower.");
        uint256[] memory loanIds;
        borrowers[msg.sender] = BorrowerInfo(loanIds, true);
    }

    function isInPool(address addr, uint256 poolId) private view returns (bool) {
        require(lenders[addr].isActive, "Should be lender.");
        for (uint256 i = 0; i < lenders[addr].poolsId.length; ++i) {
            if (lenders[addr].poolsId[i] == poolId) {
                return true;
            }
        }

        return false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}
