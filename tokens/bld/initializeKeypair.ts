import * as web3 from "@solana/web3.js"
import * as fs from "fs"
import dotenv from "dotenv"
dotenv.config()

export async function initializeKeypair(
    connection: web3.Connection
): Promise<web3.Keypair> {
    if (!process.env.PRIVATE_KEY) {
        console.log("Creating .env file")
        const signer = web3.Keypair.generate()
        fs.writeFileSync(".env", `PRIVATE_KEY=${signer.secretKey}`)
        fs.writeFileSync("private-key.json", `[${signer.secretKey.toString()}]`)
        await airdropSolIfNeeded(signer, connection)

        return signer
    }

    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret)
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
    await airdropSolIfNeeded(keypairFromSecretKey, connection)
    return keypairFromSecretKey
}

async function airdropSolIfNeeded(
    signer: web3.Keypair,
    connection: web3.Connection
) {
    console.log("Airdropping 2 SOL...")
    const signature = await connection.requestAirdrop(
        signer.publicKey,
        2 * web3.LAMPORTS_PER_SOL
    )
    
    const balance = await connection.getBalance(signer.publicKey)
    console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL)
    await connection.confirmTransaction(signature)
}
