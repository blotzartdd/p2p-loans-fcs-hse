// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("P2PLoansModule", (m) => {

    const appFee = 1e9;
    const p2ploans = m.contract("P2PLoans", [appFee]);

    return { p2ploans };
});
