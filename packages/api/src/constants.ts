const NETWORK_ID = {
    MAINNET: 1,
    ROPSTEN: 3,
    RINKEBY: 4,
    KOVAN: 42
};

export enum PortalEntry {
    Exchange,
    TransferGateway,
    TokenRegistry
}

export const constants = {
    NULL_ADDRESS: '0x0000000000000000000000000000000000000000',
    MAX_UINT_256: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    TESTRPC_NETWORK_ID: 50,
    MAX_DIGITS_IN_UNSIGNED_256_INT: 78,
    INVALID_JUMP_PATTERN: 'invalid JUMP at',
    OUT_OF_GAS_PATTERN: 'out of gas',
    INVALID_TAKER_FORMAT: 'instance.taker is not of a type(s) string',
    // UNLIMITED_ALLOWANCE_IN_BASE_UNITS: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    DEFAULT_BLOCK_POLLING_INTERVAL: 1000,
    NETWORK_ID,
    PortalEntry
};
