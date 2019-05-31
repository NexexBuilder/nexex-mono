
function getEtherscanSite(network: string) {
    switch (network.toLowerCase()) {
        case 'kovan':
            return 'https://kovan.etherscan.io';
        case 'mainnet':
            return 'https://etherscan.io';
        default:
            throw new Error(`unknown network ${network}`);
    }
}

export function etherscanTxLink(network: string, txHash: string) {
    return `${getEtherscanSite(network)}/tx/${txHash}`;
}
