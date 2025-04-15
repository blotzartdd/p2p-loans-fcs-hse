import { useEffect, useState } from 'react';

const WALLETS: Record<string, { flag: string }> = {
    metamask: {
        flag: 'isMetaMask',
    },
    trustWallet: {
        flag: 'isTrust',
    },
};

const useIsWalletInstalled = ({ wallet, flag }: { wallet?: string; flag?: string }) => {
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
            return;
        }

        if (flag) {
            setIsInstalled(window.ethereum[flag]);
            return;
        }

        if (wallet && WALLETS[wallet]) {
            const { flag: walletFlag } = WALLETS[wallet];
            setIsInstalled(window.ethereum[walletFlag]);
        }
    }, [wallet, flag]);

    return isInstalled;
};

export default useIsWalletInstalled;
