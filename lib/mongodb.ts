import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Cache the connection on `global` in every environment, not just dev.
// Serverless functions reuse their module scope across warm invocations,
// so caching here means most requests reuse an already-open pooled
// connection instead of paying a fresh TLS handshake to Atlas every time.
let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect();
}
clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;
