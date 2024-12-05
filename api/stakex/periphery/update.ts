import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { fileTypeFromBuffer } from 'file-type'
import sizeOf from 'image-size'
import { omit } from 'lodash'
import fetch from 'node-fetch'
import { PinataSDK } from 'pinata-web3'
import { Address, createPublicClient, http } from 'viem'
import {
    StakeXPeripheryDTO,
    StakeXPeripheryRepository,
    StakeXPeripheryResponse,
} from '../../services/periphery'
import { getChainById } from './../../../shared/supportedChains'
import { createReturn } from './../../helpers/return'

export type IpfsDataStorageType = {
    projectName: string
    heroBanner: string
    heroBannerCID: string
    projectLogo: string
    projectLogoCID: string
}

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    if (!event.body)
        return createReturn(500, JSON.stringify({ message: 'NO_BODY' }))

    ///
    /// check sent data
    ///
    const { protocol, chainId, data, challenge, sig } = JSON.parse(event.body)

    if (!protocol || !chainId || !Boolean(data) || !challenge || !sig)
        return createReturn(400, JSON.stringify({ message: 'DATA_MISSING' }))

    if (!data.heroBanner && !data.projectLogo && !data.projectName)
        return createReturn(
            400,
            JSON.stringify({ message: 'NO_UPDATES_AVAILABLE' })
        )

    ///
    /// validate chain support
    ///
    const chain = getChainById(Number(chainId))
    if (!chain)
        return createReturn(
            400,
            JSON.stringify({ message: 'UNSUPPORTED_CHAIN' })
        )

    ///
    /// validate signature
    ///
    const client = createPublicClient({
        chain,
        transport: http(undefined, {
            fetchOptions: {
                headers: {
                    'Origin': 'https://dgnx.finance',
                },
            },
        }),
    })

    let owner: Address
    try {
        owner = await client.readContract({
            address: protocol,
            abi: [
                {
                    inputs: [],
                    name: 'contractOwner',
                    outputs: [
                        {
                            internalType: 'address',
                            name: '_owner',
                            type: 'address',
                        },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                },
            ],
            functionName: 'contractOwner',
        })
    } catch (e) {
        return createReturn(
            403,
            JSON.stringify({ message: 'INVALID_PROTOCOL' })
        )
    }

    const authorized = await client.verifySiweMessage({
        message: challenge,
        signature: sig,
        address: owner,
    })

    if (!authorized)
        return createReturn(403, JSON.stringify({ message: 'INVALID_OWNER' }))

    ///
    /// init pinata
    ///
    const pinata = new PinataSDK({
        pinataJwt: `${process.env.PINATA_API_KEY}`,
        pinataGateway: `${process.env.PINATA_GATEWAY}`,
    })

    let dataStorageNew: IpfsDataStorageType = {
        projectName: '',
        heroBanner: '',
        heroBannerCID: '',
        projectLogo: '',
        projectLogoCID: '',
    }

    let dataStorageOld: IpfsDataStorageType = {
        projectName: '',
        heroBanner: '',
        heroBannerCID: '',
        projectLogo: '',
        projectLogoCID: '',
    }

    const peripheryRepository = new StakeXPeripheryRepository()

    let manifestInfo: Partial<StakeXPeripheryResponse> | null =
        await peripheryRepository.read(chain.id, protocol)

    // load available data from ipfs
    if (!manifestInfo)
        manifestInfo = {
            protocol,
            chainId,
        }
    // load existing dataStorage
    else if (manifestInfo.manifestCID)
        dataStorageOld = (await (
            await fetch(`https://ipfs.io/ipfs/${manifestInfo.manifestCID}`)
        ).json()) as IpfsDataStorageType

    let unpins: string[] = []
    let errorHero = false
    let errorLogo = false
    let errorManifest = false

    ///
    /// add name to store
    ///
    if (data.projectName) dataStorageNew.projectName = data.projectName

    ///
    /// add header banner image to store
    ///
    if (data.heroBanner) {
        const fileBuffer = Buffer.from(data.heroBanner, 'base64')
        const ftype = await fileTypeFromBuffer(fileBuffer)

        if (!ftype)
            return createReturn(400, JSON.stringify({ message: 'NO_FILETYPE' }))

        if (!['gif', 'png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ftype.ext))
            return createReturn(
                400,
                JSON.stringify({ message: 'INVALID_FILETYPE' })
            )

        const imageDimensions = sizeOf(fileBuffer)

        if (!imageDimensions)
            return createReturn(
                400,
                JSON.stringify({ message: 'INVALID_FILE_DIMENSIONS' })
            )

        try {
            const { IpfsHash } = await pinata.upload
                .base64(data.heroBanner)
                .addMetadata({
                    keyValues: {
                        protocol,
                        chainId,
                    },
                    name: `heroBanner.${ftype.ext}`,
                })

            dataStorageNew.heroBannerCID = IpfsHash
            dataStorageNew.heroBanner = `https://ipfs.io/ipfs/${IpfsHash}`
        } catch (e) {
            console.error(e)

            errorHero = true
        }
    }

    ///
    /// add logo image to store
    ///
    if (data.projectLogo) {
        const fileBuffer = Buffer.from(data.projectLogo, 'base64')
        const ftype = await fileTypeFromBuffer(fileBuffer)

        if (!ftype)
            return createReturn(400, JSON.stringify({ message: 'NO_FILETYPE' }))

        if (!['gif', 'png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ftype.ext))
            return createReturn(
                400,
                JSON.stringify({ message: 'INVALID_FILETYPE' })
            )

        const imageDimensions = sizeOf(fileBuffer)

        if (!imageDimensions)
            return createReturn(
                400,
                JSON.stringify({ message: 'INVALID_FILE_DIMENSIONS' })
            )

        if (imageDimensions.width! !== imageDimensions.height!)
            return createReturn(
                400,
                JSON.stringify({ message: 'INVALID_ASPECT_RATIO' })
            )

        try {
            const { IpfsHash } = await pinata.upload
                .base64(data.projectLogo)
                .addMetadata({
                    keyValues: {
                        protocol,
                        chainId,
                    },
                    name: `projectLogo.${ftype.ext}`,
                })

            dataStorageNew.projectLogoCID = IpfsHash
            dataStorageNew.projectLogo = `https://ipfs.io/ipfs/${IpfsHash}`
        } catch (e) {
            console.error(e)

            errorLogo = true

            // remove hero banner if it was uploaded
            if (dataStorageNew.heroBannerCID)
                unpins.push(dataStorageNew.heroBannerCID)
        }
    }

    ///
    /// add custom styles to store
    ///
    // TODO when more customization is made, start to add this

    try {
        const { IpfsHash } = await pinata.upload
            .json({
                projectName: Boolean(dataStorageNew.projectName)
                    ? dataStorageNew.projectName
                    : dataStorageOld.projectName,
                projectLogoCID: Boolean(dataStorageNew.projectLogoCID)
                    ? dataStorageNew.projectLogoCID
                    : dataStorageOld.projectLogoCID,
                projectLogo: Boolean(dataStorageNew.projectLogo)
                    ? dataStorageNew.projectLogo
                    : dataStorageOld.projectLogo,
                heroBannerCID: Boolean(dataStorageNew.heroBannerCID)
                    ? dataStorageNew.heroBannerCID
                    : dataStorageOld.heroBannerCID,
                heroBanner: Boolean(dataStorageNew.heroBanner)
                    ? dataStorageNew.heroBanner
                    : dataStorageOld.heroBanner,
            })
            .addMetadata({
                keyValues: {
                    protocol,
                    chainId,
                },
                name: `manifest.json`,
            })

        manifestInfo.manifestCIDNext = IpfsHash
    } catch (e) {
        console.error('1', e)
        errorManifest = true

        unpins = []

        if (dataStorageNew.heroBannerCID)
            unpins.push(dataStorageNew.heroBannerCID)

        if (dataStorageNew.projectLogoCID)
            unpins.push(dataStorageNew.projectLogoCID)
    }

    if (unpins.length) await pinata.unpin(unpins)

    if (errorHero || errorLogo || errorManifest)
        return createReturn(
            500,
            JSON.stringify({
                message: [
                    errorHero && 'ERROR_PIN_HERO',
                    errorLogo && 'ERROR_PIN_LOGO',
                    errorManifest && 'ERROR_PIN_MANIFEST',
                ]
                    .filter((a) => a)
                    .join(','),
            })
        )

    await peripheryRepository.createBatch([
        omit(manifestInfo, ['pkey', 'skey']) as StakeXPeripheryDTO,
    ])

    return createReturn(
        200,
        JSON.stringify({
            message: 'success',
        })
    )
}
