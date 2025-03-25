
import { useState } from 'react';
import { parseEther, formatEther } from 'ethers';
import { useAccount, useBalance } from 'wagmi';
import { Wallet, ShieldCheck, CircleDollarSign } from 'lucide-react';

interface LoanRequest {
    id: number;
    amount: bigint;
    collateral: bigint;
    duration: number;
    apr: number;
}

export function Borrowing() {
    const { address } = useAccount();
    const { data: balance } = useBalance({ address });
    const [borrowAmount, setBorrowAmount] = useState('');
    const [collateral, setCollateral] = useState('');

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
                    <h2 className="text-2xl font-bold text-gray-800">Borrow Funds</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <CircleDollarSign className="w-5 h-5" />
                            Borrow Amount
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="number"
                                value={borrowAmount}
                                onChange={(e) => setBorrowAmount(e.target.value)}
                                placeholder="Amount to borrow (ETH)"
                                className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <input
                                type="number"
                                value={collateral}
                                onChange={(e) => setCollateral(e.target.value)}
                                placeholder="Collateral amount (USDT)"
                                className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                onClick={() => console.log('Borrowing', borrowAmount, 'ETH')}
                            >
                                Submit Borrow Request
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <ShieldCheck className="w-5 h-5" />
                            Your Collateral Balance
                        </h3>
                        <p className="text-2xl font-bold text-gray-700">
                            {balance ? formatEther(balance.value).slice(0, 10) : '0'} USDT
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Available for collateral
                        </p>
                    </div>
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
                                        {request.apr}% APR
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
        </div>
    );
}
