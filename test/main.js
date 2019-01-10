const testRpc = require('./helpers/testRpc');

let LevelToken = artifacts.require("./LevelToken.sol");

const decimals = 8;
const zeroes = Math.pow(10, decimals);
const zeroesBN = (web3.utils.toBN(10)).pow(web3.utils.toBN(decimals));

contract('LevelToken', async function (accounts) {
    let tokenContract;

    before(async function(){
        tokenContract = await LevelToken.new(accounts[1]);
    });

    it("should creator not have tokens", async function () {
        let balance = await tokenContract.balanceOf(accounts[0]);
        assert.equal(balance.toNumber(), 0, "The creator should have 0 tokens");
    });

    it("should distributor have all the tokens", async function() {
        let balance = await tokenContract.balanceOf(accounts[1]);
        let shouldbe = web3.utils.toBN(10000000000).mul(zeroesBN);
        assert.equal(balance.toString(), shouldbe.toString(), "There should be 10 billions tokens");
    });

    it("should distributor be able to pause transfer", async function() {
        await tokenContract.pause({from: accounts[1]});
        assert.ok(await tokenContract.paused(), "The transfer should be paused");
    });

    it("should not be able to transfer", async function() {
        await testRpc.assertThrow('token approve should have thrown', async () => {
            await tokenContract.approve(accounts[3], 1000, {from: accounts[1]});
        });

        await testRpc.assertThrow('token transfer should have thrown', async () => {
            await tokenContract.transfer(accounts[3], 1000, {from: accounts[1]});
        });

        await testRpc.assertThrow('token transferFrom should have thrown', async () => {
            await tokenContract.transferFrom(accounts[1], accounts[3], 1000, {from: accounts[1]});
        });
    });

    it("should transfer be enabled by distributor", async function() {
        await tokenContract.unpause({from: accounts[1]});
        assert.ok(! await tokenContract.paused(), 'Transfer should have been enabled');
    });

    it("should transfer succeed", async function() {
        let prevBalance = await tokenContract.balanceOf(accounts[3]);
        await tokenContract.transfer(accounts[3], 100000, {from: accounts[1]});
        let newBalance = await tokenContract.balanceOf(accounts[3]);

        assert.ok(prevBalance.addn(100000).toNumber(), newBalance.toNumber(), 'Tokens should have been transferred');

        await tokenContract.approve(accounts[4], 100000, {from: accounts[1]});
        await tokenContract.transferFrom(accounts[1], accounts[3], 100000, {from: accounts[4]});
        assert.ok(prevBalance.addn(200000).toNumber(), newBalance.toNumber(), 'Tokens should have been transferred from');

    });
});