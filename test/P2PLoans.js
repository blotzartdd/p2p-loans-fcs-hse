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
        const [owner, otherAccount] = await ethers.getSigners();

        const P2PLoans = await ethers.getContractFactory("P2PLoans");
        const p2ploans = await P2PLoans.deploy(123);

        return { p2ploans, owner, otherAccount };
    }

    describe("Deployment", function() {
        it("Should set the right owner", async function() {
            const { p2ploans, owner } = await loadFixture(deployFixture);

            expect(await p2ploans.owner()).to.equal(owner.address);
        });
    });

    describe("Loan Pools", function() {
        it("Should create pool", async function() {
            const { p2ploans, owner } = await loadFixture(deployFixture);

            const poolLenderFee = 123;
            await expect(p2ploans.createPool(poolLenderFee, [owner.address], { value: 10 }))
                .to.emit(p2ploans, "PoolCreated");

            expect(await ethers.provider.getBalance(await p2ploans.getAddress())).to.equal(10);
        })
    });
});
