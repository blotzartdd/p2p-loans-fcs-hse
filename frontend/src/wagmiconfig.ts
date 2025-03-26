import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';
import { p2ploansABI } from './p2ploansConfig';

export const config = createConfig({
    chains: [sepolia],
    connectors: [
        injected(),
        metaMask(),
    ],
    transports: {
        [sepolia.id]: http(),
    },
})

// Sepolia P2P Loans Contract
export const p2ploansContractConfig = {
    address: '0xBAC6cF259D8ed91e344df4a38Cde8448bf352672',
    abi: p2ploansABI,
}
