// +server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { MongoClient, ObjectId } from 'mongodb';
import { MONGO_URI_JUEGO_DERECHA, MONGO_DB_JUEGO_DERECHA } from '$env/static/private';
import type { Ballot } from '../../../articulo/hacerle-el-juego-a-la-derecha/types';

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
		const { ids } = await request.json();
        if (!Array.isArray(ids) || ids.length === 0) {
			return json({ error: 'ObjectIds list expected' }, { status: 400 });
		}

        const objectIds = ids
			.map((id) => {
				try {
					return new ObjectId(id);
				} catch {
					return null;
				}
			})
			.filter((id): id is ObjectId => id !== null);

		if (objectIds.length === 0) {
			return json({ error: 'None of the ObjectIds is valid' }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db(MONGO_DB_JUEGO_DERECHA);
		const collection = db.collection('ballots');

		const ballots = await collection.find({ _id: { $in: objectIds } }).toArray();
        if (!ballots.length) return json({ error: 'No ballots found' }, { status: 404 });

        const parsedBallots: Ballot[] = ballots.map((b) => ({
            _id: b._id.toString(),
            title: b.title,
            date: new Date(b.date),
            type: b.type,
            result: b.result,
            period: b.period,
            meeting: b.meeting,
            record: b.record,
            condition: b.condition,
            totals: {
                afirmativo: b.totals.afirmativo,
                negativo: b.totals.negativo,
                abstencion: b.totals['abstención'],
                sin_votar: b.totals['sin votar'],
                ausente: b.totals.ausente
            },
            details_link: b.details_link
        }));

        return json(parsedBallots);
	} catch (err) {
		console.error('Error fetching ballots:', err);
		return json({ error: 'Failed to fetch ballots' }, { status: 500 });
	}
};
