import { useLocalStorage } from 'usehooks-ts';
import { isSameDay, format, parseISO, addDays, getDay, differenceInDays, startOfDay } from 'date-fns';

const SCHEDULE_KEY = 'fit_track_schedule';

export function useSchedule() {
    const [schedule, setSchedule] = useLocalStorage(SCHEDULE_KEY, {
        recurrences: [], // { id, workoutId, type: 'weekly'|'interval', days: [1,3], interval: 2, startDate, color }
        overrides: {} // { '2023-10-25': workoutId or null }
    });

    const getWorkoutForDate = (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');

        // Check overrides first
        if (schedule.overrides.hasOwnProperty(dateKey)) {
            return { workoutId: schedule.overrides[dateKey], color: 'blue' };
        }

        // Check recurrences
        for (const rule of schedule.recurrences) {
            if (rule.type === 'weekly') {
                const dayOfWeek = getDay(date);
                if (rule.days.includes(dayOfWeek)) {
                    return { workoutId: rule.workoutId, color: rule.color || 'blue' };
                }
            } else if (rule.type === 'interval') {
                if (!rule.startDate) continue;
                // Use startOfDay to ignore time components for correct day diff
                const start = startOfDay(parseISO(rule.startDate));
                const target = startOfDay(date);
                const diff = differenceInDays(target, start);

                if (diff >= 0 && diff % rule.interval === 0) {
                    return { workoutId: rule.workoutId, color: rule.color || 'blue' };
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

    return { schedule, getWorkoutForDate, addRecurrence, removeRecurrence };
}
