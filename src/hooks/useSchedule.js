import { useLocalStorage } from 'usehooks-ts';
import { isSameDay, format, parseISO, addDays, getDay, differenceInDays, startOfDay } from 'date-fns';

const SCHEDULE_KEY = 'fit_track_schedule';

export function useSchedule() {
    const [schedule, setSchedule] = useLocalStorage(SCHEDULE_KEY, {
        recurrences: [], // { id, workoutId, type: 'weekly'|'interval', days: [1,3], interval: 2, startDate, color }
        overrides: {} // { '2023-10-25': workoutId or null }
    });

    const getWorkoutsForDate = (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const matches = [];

        // Check overrides first (overrides might conceptually replace everything, or just add... let's say it adds for now unless null)
        if (schedule.overrides.hasOwnProperty(dateKey)) {
            if (schedule.overrides[dateKey]) {
                matches.push({ workoutId: schedule.overrides[dateKey], color: 'blue' });
            }
            // If override is explicit null, maybe we should return empty? 
            // For simplicity, let's just treat override as an addition or replacement if needed. 
            // User asked for "all habits", so let's accumulate matches.
        }

        // Check recurrences
        for (const rule of schedule.recurrences) {
            if (rule.type === 'weekly') {
                const dayOfWeek = getDay(date);
                if (rule.days.includes(dayOfWeek)) {
                    matches.push({ workoutId: rule.workoutId, color: rule.color || 'blue' });
                }
            } else if (rule.type === 'interval') {
                if (!rule.startDate) continue;
                const start = startOfDay(parseISO(rule.startDate));
                const target = startOfDay(date);
                const diff = differenceInDays(target, start);

                if (diff >= 0 && diff % rule.interval === 0) {
                    matches.push({ workoutId: rule.workoutId, color: rule.color || 'blue' });
                }
            }
        }

        // Deduplicate by workoutId + color if needed, or just return all
        return matches;
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

    return { schedule, getWorkoutsForDate, addRecurrence, removeRecurrence };
}
