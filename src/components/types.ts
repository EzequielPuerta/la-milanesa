export type ArticleMetadata = {
    slug: string;
    title: string;
    is_new: boolean;
    is_available: boolean;
    date: Date;
    abstract: string;
    tags: string[];
    photo: string;
    credit: string;
    alt_photo: string;
    hero_photo: string;
    hero_credit: string;
    caption: string;
};
