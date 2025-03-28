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
        return { id: poolId, totalAmount: 0n, currentAmount: 0n, apr: 0n, isActive: false, isLoaded: false };
    }

    console.log(pool);
    console.log(error);
    console.log(isSuccess);

    return { id: poolId, totalAmount: pool[1].valueOf(), currentAmount: pool[2].valueOf(), apr: pool[3].valueOf(), isActive: pool[4], isLoaded: true };
}

export function getLoan(loanId: bigint) {
    const { data: loan, error: error, isSuccess } = useReadContract({
        address: p2ploansAddress,
        abi: p2ploansABI,
        functionName: 'getLoan',
        args: [loanId],
    });

    if (!isSuccess) {
        return { id: loanId, total: 0n, left: 0n, loanStart: 0n, duration: 0n, isPayed: false, isLoaded: false };
    }

    console.log(error);

    return { id: loanId, total: loan.total, left: loan.left, loanStart: loan.loanStart, duration: loan.duration, isPayed: loan.isPayed, isLoaded: true };
}

export function getBorrowerLoanIds(address: `0x${string}` | undefined) {
    if (address === undefined) {
        address = `0x${''}`;
    }

    const { data: loanIds, isSuccess } = useReadContract({
        address: p2ploansAddress,
        abi: p2ploansABI,
        functionName: 'getBorrowerLoans',
        args: [address],
    });

    if (!isSuccess) {
        return [];
    }

    return loanIds;
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

export function getHumanTime(timestamp: bigint) {
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let date = new Date(Number(timestamp) * 1000);

    let hours = "0" + date.getHours();
    let minutes = "0" + date.getMinutes();
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${hours.substr(-2)}:${minutes.substr(-2)}`;
}
