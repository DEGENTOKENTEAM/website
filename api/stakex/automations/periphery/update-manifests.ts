import { Handler } from 'aws-lambda'
import { cloneDeep, omit } from 'lodash'
import fetch from 'node-fetch'
import { PinataSDK } from 'pinata-web3'
import { StakeXPeripheryRepository } from '../../../services/periphery'
import { IpfsDataStorageType } from '../../periphery/update'

export const handler: Handler = async (_, __, callback) => {
    const pinata = new PinataSDK({
        pinataJwt: `${process.env.PINATA_API_KEY}`,
        pinataGateway: `${process.env.PINATA_GATEWAY}`,
    })

    const peripheryRepository = new StakeXPeripheryRepository()
    const items = await peripheryRepository.readAllUpdated()
    for (const item of items) {
        const updatedItem = cloneDeep(item)
        if (updatedItem.manifestCIDNext) {
            let data: IpfsDataStorageType | null = null

            try {
                data = (await (
                    await fetch(
                        `https://ipfs.io/ipfs/${updatedItem.manifestCIDNext}`
                    )
                ).json()) as unknown as IpfsDataStorageType
            } catch (e) {
                console.info(
                    'Manifest missing',
                    updatedItem.chainId,
                    updatedItem.protocol
                )
            }

            if (data) {
                let update = true
                try {
                    data.projectLogo && (await fetch(data.projectLogo))
                } catch (e) {
                    console.info(
                        'Project Logo not on IPFS yet',
                        updatedItem.chainId,
                        updatedItem.protocol
                    )
                    update = false
                }

                try {
                    data.heroBanner && (await fetch(data.heroBanner))
                } catch (e) {
                    console.info(
                        'Hero Banner not on IPFS yet',
                        updatedItem.chainId,
                        updatedItem.protocol
                    )
                    update = false
                }

                if (update) {
                    const manifestOld = updatedItem.manifestCID
                    updatedItem.manifestCID = updatedItem.manifestCIDNext
                    updatedItem.manifestCIDNext = ''
                    await peripheryRepository.createBatch([
                        omit(updatedItem, ['pkey', 'skey']),
                    ])
                    if (manifestOld != updatedItem.manifestCID)
                        await pinata.unpin([manifestOld])
                }
            }
        }
    }
    callback()
}
