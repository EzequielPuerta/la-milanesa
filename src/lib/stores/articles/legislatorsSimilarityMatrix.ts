import { writable, derived } from 'svelte/store';
import type { Legislator, Edge, BimonthlySimilarityMatrix } from '../../../routes/articulo/hacerle-el-juego-a-la-derecha/types';

export const matrices = writable<BimonthlySimilarityMatrix[]>([]);
export const threshold = writable<number>(0.75);
export const activeMatrixIndex = writable<number>(0);

export const graphData = derived(
    [matrices, activeMatrixIndex, threshold],
    ([$matrices, $activeMatrixIndex, $threshold]) => {
        if (!$matrices.length) return { nodes: [], edges: [] };

        const matrix = $matrices[$activeMatrixIndex];
        const nodes: Legislator[] = matrix.sorted_legislators.map((l) => ({
            _id: l._id,
            full_name: l.full_name === "Mercedes Fernandez" ? "Mercedes De Mendieta" : l.full_name,
            gender: l.gender,
            birthdate: l.birthdate,
            photo: l.photo
        }));

        const edges: Edge[] = [];
        const n = matrix.ratios.length;

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const weight = matrix.ratios[i][j];
                if (weight >= $threshold) {
                    edges.push({
                        source: nodes[i]._id,
                        target: nodes[j]._id,
                        weight
                    });
                }
            }
        }

        return { nodes, edges };
    }
);