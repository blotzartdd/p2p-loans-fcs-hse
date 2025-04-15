import { useState, useEffect } from 'react';
import { parseEther, formatEther, parseUnits, formatUnits } from 'ethers';
import { useAccount, useBalance, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Wallet, ShieldCheck, CircleDollarSign } from 'lucide-react';
import { trustedTokenAddress, trustedTokenABI } from '../trustedTokenConfig';
import { p2ploansAddress, p2ploansABI } from '../p2ploansConfig';
import { Coins, ArrowRightLeft } from 'lucide-react';

import { getPoolsAmount, getPool, getBorrowerLoanIds, getLoan, getHumanTime, getBorrower, getTrustedTokenBalance } from './utils';

function MakeBorrow({ borrowAmount, collateralAmount, duration, maxFee, isBalance, isDuration, isFee, setBorrowAmount, setCollateralAmount, setDuration, setMaxFee, usdtBalance }:
    {
        borrowAmount: bigint, collateralAmount: bigint, duration: bigint, maxFee: bigint, isBalance: boolean, isDuration: boolean, isFee: boolean,
        setBorrowAmount: Function, setCollateralAmount: Function, setDuration: Function, setMaxFee: Function, usdtBalance: bigint | undefined
    }) {
    if (usdtBalance === undefined) {
        usdtBalance = 0n;
    }
    const [showGoodPoolsMenu, setShowGoodPoolsMenu] = useState(false);
    const [selectedPoolId, setSelectedPoolId] = useState(-1n);
    const pools = [];
    const poolsAmount = getPoolsAmount();
    console.log("Borrow amount:", borrowAmount);
    for (let i = 0n; i < poolsAmount; ++i) {
        const pool = getPool(i);
        if (pool.apr <= maxFee && pool.currentAmount >= borrowAmount && pool.isActive) {
            pools.push(pool);
            console.log("Pool number", i, ":", pool);
        }
    }

    const formComplete = () => {
        return collateralAmount > 0 && duration > 0 && maxFee > 0;
    }

    const { data: approveHash, writeContract: writeContractApprove, isPending: isApprovePending } = useWriteContract();
    async function approve(collateralWithFee: bigint) {
        writeContractApprove({
            address: trustedTokenAddress,
            abi: trustedTokenABI,
            functionName: 'approve',
            args: [p2ploansAddress, collateralWithFee],
        })
    };

    const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveHash,
    });

    const { writeContract: writeContractBorrow, isPending: isBorrowPending } = useWriteContract();
    async function makeBorrow(poolId: bigint) {
        writeContractBorrow({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'makeBorrow',
            args: [borrowAmount, collateralAmount, duration, poolId],
        });
    };

    function handleMakeBorrow(poolId: bigint, poolFee: bigint) {
        setSelectedPoolId(poolId);

        const collateralWithFee = collateralAmount + collateralAmount * poolFee / 100n;
        console.log("Collateral with fee:", collateralWithFee);
        approve(collateralWithFee);
    }

    useEffect(() => {
        if (isApproveSuccess && selectedPoolId !== -1n) {
            makeBorrow(selectedPoolId);
            setSelectedPoolId(-1n);
            setShowGoodPoolsMenu(false);
            setBorrowAmount('');
            setCollateralAmount('');
            setDuration('');
            setMaxFee('');
        }
    }, [isApproveSuccess, selectedPoolId]);

    return (
        <>
            <button
                className={`w-full px-6 py-2 ${isBalance && isDuration && isFee && formComplete() ? 'bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors' : 'bg-gray-300 text-white rounded-lg'}`}
                disabled={!isBalance || !isDuration || !isFee || !formComplete()}
                onClick={() => setShowGoodPoolsMenu(true)}>
                Submit Borrow Request
            </button>

            {isBorrowPending === true && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-600"></div>
                </div>
            )}

            {
                showGoodPoolsMenu && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                        {isApprovePending === false ? (<div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full space-y-3">
                            <p className="text-lg font-semibold mb-4">Select pool</p>
                            {pools.length === 0 ? (
                                <div className="items-center">
                                    There is no pools for your request, please check active pools and change parameters
                                </div>) :
                                (<div className="grid gap-4">
                                    {pools.map((pool) => (
                                        <button
                                            key={pool.id}
                                            className={`border rounded-lg p-4 ${collateralAmount + collateralAmount * pool.apr / 100n <= usdtBalance ? "hover:border-lime-500" : "hoved:border-red-100"} transition-colors`}
                                            onClick={() => { handleMakeBorrow(pool.id, pool.apr) }}
                                            disabled={collateralAmount + collateralAmount * pool.apr / 100n > usdtBalance}
                                        >
                                            {pool.isLoaded ? (
                                                <div className="flex justify-between items-center space-x-1">
                                                    <div>
                                                        <p className="text-lg font-semibold">
                                                            {formatEther(borrowAmount)} ETH
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Activity: {pool.isActive ? "Yes" : "No"}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Pool ID: {pool.id}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-semibold text-blue-600">
                                                            {pool.apr}% Pool fee
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">
                                                            In this pool your collateral will be:
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text - sm ${collateralAmount + collateralAmount * pool.apr / 100n > usdtBalance ? "text-red-600" : "text-gray-600"}`}>
                                                            {formatUnits(collateralAmount + collateralAmount * pool.apr / 100n, 6)} USDT
                                                        </p>
                                                    </div>

                                                </div>
                                            ) : (
                                                <div className="flex justify-center items-center py-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
                                                    <span className="ml-3">Loading pool data...</span>
                                                </div>
                                            )}
                                        </button >
                                    ))
                                    }
                                </div >
                                )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowGoodPoolsMenu(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-lime-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div >
                        ) : (<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-600"></div>
                        )}
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
    const ethToUsdt = 1565.31; // ETH price + 1% App Fee

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
                        setCollateralAmount(String(Number(e.target.value) * ethToUsdt));
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
                        setBorrowAmount(String(Number(e.target.value) / ethToUsdt));
                    } else {
                        setBorrowAmount(e.target.value);
                    }
                }}
                placeholder="Collateral amount (USDT)"
                min="0"
                disabled
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
                setBorrowAmount={setBorrowAmount}
                setCollateralAmount={setCollateralAmount}
                setDuration={setDuration}
                setMaxFee={setMaxFee}
                usdtBalance={usdtBalance}
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
                                Register as borrower
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

function Loans({ loanIds }: { loanIds: readonly bigint[] }) {
    const finishedLoans = [];
    const notFinishedLoans = [];
    for (let i = 0; i < loanIds.length; ++i) {
        const loan = getLoan(loanIds[i]);
        if (loan.loanStart + loan.duration >= Date.now()) {
            loan.isExpired = true;
        }

        if (loan.isPayed || loan.isExpired) {
            finishedLoans.push(loan);
        } else {
            notFinishedLoans.push(loan);
        }
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 my-4">
                <h3 className="text-xl font-semibold mb-6">Active Loans</h3>
                <div className="grid gap-4">
                    {notFinishedLoans.map((loan) => (
                        <>
                            {
                                !loan.isPayed && (
                                    <div
                                        key={loan.id}
                                        className="border rounded-lg p-4 hover:border-lime-500 transition-colors"
                                    >
                                        {loan.isLoaded ? (<div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-lg font-semibold">
                                                    Loan amount: {formatEther(loan.totalBorrow)} ETH
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Left to return: {formatEther(loan.left)} ETH
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Loan collateral without fee: {formatUnits(loan.totalCollateral, 6)} USDT
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Loan start: {getHumanTime(loan.loanStart)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Till: {getHumanTime(loan.loanStart + loan.duration)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-semibold ${loan.isPayed ? "text-lime-600" : "text-red-600"}`}>
                                                    {loan.isPayed ? "Closed in time" : "Not closed"}
                                                </p>
                                                <PayLoan poolId={loan.poolId} loanId={loan.id} />
                                            </div>
                                        </div>
                                        ) : (<div className="flex justify-center items-center py-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
                                            <span className="ml-3">Loading loan data...</span>
                                        </div>)}
                                    </div>
                                )
                            }
                        </>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 my-4">
                <h3 className="text-xl font-semibold mb-6">Finished Loans</h3>
                <div className="grid gap-4">
                    {finishedLoans.map((loan) => (
                        <div
                            key={loan.id}
                            className="border rounded-lg p-4 hover:border-lime-500 transition-colors"
                        >
                            {loan.isLoaded ? (<div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold">
                                        Loan amount: {formatEther(loan.totalBorrow)} ETH
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Left to return: {formatEther(loan.left)} ETH
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Loan collateral without fee: {formatUnits(loan.totalCollateral, 6)} USDT
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Loan start: {getHumanTime(loan.loanStart)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Till: {getHumanTime(loan.loanStart + loan.duration)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-semibold ${loan.isPayed ? "text-lime-600" : "text-red-600"}`}>
                                        {loan.isPayed && !loan.isExpired ? "Closed in time" : "Loan expired"}
                                    </p>
                                </div>
                            </div>
                            ) : (<div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
                                <span className="ml-3">Loading loan data...</span>
                            </div>)}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

function PayLoan({ poolId, loanId }: { poolId: bigint, loanId: bigint }) {
    const [showPayLoanMenu, setShowPayLoanMenu] = useState(false);
    const [amount, setAmount] = useState('');
    const { isPending, writeContract } = useWriteContract();
    const loan = getLoan(loanId);

    async function payLoan() {
        writeContract({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'payLoan',
            args: [poolId, loanId],
            value: BigInt(parseEther(amount)),
        })
    };

    async function handlePayLoan() {
        setShowPayLoanMenu(false);
        payLoan();
        setAmount('');
    };

    return (
        <>
            {!loan.isPayed &&
                <>
                    <button className="mt-2 px-4 py-1 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                        onClick={() => setShowPayLoanMenu(true)}>
                        Pay loan
                    </button>
                    {isPending === true && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-600"></div>
                        </div>
                    )}
                    {
                        showPayLoanMenu && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                                    <p className="text-lg font-semibold mb-4">Loan payment</p>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount
                                        </label>
                                        <input
                                            type="number"
                                            id="amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                                            placeholder="Enter amount"
                                            min="0"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowPayLoanMenu(false)}
                                            className="px-4 py-2 text-gray-600 hover:text-lime-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handlePayLoan}
                                            className="px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div >
                        )
                    }
                </>
            }
        </>
    );
}

// TODO: Make expired loans
export function Borrowing() {
    const { address } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    const usdtBalance = getTrustedTokenBalance(address);
    const loanIds = getBorrowerLoanIds(address);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Wallet className="w-8 h-8 text-lime-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Borrower panel</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Borrow usdtBalance={usdtBalance} />
                    <BorrowerInfo usdtBalance={usdtBalance} ethBalance={ethBalance} address={address} />
                </div>
            </div>

            <Loans loanIds={loanIds} />
        </div >
    );
}
