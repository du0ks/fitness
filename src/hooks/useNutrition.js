import { useLocalStorage } from 'usehooks-ts';
import { format } from 'date-fns';

const CONFIG_KEY = 'fit_track_config';
const LOGS_KEY = 'fit_track_nutrition_logs';

export function useNutrition() {
    const [config, setConfig] = useLocalStorage(CONFIG_KEY, {
        targetCalories: 2500,
        targetProtein: 150, // grams
    });

    const [logs, setLogs] = useLocalStorage(LOGS_KEY, {});

    const todayKey = format(new Date(), 'yyyy-MM-dd');

    const todayLog = logs[todayKey] || { calories: 0, protein: 0 };

    const addEntries = (calories, protein) => {
        setLogs(prev => {
            const current = prev[todayKey] || { calories: 0, protein: 0 };
            return {
                ...prev,
                [todayKey]: {
                    calories: current.calories + Number(calories),
                    protein: current.protein + Number(protein),
                }
            };
        });
    };

    const updateTargets = (newCalories, newProtein) => {
        setConfig({
            targetCalories: Number(newCalories),
            targetProtein: Number(newProtein)
        });
    };

    return {
        todayLog,
        targets: config,
        logs, // Exposed full logs
        addEntries,
        updateTargets
    };
}
