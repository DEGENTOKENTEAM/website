import { InvokeAsyncCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { Handler } from 'aws-lambda'
import { createPublicClient, http } from 'viem'
import { chains } from '../../../shared/supportedChains'
import { StakeXProtocolsRepository } from '../../services/protocols'

export const handler: Handler = async (_, __, callback) => {
    const { LAMBDA_APR_NAME, LAMBDA_STAKES_NAME } = process.env
    const lambdaClient = new LambdaClient()

    const protocolsRepo = new StakeXProtocolsRepository()

    const promises: Promise<any>[] = []
    const aprBatch: any[] = []
    const stakesBatch: any[] = []
    for (const chain of chains) {
        const protocols = await protocolsRepo.getAllByChainId(chain.id, 1000)

        if (protocols.count) {
            const publicClient = createPublicClient({
                chain,
                transport: http(),
            })

            const toBlock = Number(await publicClient.getBlockNumber())

            for (const item of protocols.items) {
                const {
                    chainId,
                    blockNumberAPUpdate,
                    blockNumberAPUpdateIntervall,
                    blockNumberAPPeriod,
                    protocol,
                    blockNumberEnabled,
                } = item

                if (
                    blockNumberAPPeriod &&
                    blockNumberAPUpdateIntervall &&
                    blockNumberEnabled &&
                    blockNumberEnabled > 0
                ) {
                    if (
                        toBlock -
                            (!blockNumberAPUpdate
                                ? blockNumberEnabled
                                : blockNumberAPUpdate) >
                        blockNumberAPUpdateIntervall
                    ) {
                        aprBatch.push({
                            chainId: Number(chainId),
                            protocol,
                            fromBlock: toBlock - blockNumberAPPeriod,
                            toBlock,
                        })
                    }

                    stakesBatch.push({
                        chainId: Number(chainId),
                        protocol,
                        fromBlock: blockNumberEnabled, // always start from enabled block
                    })
                }
            }
        }
    }

    if (aprBatch.length) {
        promises.push(
            lambdaClient.send(
                new InvokeAsyncCommand({
                    FunctionName: LAMBDA_APR_NAME,
                    InvokeArgs: JSON.stringify({
                        batch: aprBatch,
                    }),
                })
            )
        )
    }

    if (stakesBatch.length) {
        promises.push(
            lambdaClient.send(
                new InvokeAsyncCommand({
                    FunctionName: LAMBDA_STAKES_NAME,
                    InvokeArgs: JSON.stringify({
                        batch: stakesBatch,
                    }),
                })
            )
        )
    }

    if (promises.length)
        Promise.all(promises)
            .then((invokeResults) => {
                console.log({ invokeResults })
            })
            .catch((reason) => {
                console.log({ reason })
            })
    callback(null, true)
}
