window.config = {
    dexConfig: {
        network: 'kovan',
        portalAddr: '0x2c1a328ee62842c034eb05d354219210c21b7c04',
        provider: 'https://kovan.infura.io/v3/3803e04900184c138c3aaa21e2689599'
    },
    network: '42',
    minEthInWallet: 0.05,
    // providers: ['https://kovan.infura.io/v3/3803e04900184c138c3aaa21e2689599'],
    takerFeeRate: '1000000000000000',
    orderExpiration: 31536000,
    dexOrderbook: {
        // url: "http://kovan.nexex.info"
      url: "http://localhost:3001"
    }
};
