import { useState } from 'react';
import { parseEther, formatEther } from 'ethers';
import { useAccount, useBalance } from 'wagmi';
import { Coins, ArrowRightLeft, Landmark } from 'lucide-react';

interface Pool {
    id: number;
    amount: bigint;
    apr: number;
    duration: number;
}

export function Lending() {
    const { address } = useAccount();
    const { data: balance } = useBalance({ address });
    const [amount, setAmount] = useState('');
    // const [apr, setApr] = useState('5');

    const pools: Pool[] = [
        { id: 1, amount: parseEther('10'), apr: 5, duration: 30 },
        { id: 2, amount: parseEther('20'), apr: 7, duration: 35 },
        { id: 3, amount: parseEther('50'), apr: 10, duration: 42 },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Landmark className="w-8 h-8 text-lime-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Lending Pool</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-lime-50 rounded-lg p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Coins className="w-5 h-5" />
                            Your Balance
                        </h3>
                        <p className="text-2xl font-bold text-lime-700">
                            {balance ? formatEther(balance.value).slice(0, 10) : '0'} ETH
                        </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <ArrowRightLeft className="w-5 h-5" />
                            Available to Lend
                        </h3>
                        <div className="flex gap-4">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount in ETH"
                                className="flex-1 px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-lime-500"
                            />
                            <button
                                className="px-6 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                                onClick={() => console.log('Lending', amount, 'ETH')}
                            >
                                Lend
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6">Active Lending Pools</h3>
                <div className="grid gap-4">
                    {pools.map((pool) => (
                        <div
                            key={pool.id}
                            className="border rounded-lg p-4 hover:border-lime-500 transition-colors"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold">
                                        {formatEther(pool.amount)} ETH
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Duration: {pool.duration} days
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-blue-600">
                                        {pool.apr}% APR
                                    </p>
                                    <button className="mt-2 px-4 py-1 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors">
                                        Join Pool
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

