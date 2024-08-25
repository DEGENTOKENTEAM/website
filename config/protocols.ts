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
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
        },
    },
    [mainnet.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
        },
    },
    [bsc.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
        },
    },
    [arbitrum.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
        },
    },
    [polygon.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
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
