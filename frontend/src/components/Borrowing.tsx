import { useState } from 'react';
import { parseEther, formatEther, parseUnits, formatUnits } from 'ethers';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { Wallet, ShieldCheck, CircleDollarSign } from 'lucide-react';
import { trustedTokenAddress, trustedTokenABI } from '../trustedTokenConfig';
import { p2ploansAddress, p2ploansABI } from '../p2ploansConfig';
import { Coins, ArrowRightLeft } from 'lucide-react';

import { getPoolsAmount, getPool } from './utils';

interface LoanRequest {
    id: number;
    amount: bigint;
    collateral: bigint;
    duration: number;
    apr: number;
}

function getTrustedTokenBalance(address: `0x${string}` | undefined) {
    if (address === undefined) {
        address = `0x${''}`;
    }

    const { data: balance, isSuccess } = useReadContract({
        address: trustedTokenAddress,
        abi: trustedTokenABI,
        functionName: 'balanceOf',
        args: [address],
    });


    if (!address) {
        return undefined;
    }

    if (!isSuccess) {
        return undefined;
    }

    return balance.valueOf();
}

function MakeBorrow({ borrowAmount, collateralAmount, duration, maxFee, isBalance, isDuration, isFee }:
    { borrowAmount: bigint, collateralAmount: bigint, duration: bigint, maxFee: bigint, isBalance: boolean, isDuration: boolean, isFee: boolean }) {
    const [showGoodPoolsMenu, setShowGoodPoolsMenu] = useState(false);
    const pools = [];
    const poolsAmount = getPoolsAmount();
    console.log("Borrow amount:", borrowAmount);
    for (let i = 0n; i < poolsAmount; ++i) {
        const pool = getPool(i);
        if (pool.apr < maxFee && pool.amount >= borrowAmount && pool.isActive) {
            pools.push(pool);
            console.log("Pool number", i, ":", pool);
        }
    }

    const formComplete = () => {
        return collateralAmount > 0 && duration > 0 && maxFee > 0;
    }

    const { writeContract: writeContractApprove } = useWriteContract();
    async function approve(poolFee: bigint) {
        writeContractApprove({
            address: trustedTokenAddress,
            abi: trustedTokenABI,
            functionName: 'approve',
            args: [p2ploansAddress, collateralAmount],
        })
    };

    const { writeContract: writeContractBorrow } = useWriteContract();
    async function makeBorrow(poolId: bigint) {
        writeContractBorrow({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'makeBorrow',
            args: [borrowAmount, collateralAmount, duration, poolId],
        });
    };

    async function handleMakeBorrow(poolId: bigint, poolFee: bigint) {
        setShowGoodPoolsMenu(false);
        await approve(poolFee);
        await makeBorrow(poolId);
    }

    return (
        <>
            <button
                className={`w-full px-6 py-2 ${isBalance && isDuration && isFee && formComplete() ? 'bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors' : 'bg-gray-300 text-white rounded-lg'}`}
                disabled={!isBalance || !isDuration || !isFee || !formComplete()}
                onClick={() => setShowGoodPoolsMenu(true)}>
                Submit Borrow Request
            </button>
            {
                showGoodPoolsMenu && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full space-y-3">
                            <p className="text-lg font-semibold mb-4">Select pool</p>
                            <div className="grid gap-4">
                                {pools.map((pool) => (
                                    <button
                                        key={pool.id}
                                        className="border rounded-lg p-4 hover:border-lime-500 transition-colors"
                                        onClick={() => handleMakeBorrow(pool.id, pool.apr)}
                                    >
                                        {pool.isLoaded ? (
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-lg font-semibold">
                                                        {formatEther(pool.amount)} ETH
                                                    </p>

                                                    <p className="text-sm text-gray-600">
                                                        Activity: {pool.isActive ? "Yes" : "No"}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Pool ID: {pool.id}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-blue-600">
                                                        {pool.apr}% Pool fee
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center items-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
                                                <span className="ml-3">Loading pool data...</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowGoodPoolsMenu(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-lime-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                    </div >
                )
            }
        </>
    )
}

function BorrowRequest({ usdtBalance }: { usdtBalance: bigint | undefined }) {
    const [borrowAmount, setBorrowAmount] = useState('');
    const [collateralAmount, setCollateralAmount] = useState('');
    const [duration, setDuration] = useState('');
    const [maxFee, setMaxFee] = useState('');
    const ethToUsdt = 2010.42;

    const checkBalance = () => {
        return usdtBalance === undefined || usdtBalance >= Number(collateralAmount);
    }

    const checkDuration = () => {
        return Number(duration) <= 90;
    }

    const checkFee = () => {
        return Number(maxFee) <= 99 && Number(maxFee) >= 0;
    }

    function getCorrectEthersString(amount: string) {
        return amount === '' ? '0' : amount.split(',').join('');
    }

    return (
        <div className="space-y-4">
            <input
                type="number"
                value={borrowAmount}
                onChange={(e) => {
                    setBorrowAmount(e.target.value);
                    if (e.target.value) {
                        setCollateralAmount(e.target.value * ethToUsdt);
                    } else {
                        setCollateralAmount(e.target.value);
                    }
                }}
                placeholder="Amount to borrow (ETH)"
                min="0"
                className={`w-full px-4 py-2 rounded border focus:outline-none ${checkBalance() ? 'focus:ring-2 focus:ring-lime-500' : 'ring-2 ring-red-300'}`}
                autoFocus
            />
            <input
                type="number"
                value={collateralAmount}
                onChange={(e) => {
                    setCollateralAmount(e.target.value);
                    if (e.target.value) {
                        setBorrowAmount(e.target.value / ethToUsdt);
                    } else {
                        setBorrowAmount(e.target.value);
                    }
                }}
                placeholder="Collateral amount (USDT)"
                min="0"
                className={`w-full px-4 py-2 rounded border focus:outline-none ${checkBalance() ? 'focus:ring-2 focus:ring-lime-500' : 'ring-2 ring-red-300'}`}
            />
            <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Loan duration (days)"
                min="1"
                onKeyDown={(evt) => evt.key === '.' && evt.preventDefault()}
                className={`w-full px-4 py-2 rounded border focus:outline-none ${checkDuration() ? 'focus:ring-2 focus:ring-lime-500' : 'ring-2 ring-red-300'}`}
            />
            <input
                type="number"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                placeholder="Max loan fee (in %)"
                min="0"
                onKeyDown={(evt) => evt.key === '.' && evt.preventDefault()}
                className={`w-full px-4 py-2 rounded border focus:outline-none ${checkFee() ? 'focus:ring-2 focus:ring-lime-500' : 'ring-2 ring-red-300'}`}
            />
            <MakeBorrow
                borrowAmount={BigInt(parseEther(getCorrectEthersString(borrowAmount.toLocaleString())))}
                collateralAmount={BigInt(parseUnits(getCorrectEthersString(collateralAmount.toLocaleString()), 6))}
                duration={BigInt(duration) * 86400n}
                maxFee={BigInt(maxFee)}
                isBalance={checkBalance()}
                isDuration={checkDuration()}
                isFee={checkFee()}
            />
        </div>
    );
}

function Borrow({ usdtBalance }: { usdtBalance: bigint | undefined }) {

    return (
        <div className="bg-green-50 rounded-lg p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <CircleDollarSign className="w-5 h-5" />
                Borrow Request
            </h3>
            <BorrowRequest usdtBalance={usdtBalance} />
        </div>
    );
}

function getBorrower(address: `0x${string}` | undefined) {
    if (address === undefined) {
        address = `0x${''}`;
    }

    const { data: borrower, isSuccess } = useReadContract({
        address: p2ploansAddress,
        abi: p2ploansABI,
        functionName: 'borrowers',
        args: [address],
    });

    if (isSuccess) {
        return { isActive: borrower };
    }

    return { isActive: false };
}


function BecomeBorrower({ address }: { address: `0x${string}` | undefined }) {
    const { isPending, writeContract } = useWriteContract();
    const borrower = getBorrower(address);

    async function becomeBorrower() {
        writeContract({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'becomeBorrower',
            args: [],
        })
    };

    return (
        <>
            {borrower.isActive ? (
                < div className="bg-lime-50 rounded-lg p-6 flex items-center text-lg font-semibold">
                    <div className="flex text-lg gap-4">
                        Your borrower status: Active
                    </div>
                </div >
            ) : (
                <div className="bg-lime-50 rounded-lg p-6">
                    {isPending ? (<div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-lime-600"></div>
                    </div>
                    ) : (
                        <>
                            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                                <ArrowRightLeft className="w-5 h-5" />
                                Join community
                            </h3 >
                            <div className="flex gap-4">
                                <button
                                    className="px-6 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                                    onClick={becomeBorrower}
                                >
                                    Become Borrower
                                </button>
                            </div>
                        </>)}
                </div >
            )
            }
        </>
    );
}

function BorrowerInfo({ usdtBalance, ethBalance, address }: {
    address: `0x${string}` | undefined,
    usdtBalance: bigint | undefined,
    ethBalance: { decimals: number; formatted: string; symbol: string; value: bigint; } | undefined
}) {
    return (
        <div className="grid md:grid-rows-3 gap-6">
            <div className="bg-lime-50 rounded-lg p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <ShieldCheck className="w-5 h-5" />
                    Your Collateral Balance
                </h3>
                <p className="text-2xl font-bold text-lime-700">
                    {usdtBalance !== undefined ? formatUnits(usdtBalance, 6).slice(0, 10) : '---'} USDT
                </p>
                <p className="text-sm text-gray-600 mt-2">
                    Available for collateral
                </p>
            </div>

            <div className="bg-lime-50 rounded-lg p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Coins className="w-5 h-5" />
                    Your ETH Balance
                </h3>
                <p className="text-2xl font-bold text-lime-700">
                    {ethBalance ? formatEther(ethBalance.value).slice(0, 10) : '---'} ETH
                </p>
            </div>

            <BecomeBorrower address={address} />

        </div>
    );
}

export function Borrowing() {
    const { address } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    const usdtBalance = getTrustedTokenBalance(address);

    const loanRequests: LoanRequest[] = [
        {
            id: 1,
            amount: parseEther('5'),
            collateral: parseEther('7.5'),
            duration: 30,
            apr: 8,
        },
        {
            id: 2,
            amount: parseEther('10'),
            collateral: parseEther('15'),
            duration: 60,
            apr: 10,
        },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Wallet className="w-8 h-8 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Borrower panel</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Borrow usdtBalance={usdtBalance} />
                    <BorrowerInfo usdtBalance={usdtBalance} ethBalance={ethBalance} address={address} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6">Active Loan Requests</h3>
                <div className="grid gap-4">
                    {loanRequests.map((request) => (
                        <div
                            key={request.id}
                            className="border rounded-lg p-4 hover:border-green-500 transition-colors"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold">
                                        {formatEther(request.amount)} ETH
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Collateral: {formatEther(request.collateral)} ETH
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Duration: {request.duration} days
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-blue-600">
                                        {request.apr}% Loan fee
                                    </p>
                                    <button className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                                        Fund Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
