window.config = {
  dexConfig: {
    network: '{{network}}',
    portalAddr: '0x2c1a328ee62842c034eb05d354219210c21b7c04'
  },
  minEthInWallet: 0.05,
  takerFeeRate: '0.001',
  orderExpiration: 31536000,
  takerFeeRecipient: '0x0E888E0b5B0F19400538338bCAc0AE0fBEF17c03',
  dexOrderbook: {
    url: '{{endpoint}}'
  },
  backTrackBlocks: 100000,
  syncBatchBlocks: 1000,
  cachedEvents: 100
};
