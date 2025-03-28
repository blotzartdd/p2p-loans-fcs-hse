import { useState } from 'react';
import { parseEther, formatEther } from 'ethers';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { Coins, ArrowRightLeft, Landmark } from 'lucide-react';
import { p2ploansABI, p2ploansAddress } from '../p2ploansConfig';
import { getPool, getPoolsAmount } from './utils';

interface Pool {
    id: bigint;
    totalAmount: bigint;
    currentAmount: bigint;
    apr: number;
    isActive: boolean;
    isLoaded: boolean;
}

function Contribute({ poolId }: { poolId: bigint }) {
    const [showContributeMenu, setShowContributeMenu] = useState(false);
    const [amount, setAmount] = useState('');
    const { isPending, writeContract } = useWriteContract();

    async function contribute() {
        writeContract({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'contributeToPool',
            args: [poolId],
            value: BigInt(parseEther(amount)),
        })
    };

    async function handleContribute() {
        setShowContributeMenu(false);
        contribute();
        console.log(`Contribute amount: ${amount}`);
        setAmount('');
    };

    return (
        <>
            <button className="mt-2 px-4 py-1 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                onClick={() => setShowContributeMenu(true)}>
                Contribute
            </button>
            {isPending === true && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-600"></div>
                </div>
            )}
            {
                showContributeMenu && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <p className="text-lg font-semibold mb-4">Make a Contribution</p>
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
                                    onClick={() => setShowContributeMenu(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-lime-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleContribute}
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
    );
}

function Withdraw({ poolId }: { poolId: bigint }) {
    const [showWithdrawMenu, setShowWithdrawMenu] = useState(false);
    const [amount, setAmount] = useState('');
    const { isPending, writeContract } = useWriteContract();

    async function withdraw() {
        writeContract({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'withdrawFromPool',
            args: [poolId, BigInt(parseEther(amount))],
        })
    };

    async function handleWithdraw() {
        setShowWithdrawMenu(false);
        withdraw();
        console.log(`Withdraw amount: ${amount}`);
        setAmount('');
    };

    return (
        <>
            <button className="mt-2 px-4 py-1 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                onClick={() => setShowWithdrawMenu(true)}>
                Withdraw
            </button>
            {isPending === true && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-600"></div>
                </div>
            )}
            {
                showWithdrawMenu && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <p className="text-lg font-semibold mb-4">Make a Withdraw</p>
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
                                    onClick={() => setShowWithdrawMenu(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-lime-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWithdraw}
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
    );
}

function ClaimRewards({ poolId }: { poolId: bigint }) {
    const { isPending, writeContract } = useWriteContract();
    // TODO: Check function rewards

    async function getLenderReward() {
        writeContract({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'getLenderReward',
            args: [poolId],
        })
    };

    return (
        <>
            {isPending === true && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-600"></div>
                </div>
            )}
            <button className="mt-2 px-4 py-1 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors" onClick={getLenderReward} disabled={isPending}>
                Claim rewards
            </button>
        </>
    );
}

function PoolInterface({ poolId }: { poolId: bigint }) {
    return (
        <div className="flex space-x-3">
            <Contribute poolId={poolId} />
            <Withdraw poolId={poolId} />
            <ClaimRewards poolId={poolId} />
        </div>
    );
}

function JoinPool({ address, poolId }: { address: `0x${string}` | undefined, poolId: bigint }) {
    if (address === undefined) {
        address = `0x${''}`;
    }

    const { isPending, writeContract } = useWriteContract();
    const inPool = isInPool(address, poolId);

    async function join() {
        writeContract({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'joinPool',
            args: [poolId],
        })
    };

    return (
        <div>
            {!inPool ? (
                <button className="mt-2 px-4 py-1 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors" onClick={join} disabled={isPending}>
                    Join Pool
                </button>
            ) : (
                <div className="flex justify-center items-center">
                    {isPending ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
                    ) : (
                        <PoolInterface poolId={poolId} />
                    )}
                </div>
            )
            }
        </div >
    );
}

