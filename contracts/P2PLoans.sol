// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// import "hardhat/console.sol";
import "./IERC20.sol";

struct LoanPool {
    address poolOwner;

    uint256 totalAmount;
    uint256 trustedTokenTotalAmount;
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
    uint256[] poolIds;
    uint256 totalReward;
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
    event BorrowMade(uint256 loanId);
    event NewLender();
    event NewBorrower();
    event LoanPayed(uint256 loanId);

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

        uint256 poolId = pools.length;

        for (uint256 i = 0; i < _lenders.length; ++i) {
            require(lenders[_lenders[i]].isActive, "Only lenders can join pool.");
        }

        for (uint256 i = 0; i < _lenders.length; ++i) {
            lenders[_lenders[i]].poolIds.push(poolId);
        }

        uint256[] memory _loanIds;
        pools.push(LoanPool(msg.sender, msg.value, 0, _poolLenderFee, _lenders, _loanIds, true));
        lenderToPoolAmount[msg.sender][poolId] += msg.value;

        emit PoolCreated(msg.sender);
    }

    function joinPool(uint256 poolId) external {
        addToPool(msg.sender, poolId);
    }

    function contributeToPool(uint256 poolId) external payable {
        require(lenders[msg.sender].isActive, "Only lenders can contribute to pool.");
        require(isInPool(msg.sender, poolId), "Lender should be in pool.");
        require(msg.value > 0, "Should contribute more than 0.");
        lenderToPoolAmount[msg.sender][poolId] += msg.value;
        pools[poolId].totalAmount += msg.value;

        emit ContributedToPool();
    }  

     function withdrawFromPool(uint256 poolId, uint256 amount) external {
        require(lenders[msg.sender].isActive, "Only lenders can withdraw from pool.");
        require(isInPool(msg.sender, poolId), "Lender should be in pool.");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Successfully withdrawn from pool");

        lenderToPoolAmount[msg.sender][poolId] -= amount;
        pools[poolId].totalAmount -= amount;
        emit WithdrawnFromPool();
    } 

    function getLenderReward(uint256 poolId) external {
        require(lenders[msg.sender].isActive, "Only lenders can withdraw from pool.");
        require(isInPool(msg.sender, poolId), "Lender should be in pool.");
        trustedToken.transfer(msg.sender, lenders[msg.sender].totalReward);
    }

    // Make approve before 
    function makeBorrow(uint256 amount, uint256 trustedTokenAmount, uint256 duration, uint256 poolId) external { // duration in second
        require(borrowers[msg.sender].isActive, "Should be active borrower.");
        uint256 fee = trustedTokenAmount * appFee / 10000;
        Loan memory loan = Loan(amount, amount + fee, fee, block.timestamp, duration, msg.sender, false);

        uint256 loanId = loans.length;

        trustedToken.transferFrom(msg.sender, address(this), trustedTokenAmount + fee);

        pools[poolId].loanIds.push(loanId);
        loans.push(loan);

        emit BorrowMade(loanId);
    }

    function payLoan(uint256 loanId) external payable {
        require(borrowers[msg.sender].isActive, "Should be borrower.");
        require(loans[loanId].borrower == msg.sender, "Should be valid borrower.");
        require(msg.value > 0, "Should pay > 0.");

        // TODO: Change to convertion
        loans[loanId].left -= msg.value;
        trustedToken.transfer(msg.sender, msg.value);

        if (loans[loanId].left == 0) {
            loans[loanId].isPayed = true;
            emit LoanPayed(loanId);
        }
    }

    function becomeLender() external {
        require(!lenders[msg.sender].isActive, "Should not be lender.");
        uint[] memory poolsId;
        lenders[msg.sender] = LenderInfo(poolsId, 0, true);

        emit NewLender();
    }

    function becomeBorrower() external {
        require(!borrowers[msg.sender].isActive, "Should not be borrower.");
        uint256[] memory loanIds;
        borrowers[msg.sender] = BorrowerInfo(loanIds, true);

        emit NewBorrower();
    }

    function getLenderPools(address lender) external view returns (uint256[] memory) {
        return lenders[lender].poolIds;
    }

    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowers[borrower].loanIds;
    }

    function isInPool(address addr, uint256 poolId) public view returns (bool) {
        require(lenders[addr].isActive, "Should be lender.");
        for (uint256 i = 0; i < lenders[addr].poolIds.length; ++i) {
            if (lenders[addr].poolIds[i] == poolId) {
                return true;
            }
        }

        return false;
    }

    function addToPool(address lender, uint256 poolId) private {
        require(poolId < pools.length, "Given pool id is bigger than pool amount.");
        require(lenders[lender].isActive, "Only lenders can join pool.");
        require(!isInPool(lender, poolId), "Can't join pool twice at a time");

        lenders[msg.sender].poolIds.push(poolId);
        pools[poolId].lenders.push(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}
