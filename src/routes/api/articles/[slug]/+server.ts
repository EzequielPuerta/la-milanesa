import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGO_URI } from '$env/static/private';
import type { ArticleMetadata } from '$coretypes/articleMetadata';

if (!MONGO_URI) {
	throw new Error('MONGO_URI is not defined in environment variables');
}

const client = new MongoClient(MONGO_URI);

const get_by_slug: RequestHandler = async ({ params }) => {
	const { slug } = params;

	try {
		await client.connect();
		const db = client.db('la-milanesa');
		const collection = db.collection<ArticleMetadata>('articles-metadata');

		const article = await collection.findOne({ slug, is_available: true });

		if (!article) {
			return json({ error: 'Article not found' }, { status: 404 });
		}

		return json(article);
	} catch (error) {
		console.error('Error fetching article:', error);
		return json({ error: 'Failed to fetch article' }, { status: 500 });
	} finally {
		await client.close();
	}
};

export const GET = get_by_slug;
