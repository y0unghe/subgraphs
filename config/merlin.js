const NATIVE_ADDRESS = '0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA'

module.exports = {
    network: 'merlin',
    legacy: {
        factory: {
            address: '0x872d9bD6E2d52A8494EDF8E534B3564e2Bc80A99',
            initCodeHash: '0x4e4a3b1a2e5eaf62abdf1c95ac3bb89267be2d46e2c22ec3b6a965653b048a6e',
            startBlock: 5000338,
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
            address: '0x872d9bD6E2d52A8494EDF8E534B3564e2Bc80A99',
            initCodeHash: '0x4e4a3b1a2e5eaf62abdf1c95ac3bb89267be2d46e2c22ec3b6a965653b048a6e',
            startBlock: 5000338,
        }
    },
}
