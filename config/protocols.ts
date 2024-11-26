import { Address, zeroAddress } from 'viem'
import {
    arbitrum,
    avalanche,
    avalancheFuji,
    base,
    bsc,
    localhost,
    mainnet,
    polygon,
    polygonAmoy,
} from 'viem/chains'

type ProtocolConfig = {
    deployer: Address
    nativeWrapper: Address
    stakex: {
        genesis: Address
        init: Address
        init_v_1_3_0: Address
    }
    upgrader: Address
}

type ProtocolConfigs = {
    [key: number]: ProtocolConfig
}

const mainnets: ProtocolConfigs = {
    [avalanche.id]: {
        deployer: '0xCEF87204D51632A0f1212D26F507c99376D199A1',
        // deployer: '0x2C83471eCa78cafB977Ee2759f00Dd04905F3883',
        nativeWrapper: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x2268C6e54DC06425a09e584b36A67691d071a66D',
            init_v_1_3_0: '0x33eB57FBA21a5f646eC0D5FAB045C60C58DaDA58', // TODO update with upgrader address
        },
        upgrader: '0x4BeB5ceBDD9afE244Ebec7df49Bb882431BcF4e7',
    },
    // [mainnet.id]: {
    //     deployer: '0x6C049Bd2EBdCE571245EA61c41d78DC34a60D3b5',
    //     nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //     stakex: {
    //         genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
    //         init: '0x380553C3b6053434519DAf1d2369a6604BC539ab',
    //         init_v_1_3_0: zeroAddress, // TODO update with upgrader address
    //     },
    //     upgrader: zeroAddress,
    // },
    [bsc.id]: {
        deployer: '0x6a6D338Af79e35CD7D5919F029705B7a33bBd67d',
        nativeWrapper: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x2eC519eeF9604C7495cdAaF73B213478552d74e5',
            init_v_1_3_0: '0x658800b2e207241C579d1b0347f3C49B2EEb7Da6', // TODO update with upgrader address
        },
        upgrader: zeroAddress,
    },
    [arbitrum.id]: {
        deployer: '0x97836fCc3C291320bb8eeB02398845a5733D255B',
        nativeWrapper: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x2eC519eeF9604C7495cdAaF73B213478552d74e5',
            init_v_1_3_0: '0x547982028d3044De2c7e25FB20f11CF642e006E7', // TODO update with upgrader address
        },
        upgrader: zeroAddress,
    },
    [polygon.id]: {
        deployer: '0x7921afd2d52A66AA19415BFe389745e042C00e26',
        nativeWrapper: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x2eC519eeF9604C7495cdAaF73B213478552d74e5',
            init_v_1_3_0: '0x547982028d3044De2c7e25FB20f11CF642e006E7', // TODO update with upgrader address
        },
        upgrader: zeroAddress,
    },
    [polygonAmoy.id]: {
        deployer: '0xe6450dB1226A2bdb8432E129a68E9ed18f4561AE',
        nativeWrapper: '0xd50EE21FB0279E00F8C8fCAEc8269a1930C9757c',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x51e48670098173025C477D9AA3f0efF7BF9f7812',
            init_v_1_3_0: zeroAddress, // TODO update with upgrader address
        },
        upgrader: zeroAddress,
    },
    // [optimism.id]: {
    //     deployer: '0xbE0EE98EBA0EcE437829cDe232209ea6361626cF',
    //     nativeWrapper: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //     stakex: {
    //         genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
    //         init: '0x2eC519eeF9604C7495cdAaF73B213478552d74e5',
    //     },
    // },
    [base.id]: {
        deployer: '0x25041970C1dE80C236A3F79EF43c17e0E680dF36',
        nativeWrapper: '0x4200000000000000000000000000000000000006',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0x2eC519eeF9604C7495cdAaF73B213478552d74e5',
            init_v_1_3_0: '0x8932CAe974C0B1dbE9D4bd61Fa23d281C2d841a2',
        },
        upgrader: zeroAddress,
    },
}
const testnets: ProtocolConfigs = {
    [avalancheFuji.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
            init_v_1_3_0: zeroAddress,
        },
        upgrader: zeroAddress,
    },
}
const localforks: ProtocolConfigs = {
    [localhost.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
        nativeWrapper: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        stakex: {
            genesis: '0x00000000004545cB8440FDD6095a97DEBd1F3814',
            init: '0xb56C12Ea1FEDD069AaFa7723195E584521C91777',
            init_v_1_3_0: zeroAddress,
        },
        upgrader: zeroAddress,
    },
}

const configs: ProtocolConfigs = {
    ...mainnets,
    // ...testnets,
    // ...localforks,
}

export default configs
