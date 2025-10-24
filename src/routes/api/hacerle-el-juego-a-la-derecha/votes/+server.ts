import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { MongoClient, ObjectId } from 'mongodb';
import { MONGO_URI_JUEGO_DERECHA, MONGO_DB_JUEGO_DERECHA } from '$env/static/private';
import type { Vote, CastVote } from '../../../articulo/hacerle-el-juego-a-la-derecha/types';

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

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { ballot_id } = await request.json();
		if (!ballot_id) {
			return json({ error: 'ballot_id is required' }, { status: 400 });
		}

		const objectId = new ObjectId(ballot_id);

		const client = await clientPromise;
		const db = client.db(MONGO_DB_JUEGO_DERECHA);
		const collection = db.collection('votes');

		const rawVotes = await collection.find({ 'ballot.$id': objectId }).toArray();
		if (!rawVotes.length) {
			return json({ error: 'No votes found for given ballot id' }, { status: 404 });
		}

		const parsedVotes: Vote[] = rawVotes.map((v) => ({
			ballot_id: ballot_id,
			cast_vote: v.cast_vote as CastVote,
			legislator_name: v.legislator.full_name,
            legislator_photo: v.legislator.photo,
		}));
		return json(parsedVotes);
	} catch (err) {
		console.error('Error fetching votes:', err);
		return json({ error: 'Failed to fetch votes' }, { status: 500 });
	}
};
