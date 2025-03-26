import { useState } from 'react';
import { parseEther, formatEther } from 'ethers';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { Wallet, ShieldCheck, CircleDollarSign } from 'lucide-react';
import { trustedTokenAddress, trustedTokenABI } from '../trustedTokenConfig';

interface LoanRequest {
    id: number;
    amount: bigint;
    collateral: bigint;
    duration: number;
    apr: number;
}

function getTrustedTokenBalance(address: `0x${string}` | undefined) {
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

    return balance.valueOf() / 1000000n;
}

function Borrow() {
    const [borrowAmount, setBorrowAmount] = useState('');
    const [collateralAmount, setCollateralAmount] = useState('');
    const [duration, setDuration] = useState('');
    const ethToUsdt = 2010.42;

    return (
        <div className="bg-green-50 rounded-lg p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <CircleDollarSign className="w-5 h-5" />
                Borrow Request
            </h3>
            <div className="space-y-4">
                <input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => {
                        setBorrowAmount(e.target.value);
                        if (e.target.value) {
                            setCollateralAmount(ethToUsdt * e.target.value);
                        } else {
                            setCollateralAmount(e.target.value);
                        }
                    }}
                    placeholder="Amount to borrow (ETH)"
                    min="0"
                    className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                />
                <input
                    type="number"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    placeholder="Collateral amount (USDT)"
                    min="0"
                    disabled
                    className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Loan duration (days)"
                    min="1"
                    className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    className="w-full px-6 py-2 bg-lime-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Submit Borrow Request
                </button>
            </div>
        </div>
    );
}

export function Borrowing() {
    const { address } = useAccount();
    const balance = getTrustedTokenBalance(address);

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
                    <Borrow />

                    <div className="bg-lime-50 rounded-lg p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <ShieldCheck className="w-5 h-5" />
                            Your Collateral Balance
                        </h3>
                        <p className="text-2xl font-bold text-lime-700">
                            {balance ? balance : '---'} USDT
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
        </div>
    );
}
