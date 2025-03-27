import { p2ploansABI, p2ploansAddress } from '../p2ploansConfig';
import { useReadContract } from 'wagmi';

export function getPool(poolId: bigint) {
    const { data: pool, error: error, isSuccess } = useReadContract({
        address: p2ploansAddress,
        abi: p2ploansABI,
        functionName: 'pools',
        args: [poolId],
    });

    if (!isSuccess) {
        return { id: poolId, amount: 0n, apr: 0n, isActive: false, isLoaded: false };
    }

    console.log(pool);
    console.log(error);
    console.log(isSuccess);

    return { id: poolId, amount: pool[1].valueOf(), apr: pool[3].valueOf(), isActive: pool[4], isLoaded: true };
}

export function getPoolsAmount() {
    const { data: amount, isSuccess } = useReadContract({
        address: p2ploansAddress,
        abi: p2ploansABI,
        functionName: 'getPoolsAmount',
        args: [],
    });

    if (!isSuccess) {
        return 0n;
    }

    return amount.valueOf();
}
