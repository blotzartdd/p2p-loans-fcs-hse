import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { LogOut } from 'lucide-react';
import useIsWalletInstalled from './checkWalletInstalled';

export function WalletConnect() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    const isWalletInstalled = useIsWalletInstalled({ wallet: 'metamask' }) || useIsWalletInstalled({ flag: 'isTrust' });


    if (!isWalletInstalled) {
        return (
            <div className="flex items-center gap-4">
                <div
                    className="flex text-sm items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 duration-200 transition-colors"
                >
                    You should install MetaMask or Trust Wallet to use this app.
                </div>
            </div>
        );
    }

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-gray-600">
                    {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
                <button
                    onClick={() => disconnect()}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 duration-200 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                </button>
            </div>
        );
    }


    return (
        <button
            onClick={() => connect({ connector: injected() })}
            className="flex items-center gap-2 px-4 py-2 hover:text-lime-400 duration-200 text-gray-800 rounded-lg transition-colors"
        >
            Connect Wallet
        </button>
    );
}
