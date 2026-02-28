import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



async function fetchNFTsFromChain(ownerWallet) {
    return []; // TODO: implement blockchain query
}

async function fetchERC1155Slots(buyerWallet) {
  return []; // TODO: implement blockchain query
}

export async function listNfts(ownerWallet) {

    try {
        let nfts = await prisma.nft.findMany({
            where: { ownerWallet },
        });

        if (nfts.length === 0) {
            const chainNFTs = await fetchNFTsFromChain(ownerWallet);
            if (chainNFTs.length > 0) {
                await prisma.nft.createMany({ data: chainNFTs });
                nfts = chainNFTs;
            }
        }
        return nfts
    } catch (error) {
        throw Error("Erreur lors de récupération des NFTs")
    }

}



export async function listSlots(buyerWallet) {
    try {
        const orders = await prisma.order.findMany({
            where: { buyerWallet, itemType: "ERC1155" },
        });

        if (orders.length > 0) {
          return  orders;
        }

        // Otherwise fetch from chain
        const slots = await fetchERC1155Slots(buyerWallet);
        return slots;
    } catch (err) {
       throw Error("Erreur lors de récupération des NFTs")
    }
}


