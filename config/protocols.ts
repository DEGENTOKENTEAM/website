import { Address } from 'viem'
import {
    avalanche,
    avalancheFuji,
    localhost,
    mainnet,
    polygon,
    arbitrum,
    bsc,
    optimism,
    base,
} from 'viem/chains'

type ProtocolConfig = {
    deployer: Address
    nativeWrapper: Address
    stakex: {
        genesis: Address
        init: Address
    }
}

type ProtocolConfigs = {
    [key: number]: ProtocolConfig
}

const mainnets: ProtocolConfigs = {
    [avalanche.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x2268C6e54DC06425a09e584b36A67691d071a66D',
        },
    },
    [mainnet.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x380553C3b6053434519DAf1d2369a6604BC539ab',
        },
    },
    [bsc.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x2eC519eeF9604C7495cdAaF73B213478552d74e5',
        },
    },
    [arbitrum.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x2eC519eeF9604C7495cdAaF73B213478552d74e5',
        },
    },
    [polygon.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x2eC519eeF9604C7495cdAaF73B213478552d74e5',
        },
    },
    [optimism.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
        },
    },
    [base.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
        },
    },
}
const testnets: ProtocolConfigs = {
    [avalancheFuji.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
        },
    },
}
const localforks: ProtocolConfigs = {
    [localhost.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
        },
    },
}

const configs: ProtocolConfigs = {
    ...mainnets,
    // ...testnets,
    // ...localforks,
}

export default configs
