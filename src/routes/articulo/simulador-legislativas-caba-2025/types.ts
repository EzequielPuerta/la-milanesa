export type ElectionMetadata = {
    name: string;
    color: string;
    percentage: number;
    currentVoters?: number;
    rank?: number;
};

export type PartyMetadata = ElectionMetadata & {
    party: string;
    alias: string;
    position: string;
    url: string;
    seats: number;
};

export type PartySlider = PartyMetadata & {
    index: number;
};

export type ColumnSlider = ElectionMetadata & {
    globalIndex: number;
}

export type PartyResult = {
    party: string;
    alias: string;
    position: string;
    seats: number;
    color: string;
    originalParty?: string;
};
