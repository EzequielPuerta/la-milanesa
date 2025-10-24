export type CastVote = 'afirmativo' | 'negativo' | 'abstencion' | 'ausente'

export type Question = {
  id: number;
  title: string;
  abstract: string;
  object_id?: string;
};

export type Legislator = {
    _id: string;
    full_name: string;
    gender: string;
    birthdate: string;
    photo: string;
};

export interface Edge {
    source: string;
    target: string;
    weight: number;
};

export interface BimonthlySimilarityMatrix {
  ratios: number[][];
  sorted_legislators: Legislator[];
  from_date: Date;
  to_date: Date;
}

export interface Ballot {
    _id: string;
    title: string;
    date: Date;
    type: string;
    result: CastVote;
    period: number;
    meeting: number;
    record: number;
    condition: string;
    totals: {
        afirmativo: number;
        negativo: number;
        abstencion: number;
        sin_votar: number;
        ausente: number;
    };
    details_link: string;
}

export interface Vote {
    ballot_id: string;
    cast_vote: CastVote;
    legislator_name: string;
    legislator_photo: string;
}

export interface LegislatorMatch {
    name: string;
    matches: number;
    total: number;
    score: number;
}
