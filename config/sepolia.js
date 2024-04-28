const NATIVE_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'

module.exports = {
    network: 'sepolia',
    legacy: {
        factory: {
            address: '0x8Dc177f67b262Fb7A790Fb8C9791b7dbFB21ece4',
            initCodeHash: '0x0f5678c221bcbb7464c24823aaac19c956f5b2633cfe168299ea0a687da9b910',
            startBlock: 5788203,
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
            address: '0x8Dc177f67b262Fb7A790Fb8C9791b7dbFB21ece4',
            initCodeHash: '0x0f5678c221bcbb7464c24823aaac19c956f5b2633cfe168299ea0a687da9b910',
            startBlock: 5788203,
        }
    },
}
