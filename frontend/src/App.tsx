import { useState } from 'react';
import { config } from "./wagmiconfig";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { WalletConnect } from './components/WalletConnect';
import { Borrowing } from './components/Borrowing';
import { Lending } from './components/Lending';

const queryClient = new QueryClient();

function App() {
    const [activeTab, setActiveTab] = useState("lend");

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <div className="min-h-screen bg-gradient-to-b from-green-100 to-white">
                    <nav className="bg-white shadow-md">
                        <div className="sm:px-8 lg:px-8 flex justify-between h-16">
                            <div className="flex items-center">
                                <span className="text-xl font-bold text-gray-800">
                                    BitBank
                                </span>
                            </div>

                            <div className="flex items-center space-x-10">
                                <button className="px-4 py-2 rounded-lg hover:text-lime-400 transition-colors duration-200"> Home </button>
                                <button className="px-4 py-2 rounded-lg hover:text-lime-400 transition-colors duration-200"> Swap </button>
                                <button className="px-4 py-2 rounded-lg hover:text-lime-400 transition-colors duration-200"> Dashboard </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-gray-800 transition-colors ${activeTab === 'lend'
                                        ? 'bg-lime-400'
                                        : 'hover:text-lime-400'
                                        }`}
                                    onClick={() => setActiveTab('lend')}
                                >
                                    Lend
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg  text-gray-800 transition-colors ${activeTab === 'borrow'
                                        ? 'bg-lime-400'
                                        : 'hover:text-lime-400'
                                        }`}
                                    onClick={() => setActiveTab('borrow')}
                                >
                                    Borrow
                                </button>
                                <WalletConnect />
                            </div>
                        </div>
                    </nav>

                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        {activeTab === 'lend' ? <Lending /> : <Borrowing />}
                    </main>

                </div>

                <footer className="border-t border-gray-800">
                    <div className="container mx-auto px-4 py-12">
                        <div className="text-center text-gray-400">
                            © 2025 MIT. All rights reserved.
                        </div>
                    </div>
                </footer>
            </QueryClientProvider>
        </WagmiProvider >
    );
}

export default App;
