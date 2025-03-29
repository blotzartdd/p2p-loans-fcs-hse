const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("P2PLoans", function() {
    async function deployFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, lender, borrower] = await ethers.getSigners();

        const P2PLoans = await ethers.getContractFactory("P2PLoans");
        const p2ploans = await P2PLoans.deploy(50);

        return { p2ploans, owner, lender, borrower };
    }

    describe("Deployment", function() {
        it("Should set the right owner", async function() {
            const { p2ploans, owner } = await loadFixture(deployFixture);

            expect(await p2ploans.owner()).to.equal(owner.address);
        });
    });

    describe("Loan Pools", function() {
        it("Owner should create pool", async function() {
            const { p2ploans } = await loadFixture(deployFixture);

            const poolLenderFee = 50;
            await expect(p2ploans.createPool(poolLenderFee, [], { value: 10 }))
                .to.emit(p2ploans, "PoolCreated");

            expect(await ethers.provider.getBalance(await p2ploans.getAddress())).to.equal(10);
        })

        it("Lender should create pool", async function() {
            const { p2ploans, lender } = await loadFixture(deployFixture);

            await expect(p2ploans.connect(lender).becomeLender())
                .to.emit(p2ploans, "NewLender");

            const poolLenderFee = 50;
            await expect(p2ploans.connect(lender).createPool(poolLenderFee, [lender.address], { value: 10 }))
                .to.emit(p2ploans, "PoolCreated");

            expect(await ethers.provider.getBalance(await p2ploans.getAddress())).to.equal(10);
        })
    });

    describe("Lender", function() {
        it("Non lender can't create pool", async function() {
            const { p2ploans, lender } = await loadFixture(deployFixture);

            const poolLenderFee = 50;
            await expect(p2ploans.connect(lender).createPool(poolLenderFee, [lender.address], { value: 10 }))
                .to.be.revertedWith("Only owner and active lenders can create pool.");
        })

        it("Should create new lender", async function() {
            const { p2ploans, lender } = await loadFixture(deployFixture);

            await expect(p2ploans.connect(lender).becomeLender())
                .to.emit(p2ploans, "NewLender");

            const res = await p2ploans.lenders(lender.address);
            expect(res.isActive).to.be.equal(true);
        })

        it("Should revert registered lender", async function() {
            const { p2ploans, lender } = await loadFixture(deployFixture);

            await expect(p2ploans.connect(lender).becomeLender())
                .to.emit(p2ploans, "NewLender");

            await expect(p2ploans.connect(lender).becomeLender()).to.be.revertedWith("Should not be lender.");
        })

        it("Lender should join pool", async function() {
            const { p2ploans, lender } = await loadFixture(deployFixture);

            await expect(p2ploans.connect(lender).becomeLender())
                .to.emit(p2ploans, "NewLender");

            const poolLenderFee = 50;
            await expect(p2ploans.createPool(poolLenderFee, [], { value: 10 }))
                .to.emit(p2ploans, "PoolCreated");

            await p2ploans.connect(lender).joinPool(0);

            const res = await p2ploans.lenders(lender.address);
            expect(res.isActive).to.be.equal(true);

            const pools = await p2ploans.getLenderPools(lender.address);
            expect(pools[0]).to.be.equal(0n);
        })

        it("Lender should contribute to pool", async function() {
            const { p2ploans, lender } = await loadFixture(deployFixture);

            await expect(p2ploans.connect(lender).becomeLender())
                .to.emit(p2ploans, "NewLender");

            const poolLenderFee = 50;
            await expect(p2ploans.createPool(poolLenderFee, [lender.address], { value: 10 }))
                .to.emit(p2ploans, "PoolCreated");

            expect(await ethers.provider.getBalance(await p2ploans.getAddress())).to.equal(10);

            await expect(p2ploans.connect(lender).contributeToPool(0, { value: 10 })).to.emit(p2ploans, "ContributedToPool");
            const lenderToPoolAmount = await p2ploans.lenderToPoolAmount(lender.address, 0);
            expect(lenderToPoolAmount, 10);

            expect(await ethers.provider.getBalance(await p2ploans.getAddress())).to.equal(20);
        })

        it("Lender should withdraw from pool", async function() {
            const { p2ploans, lender } = await loadFixture(deployFixture);

            await expect(p2ploans.connect(lender).becomeLender())
                .to.emit(p2ploans, "NewLender");

            const poolLenderFee = 50;
            await expect(p2ploans.createPool(poolLenderFee, [lender.address], { value: 10 }))
                .to.emit(p2ploans, "PoolCreated");

            expect(await ethers.provider.getBalance(await p2ploans.getAddress())).to.equal(10);

            await expect(p2ploans.connect(lender).contributeToPool(0, { value: 10 })).to.emit(p2ploans, "ContributedToPool");

            expect(await ethers.provider.getBalance(await p2ploans.getAddress())).to.equal(20);

            const poolId = 0;
            await expect(p2ploans.connect(lender).withdrawFromPool(poolId, 10)).to.emit(p2ploans, "WithdrawnFromPool");
            expect(await ethers.provider.getBalance(await p2ploans.getAddress())).to.equal(10);

            const pool = await p2ploans.pools(0);
            expect(pool.totalAmount).to.equal(10);

            const lenderToPoolAmount = await p2ploans.lenderToPoolAmount(lender.address, 0);
            expect(lenderToPoolAmount, 0);
        })
    });

    describe("Borrower", function() {
        it("Should create new borrower", async function() {
            const { p2ploans, borrower } = await loadFixture(deployFixture);

            await expect(p2ploans.connect(borrower).becomeBorrower())
                .to.emit(p2ploans, "NewBorrower");

            expect(await p2ploans.borrowers(borrower.address)).to.be.equal(true);
        });

        it("Should make borrow", async function() {
            const { p2ploans, borrower, lender } = await loadFixture(deployFixture);

            await expect(p2ploans.connect(borrower).becomeBorrower())
                .to.emit(p2ploans, "NewBorrower");

            await expect(p2ploans.connect(lender).becomeLender())
                .to.emit(p2ploans, "NewLender");

            const poolLenderFee = 5;
            await expect(p2ploans.connect(lender).createPool(poolLenderFee, [lender.address], { value: 10 }))
                .to.emit(p2ploans, "PoolCreated");

            // await expect(p2ploans.connect(borrower).makeBorrow(5, 0, 10, 0)).to.emit(p2ploans, "BorrowMade");
        });
    });
});
