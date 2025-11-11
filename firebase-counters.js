import { db } from './firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';

// Nome da coleção de contadores
const COUNTERS_COLLECTION = 'counters';
// Nome do documento principal de estatísticas
const STATS_DOC_ID = 'global_stats';

/**
 * Incrementa ou decrementa um contador global de forma atômica.
 * @param {string} counterName - O nome do campo do contador (ex: 'totalItens', 'itensDoados').
 * @param {number} amount - O valor a ser incrementado ou decrementado (positivo ou negativo).
 */
export async function updateGlobalCounter(counterName, amount) {
    const statsRef = db.collection(COUNTERS_COLLECTION).doc(STATS_DOC_ID);
    
    try {
        await statsRef.set({
            [counterName]: FieldValue.increment(amount),
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error(`Erro ao atualizar contador ${counterName}:`, error);
    }
}

/**
 * Obtém todas as estatísticas globais.
 * @returns {Promise<object>} O objeto contendo as estatísticas.
 */
export async function getGlobalStats() {
    const statsDoc = await db.collection(COUNTERS_COLLECTION).doc(STATS_DOC_ID).get();
    
    // ... (Tratamento de statsDoc.exists mantido) ...

    const data = statsDoc.data();
    
    const itensDoados = data.itensDoados || 0;
    
    // Regra de negócio: Famílias Ajudadas é 70% dos itens doados (estimativa)
    const familiasAjudadas = Math.floor(itensDoados * 0.7);

    return {
        // O total de itens é a soma dos disponíveis e doados (os outros status não contam como itens ativos)
        totalItens: (data.itensDisponiveis || 0) + itensDoados, 
        itensDoados: itensDoados,
        itensDisponiveis: data.itensDisponiveis || 0,
        totalDoadores: data.totalDoadores || 0,
        familiasAjudadas: familiasAjudadas,
        cidades: 1 // Valor fixo conforme solicitado (São Paulo)
    };
}
