import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGO_URI } from '$env/static/private';
import type { ArticleMetadata } from '$coretypes/articleMetadata';

if (!MONGO_URI) {
	throw new Error('MONGO_URI is not defined in environment variables');
}

const client = new MongoClient(MONGO_URI);

const list_articles: RequestHandler = async () => {
	try {
		await client.connect();
		const db = client.db('la-milanesa');
		const collection = db.collection<ArticleMetadata>('articles-metadata');

		const articles = await collection
			.find({ is_available: true })
			.sort({ date: -1 })
			.toArray();

		return json(articles);
	} catch (error) {
		console.error('Error fetching articles:', error);
		return json({ error: 'Failed to fetch articles' }, { status: 500 });
	} finally {
		await client.close();
	}
};

export const GET = list_articles;
