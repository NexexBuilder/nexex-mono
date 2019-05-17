export enum THEME {
    DARK = 'bp3-dark',
    BP3_DARK = 'bp3-dark'
}

export enum PLUGIN_ACCESS {
    NONE = 'none',
    FULL = 'full',
    LOCKED = 'locked'
}

export enum AmountUnit {
    WEI = 'wei',
    ETHER = 'ether'
}

// export enum OrderSide {
//     BUY = 'buy',
//     SELL = 'sell'
// }

export enum TransactionStatus {
    PENDING = 'pending',
    RECEIPT = 'receipt',
    CONFIRMATION = 'confirmation',
    ERROR = 'error'
}

export default {
    TOKEN_ALLOWANCE_THRESHOLD:
        '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
};
