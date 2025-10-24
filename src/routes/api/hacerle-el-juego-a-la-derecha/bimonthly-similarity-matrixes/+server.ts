// +server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGO_URI_JUEGO_DERECHA, MONGO_DB_JUEGO_DERECHA } from '$env/static/private';
import type { BimonthlySimilarityMatrix } from '../../../articulo/hacerle-el-juego-a-la-derecha/types';

declare global {
	var _mongoClientPromiseJuegoDerecha: Promise<MongoClient> | undefined;
}

if (!MONGO_URI_JUEGO_DERECHA) throw new Error('MONGO_URI_JUEGO_DERECHA missing');

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!globalThis._mongoClientPromiseJuegoDerecha) {
	client = new MongoClient(MONGO_URI_JUEGO_DERECHA);
	globalThis._mongoClientPromiseJuegoDerecha = client.connect();
}
clientPromise = globalThis._mongoClientPromiseJuegoDerecha;

export const GET: RequestHandler = async () => {
	try {
		const client = await clientPromise;
		const db = client.db(MONGO_DB_JUEGO_DERECHA);
		const collection = db.collection<BimonthlySimilarityMatrix>('bimonthly_similarity_matrixes');

		const matrices = await collection.find({}).sort({ from_date: 1 }).toArray();
		if (!matrices.length) return json({ error: 'No matrices found' }, { status: 404 });

		return json(matrices);
	} catch (err) {
		console.error('Error fetching matrix:', err);
		return json({ error: 'Failed to fetch matrix' }, { status: 500 });
	}
};
