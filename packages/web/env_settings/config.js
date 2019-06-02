window.config = {
  dexConfig: {
    network: 'kovan',
    portalAddr: '0x2c1a328ee62842c034eb05d354219210c21b7c04',
    provider: 'https://kovan.infura.io/v3/3803e04900184c138c3aaa21e2689599'
  },
  network: '42',
  minEthInWallet: 0.05,
  takerFeeRate: '0.001',
  orderExpiration: 31536000,
  takerFeeRecipient: '0x0E888E0b5B0F19400538338bCAc0AE0fBEF17c03',
  dexOrderbook: {
    url: "https://kovan-ob.nexex.info"
    // url: 'http://localhost:3001'
  },
  backTrackBlocks: 100000,
  syncBatchBlocks: 1000,
  cachedEvents: 100
};
