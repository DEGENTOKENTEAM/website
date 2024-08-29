import PinataSDK from '@pinata/sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { fileTypeFromBuffer } from 'file-type'
import sizeOf from 'image-size'
import { Readable } from 'stream'
import { Address, createPublicClient, http } from 'viem'
import { getChainById } from '../../../../shared/supportedChains'
import { DynamoDBHelper } from '../../../helpers/ddb/dynamodb'
import { createReturn } from '../../../helpers/return'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    if (!event.body)
        return createReturn(500, JSON.stringify({ message: 'NO_BODY' }))

    const { protocol, chainId, image, styles, projectName, challenge, sig } =
        JSON.parse(event.body) as {
            protocol: Address
            chainId: number
            image: string
            styles: string
            projectName: string
            challenge: string
            sig: Address
        }

    if (
        !protocol ||
        !chainId ||
        !Boolean(image || styles) ||
        !challenge ||
        !sig
    )
        return createReturn(400, JSON.stringify({ message: 'DATA_MISSING' }))

    const chain = getChainById(Number(chainId))

    if (!chain)
        return createReturn(
            400,
            JSON.stringify({ message: 'UNSUPPORTED_CHAIN' })
        )

    const client = createPublicClient({
        chain,
        transport: http(),
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

    const pinata = new PinataSDK({
        pinataJWTKey: `${process.env.PINATA_API_KEY}`,
    })

    const fb = Buffer.from(image, 'base64')
    const readable = new Readable()
    readable._read = () => {} // _read is required but you can noop it
    readable.push(fb)
    readable.push(null)

    const ftype = await fileTypeFromBuffer(fb)

    if (!ftype)
        return createReturn(400, JSON.stringify({ message: 'NO_FILETYPE' }))

    if (!['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ftype.ext))
        return createReturn(
            400,
            JSON.stringify({ message: 'INVALID_FILETYPE' })
        )

    const imageDimensions = sizeOf(fb)

    if (!imageDimensions)
        return createReturn(
            400,
            JSON.stringify({ message: 'INVALID_FILETYPE' })
        )

    if (imageDimensions.width! > 600)
        return createReturn(400, JSON.stringify({ message: 'INVALID_WIDTH' }))

    if (imageDimensions.width! !== imageDimensions.height!)
        return createReturn(
            400,
            JSON.stringify({ message: 'INVALID_ASPECT_RATIO' })
        )

    const db = new DynamoDBHelper({ region: 'eu-west-1' })

    const existingItem = await db.query({
        TableName: process.env.DB_TABLE_NAME_STAKEX_CUSTOMIZATION,
        KeyConditionExpression: `#CustomizationKey = :CustomizationKey`,
        ExpressionAttributeNames: {
            [`#CustomizationKey`]: `CustomizationKey`,
        },
        ExpressionAttributeValues: {
            [`:CustomizationKey`]: protocol,
        },
        ConsistentRead: true,
    })

    let logoIpfsNew: string
    ;({ IpfsHash: logoIpfsNew } = await pinata.pinFileToIPFS(readable, {
        pinataMetadata: { name: `${protocol}/logo.${ftype.ext}` },
    }))

    let stylesIpfsNew: string
    ;({ IpfsHash: stylesIpfsNew } = await pinata.pinJSONToIPFS(styles, {
        pinataMetadata: { name: `${protocol}/styles` },
    }))

    // store protocol address and ipfs cid
    await db.batchWrite({
        RequestItems: {
            [process.env.DB_TABLE_NAME_STAKEX_CUSTOMIZATION!]: [
                {
                    PutRequest: {
                        Item: {
                            ...(existingItem.Items?.[0] || {}), // use data of existing item
                            CustomizationKey: protocol,
                            projectName,
                            logoIpfsNew,
                            stylesIpfsNew,
                        },
                    },
                },
            ],
        },
    })

    return createReturn(
        200,
        JSON.stringify({
            message: 'SUCCESSFULLY_STORED',
            data: { projectName, logoIpfsNew, stylesIpfsNew },
        })
    )
}
