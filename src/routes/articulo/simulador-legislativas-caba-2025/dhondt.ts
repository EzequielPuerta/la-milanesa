import type { ElectionMetadata, PartySlider, PartyResult } from './types'; 
import {
    BLANK_VOTE_NAME,
    NULL_VOTE_NAME,
    NEUTRAL_PARTY_NAME,
    NEUTRAL_COLOR,
    COLORED_DOTS_LIMIT,
} from './constants';

interface ComputeElectionParams {
    allSlidersInput: ElectionMetadata[];
    totalVoters: number;
    seatsAlreadyOccupied: PartyResult[];
}

interface ComputeElectionResult {
    allSliders: ElectionMetadata[];
    partyResults: PartyResult[];
    affirmativeVotes: number;
    availableVoters: number;
    thresholdDhondt: number;
}

export function computeElectionResults({
    allSlidersInput,
    totalVoters,
    seatsAlreadyOccupied,
}: ComputeElectionParams): ComputeElectionResult {
    let allSliders = [...allSlidersInput];

    // 0. Calculo contadores generales
    const totalPercentage = allSliders.reduce((sum, slider) => sum + slider.percentage, 0);
    const affirmativeTotalPercentage = allSliders.slice(0, -1).reduce((sum, slider) => sum + slider.percentage, 0);
    const totalVotes = Math.min(totalPercentage, 100);
    const affirmativeVotes = Math.min(affirmativeTotalPercentage, 100);
    const availableVoters = Math.round(totalVoters * (1 - totalVotes / 100));
    const thresholdDhondt = Math.round((affirmativeVotes * totalVoters / 100) * 3 / 100);

    // 1. Calcular votantes para cada slider desde percentage
    allSliders = allSliders.map(slider => ({
        ...slider,
        currentVoters: Math.round((slider.percentage / 100) * totalVoters)
    }));

    // 2. Inicializar bancas para la asignación mediante D'Hondt y filtrar sliders que superan el umbral
    allSliders = allSliders.map((slider, i) => {
        if (slider.name === BLANK_VOTE_NAME || slider.name === NULL_VOTE_NAME) {
            return slider;
        }
        return { ...slider, index: i, seats: 0 };
    });

    const validSliders: PartySlider[] = allSliders
        .filter(slider =>
            slider.name !== BLANK_VOTE_NAME &&
            slider.name !== NULL_VOTE_NAME &&
            thresholdDhondt > 0 &&
            (slider.currentVoters ?? 0) >= thresholdDhondt
        ) as unknown as PartySlider[];

    // 3. Generar cocientes de D'Hondt
    const quotients: { value: number; sliderIndex: number }[] = [];

    for (const slider of validSliders) {
        for (let i = 1; i <= COLORED_DOTS_LIMIT; i++) {
            quotients.push({
                value: (slider.currentVoters ?? 0) / i,
                sliderIndex: slider.index
            });
        }
    }

    // 4. Elegir los 30 cocientes más altos
    quotients.sort((a, b) => b.value - a.value);
    const top = quotients.slice(0, COLORED_DOTS_LIMIT);

    // 5. Contar bancas por slider
    const seatCounts = new Map<number, number>();
    for (const { sliderIndex } of top) {
        seatCounts.set(sliderIndex, (seatCounts.get(sliderIndex) || 0) + 1);
    }

    // 6. Asignar bancas
    allSliders = allSliders.map((slider, i) => {
        if (slider.name === BLANK_VOTE_NAME || slider.name === NULL_VOTE_NAME) {
            return slider;
        }
        return { ...slider, seats: seatCounts.get(i) || 0 };
    });

    let partyResults: PartyResult[];
    if (top.length === 0) {
        // 7a. Sin bancas asignadas, pintar todos puntos neutrales
        partyResults = [
            {
                party: NEUTRAL_PARTY_NAME,
                alias: NEUTRAL_PARTY_NAME,
                seats: COLORED_DOTS_LIMIT,
                position: NEUTRAL_PARTY_NAME,
                color: NEUTRAL_COLOR,
            },
            ...seatsAlreadyOccupied.map(entry => ({ ...entry })),
        ];
    } else {
        // 7b. Asignar colores según bancas
        partyResults = [
            ...allSliders
                .filter(slider =>
                    slider.name !== BLANK_VOTE_NAME &&
                    slider.name !== NULL_VOTE_NAME &&
                    slider.seats > 0
                )
                .map(slider => ({
                    party: slider.party,
                    alias: slider.alias,
                    seats: slider.seats,
                    position: slider.position,
                    color: slider.color
                })),
            ...seatsAlreadyOccupied.map(entry => ({ ...entry })),
        ];
    }

    return {
        allSliders,
        partyResults,
        affirmativeVotes,
        availableVoters,
        thresholdDhondt,
    };
}
