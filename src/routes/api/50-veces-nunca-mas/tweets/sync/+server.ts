import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGO_URI, MONGO_DB, X_BEARER_TOKEN, X_USER_ID_H_DE_LA_MEMORIA } from '$env/static/private';

const client = new MongoClient(MONGO_URI);

async function fetchTweets(sinceId?: string) {
  let allTweets: any[] = [];
  let paginationToken: string | null = null;

  do {
    const url = new URL(`https://api.x.com/2/users/${X_USER_ID_H_DE_LA_MEMORIA}/tweets`);

    url.searchParams.set('max_results', '100');
    url.searchParams.set('tweet.fields', 'created_at');

    if (sinceId) {
      url.searchParams.set('since_id', sinceId);
    }

    if (paginationToken) {
      url.searchParams.set('pagination_token', paginationToken);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${X_BEARER_TOKEN}`
      }
    });

    const json = await res.json();

    const tweets = json.data ?? [];
    allTweets.push(...tweets);

    // si no hay más resultados, cortar
    paginationToken = json.meta?.next_token ?? null;

  } while (paginationToken);

  return allTweets;
}

export async function GET() {
  try {
    await client.connect();
    const db = client.db(MONGO_DB);
    const collection = db.collection('tweets');
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ created_at: -1 });

    const lastTweet = await collection
        .find({})
        .sort({ created_at: -1 })
        .limit(1)
        .toArray();

    const sinceId = lastTweet[0]?.id;

    const tweets = await fetchTweets(sinceId);

    // upsert por id
    const ops = tweets.map((t: any) => ({
      updateOne: {
        filter: { id: t.id },
        update: {
          $set: {
            id: t.id,
            created_at: new Date(t.created_at)
          }
        },
        upsert: true
      }
    }));

    if (ops.length > 0) {
      await collection.bulkWrite(ops);
    }

    return json({ inserted: ops.length, sinceId });

  } catch (e) {
    console.error(e);
    return json({ error: 'sync failed' }, { status: 500 });
  } finally {
    await client.close();
  }
}