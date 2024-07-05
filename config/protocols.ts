import { Address } from 'viem'
import { avalanche, avalancheFuji, localhost } from 'viem/chains'

type ProtocolConfig = {
    deployer: Address
}

type ProtocolConfigs = {
    [key: number]: ProtocolConfig
}

const mainnets: ProtocolConfigs = {
    [avalanche.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
    },
}
const testnets: ProtocolConfigs = {
    [avalancheFuji.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
    },
}
const localforks: ProtocolConfigs = {
    [localhost.id]: {
        deployer: '0xb1BDd4D048108642927CCAEB59cDf2e5c3141eF2',
    },
}

const configs: ProtocolConfigs = {
    ...mainnets,
    // ...testnets,
    // ...localforks,
}

export default configs
