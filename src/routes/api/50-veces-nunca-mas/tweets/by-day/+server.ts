import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGO_URI, MONGO_DB } from '$env/static/private';

const client = new MongoClient(MONGO_URI);

export async function GET() {
  try {
    await client.connect();
    const db = client.db(MONGO_DB);
    const collection = db.collection('tweets');

    const result = await collection.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%d/%m/%Y", date: "$created_at" }
          },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const map: Record<string, number> = {};

    result.forEach((r: any) => {
      map[r._id] = r.count;
    });

    return json(map);

  } finally {
    await client.close();
  }
}