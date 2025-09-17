import type { Document, Collection } from "mongodb"
import { MongoClient, Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function getDb(): Promise<Db> {
  if (cachedDb && cachedClient) return cachedDb

  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB || "vehicle-tracker"
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local")

  const serverSelectionTimeoutMS = Number(process.env.MONGO_TIMEOUT_MS || 5000)
  const client = new MongoClient(uri, { serverSelectionTimeoutMS })
  await client.connect()
  const db = client.db(dbName)

  cachedClient = client
  cachedDb = db
  return db
}

export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  const db = await getDb()
  return db.collection<T>(name)
}
