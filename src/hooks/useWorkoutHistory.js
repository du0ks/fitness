import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

const HISTORY_KEY = 'fit_track_history';

export function useWorkoutHistory() {
    // Array of completed workout objects
    // { id, workoutId, name, date, totalTime, exerciseTime, restTime }
    const [history, setHistory] = useLocalStorage(HISTORY_KEY, []);

    const addLog = (log) => {
        const newLog = {
            ...log,
            id: uuidv4(),
            date: new Date().toISOString()
        };
        setHistory(prev => [newLog, ...prev]);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return { history, addLog, clearHistory };
}
