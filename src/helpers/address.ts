export const visualAddress = (address: string, pad = 4) => {
    return `${address.substring(0, pad + 2)}...${address.substring(
        address.length - pad
    )}`
}
