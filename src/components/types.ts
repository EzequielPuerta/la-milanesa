export type ArticleMetadata = {
    slug: string;
    title: string;
    is_new: boolean;
    is_available: boolean;
    date: Date;
    abstract: string;
    tags: string[];
    photo: string;
    credit_tooltip: string;
    credit_link: string;
    alt_photo: string;
    hero_photo: string;
    hero_credit_tooltip: string;
    hero_credit_link: string;
};
