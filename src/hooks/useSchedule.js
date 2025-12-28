import { useLocalStorage } from 'usehooks-ts';
import { isSameDay, format, parseISO, addDays, getDay, differenceInDays } from 'date-fns';

const SCHEDULE_KEY = 'fit_track_schedule';

export function useSchedule() {
    const [schedule, setSchedule] = useLocalStorage(SCHEDULE_KEY, {
        recurrences: [], // { id, workoutId, type: 'weekly'|'interval', days: [1,3], interval: 2, startDate }
        overrides: {} // { '2023-10-25': workoutId or null }
    });

    const getWorkoutForDate = (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');

        // Check overrides first
        if (schedule.overrides.hasOwnProperty(dateKey)) {
            return schedule.overrides[dateKey]; // Returns workoutId or null
        }

        // Check recurrences
        for (const rule of schedule.recurrences) {
            if (rule.type === 'weekly') {
                const dayOfWeek = getDay(date); // 0 = Sun, 1 = Mon...
                if (rule.days.includes(dayOfWeek)) {
                    return rule.workoutId;
                }
            } else if (rule.type === 'interval') {
                if (!rule.startDate) continue;
                const start = parseISO(rule.startDate);
                const diff = differenceInDays(date, start);
                if (diff >= 0 && diff % rule.interval === 0) {
                    return rule.workoutId;
                }
            }
        }

        return null;
    };

    const addRecurrence = (rule) => {
        setSchedule(prev => ({
            ...prev,
            recurrences: [...prev.recurrences, { ...rule, id: crypto.randomUUID() }]
        }));
    };

    const removeRecurrence = (id) => {
        setSchedule(prev => ({
            ...prev,
            recurrences: prev.recurrences.filter(r => r.id !== id)
        }));
    };

    const setOverride = (date, workoutId) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        setSchedule(prev => ({
            ...prev,
            overrides: { ...prev.overrides, [dateKey]: workoutId }
        }));
    };

    return { schedule, getWorkoutForDate, addRecurrence, removeRecurrence, setOverride };
}
