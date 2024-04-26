const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'

module.exports = {
    network: 'b2',
    legacy: {
        factory: {
            address: '0xDb8d3e993fA1D3085E99c3c20A4f844a6c6866Df',
            initCodeHash: '0x4e4a3b1a2e5eaf62abdf1c95ac3bb89267be2d46e2c22ec3b6a965653b048a6e',
            startBlock: 95606,
        },
    },
    v2: {
        nativeAddress: NATIVE_ADDRESS,
        whitelistAddresses: [
            // IMPORTANT! Native should be included here
            NATIVE_ADDRESS
        ],
        minimumNativeLiquidity: 1,
        factory: {
            address: '0xDb8d3e993fA1D3085E99c3c20A4f844a6c6866Df',
            initCodeHash: '0x4e4a3b1a2e5eaf62abdf1c95ac3bb89267be2d46e2c22ec3b6a965653b048a6e',
            startBlock: 95606,
        }
    },
}