function CreatePool() {
    const [showCreatePoolMenu, setShowCreatePoolMenu] = useState(false);
    const [amount, setAmount] = useState('');
    const [fee, setFee] = useState('');
    const [lenders, setLenders] = useState([]);
    const { writeContract, isPending } = useWriteContract();

    async function createPool() {
        writeContract({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'createPool',
            args: [BigInt(fee), lenders],
            value: BigInt(parseEther(amount)),
        })
    };

    async function handleWithdraw() {
        setShowCreatePoolMenu(false);
        createPool();
        console.log(`Withdraw amount: ${amount}`);
        setAmount('');
    };

    return (
        <>
            <button className="mt-2 px-4 py-1 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                onClick={() => setShowCreatePoolMenu(true)}>
                Create pool
            </button>
            {isPending === true && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-600"></div>
                </div>
            )}
            {
                showCreatePoolMenu && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <p className="text-lg font-semibold mb-4">Create pool</p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Initial amount
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

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pool fee
                                </label>
                                <input
                                    type="number"
                                    id="fee"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                                    placeholder="Enter fee"
                                    min="0"
                                    autoFocus
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lenders
                                </label>
                                <input
                                    type="string"
                                    id="lenders"
                                    value={lenders}
                                    onChange={(e) => setLenders(e.target.value.split(','))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                                    placeholder="Enter lenders in format 0x..., 0x..."
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowCreatePoolMenu(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-lime-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWithdraw}
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
    );
}

function GetLenderPoolAmount({ poolId, address }: { poolId: bigint, address: `0x${string}` | undefined }) {
    if (address === undefined) {
        address = `0x${''}`;
    }

    const { data: amount, isSuccess } = useReadContract({
        address: p2ploansAddress,
        abi: p2ploansABI,
        functionName: 'lenderToPoolAmount',
        args: [address, poolId],
    });


    if (!isSuccess) {
        return (
            <p className="text-lg font-semibold">
                Your part: --- ETH
            </p>
        );
    }

    return (
        <p className="text-lg font-semibold">
            Your part: {formatEther(amount.toString())} ETH
        </p>
    );
}

function isInPool(address: `0x${string}` | undefined, poolId: bigint) {
    if (address === undefined) {
        address = `0x${''}`;
    }

    const { data: isInPool, isSuccess } = useReadContract({
        address: p2ploansAddress,
        abi: p2ploansABI,
        functionName: 'isInPool',
        args: [address, poolId],
    });

    if (isSuccess) {
        return isInPool;
    }

    return false;
}

function Pools({ address, poolsAmount }: { address: `0x${string}` | undefined, poolsAmount: bigint }) {
    const pools = [];

    for (let i = 0n; i < poolsAmount; ++i) {
        const pool = getPool(i);
        pools.push(pool);
    }

    return (<div className="grid gap-4">
        {pools.map((pool) => (
            <div
                key={pool.id}
                className="border rounded-lg p-4 hover:border-lime-500 transition-colors"
            >
                {pool.isLoaded ? (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-lg font-semibold">
                                {formatEther(pool.currentAmount)} / {formatEther(pool.totalAmount)} ETH
                            </p>
                            <GetLenderPoolAmount poolId={pool.id} address={address} />

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
                            <JoinPool address={address} poolId={pool.id} />
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
                        <span className="ml-3">Loading pool data...</span>
                    </div>
                )}
            </div>
        ))}
        <CreatePool />
    </div>
    );
}

function getLender(address: `0x${string}` | undefined) {
    if (address === undefined) {
        address = `0x${''}`;
    }

    const { data: lender, isSuccess } = useReadContract({
        address: p2ploansAddress,
        abi: p2ploansABI,
        functionName: 'lenders',
        args: [address],
    });

    if (isSuccess) {
        return { totalReward: lender[0], isActive: lender[1] };
    }

    return { totalReward: 0, isActive: false };
}

function BecomeLender({ address }: { address: `0x${string}` | undefined }) {
    const { isPending, writeContract } = useWriteContract();
    const lender = getLender(address);
    console.log(`Lender status: ${lender.isActive}`);

    async function becomeLender() {
        writeContract({
            address: p2ploansAddress,
            abi: p2ploansABI,
            functionName: 'becomeLender',
            args: [],
        })
    };

    return (
        <>
            {lender.isActive ? (
                <div className="grid md:grid-cols-2 gap-2">
                    < div className="bg-green-50 rounded-lg p-6 flex items-center text-lg font-semibold">
                        <div className="flex text-lg gap-4">
                            Your lender status: Active
                        </div>
                    </div >
                    <div className="bg-green-50 rounded-lg p-6 flex items-center text-lg font-semibold">
                        <div className="flex text-lg gap-4">
                            Your reward from pools:
                            <div className="font-bold text-lime-700">
                                {lender.totalReward} ETH
                            </div>
                        </div>
                    </div>
                </div>) : (
                <>
                    {isPending === true && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-600"></div>
                        </div>
                    )}
                    <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <ArrowRightLeft className="w-5 h-5" />
                            Join community
                        </h3 >
                        <div className="flex gap-4">
                            <button
                                className="px-6 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                                onClick={becomeLender}
                            >
                                Become Lender
                            </button>
                        </div>
                    </div >
                </>
            )
            }
        </>
    );
}

export function Lending() {
    const { address } = useAccount();
    const { data: balance } = useBalance({ address });
    const poolsAmount = getPoolsAmount();

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Landmark className="w-8 h-8 text-lime-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Lender panel</h2>
                </div>

                <div className="grid md:grid-cols-1 gap-2">
                    <div className="bg-lime-50 rounded-lg p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Coins className="w-5 h-5" />
                            Your Balance
                        </h3>
                        <p className="text-2xl font-bold text-lime-700">
                            {balance ? formatEther(balance.value).slice(0, 10) : '---'} ETH
                        </p>
                    </div>

                    <BecomeLender address={address} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6">Active Lending Pools</h3>
                <Pools address={address} poolsAmount={poolsAmount} />
            </div>

        </div>
    );
}

