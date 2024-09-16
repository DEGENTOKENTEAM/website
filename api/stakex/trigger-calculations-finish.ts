import { Handler } from 'aws-lambda'
import { StakeXProtocolsRepository } from '../services/protocols'

export const handler: Handler = async (event, _, callback) => {
    const { chainId, protocol, blockNumberAPUpdate, blockNumberStakesUpdate } =
        event.responsePayload

    const response = await calculationsFinish(
        chainId,
        protocol,
        blockNumberAPUpdate,
        blockNumberStakesUpdate
    )

    return callback(
        response.status == 'error' ? response.data : null,
        response.status == 'success' ? response.data : null
    )
}

export const calculationsFinish = async (
    chainId: number,
    protocol: string,
    blockNumberAPUpdate: number | null,
    blockNumberStakesUpdate: number | null
): Promise<{ status: 'success' | 'error'; data: any }> => {
    let data: any = {}
    if (blockNumberAPUpdate) data = { ...data, blockNumberAPUpdate }
    if (blockNumberStakesUpdate) data = { ...data, blockNumberStakesUpdate }

    // atomic update
    const dataKeys = Object.keys(data)

    if (!dataKeys.length) return { status: 'success', data: true }

    const protocolsRepo = new StakeXProtocolsRepository()
    try {
        const update = await protocolsRepo.update({
            chainId,
            protocol,
            ...data,
        })
        return { status: 'success', data: update }
    } catch (e) {
        return { status: 'error', data: (e as Error).message }
    }
}
