import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

const WORKOUTS_KEY = 'fit_track_workouts';

export function useWorkouts() {
    const [workouts, setWorkouts] = useLocalStorage(WORKOUTS_KEY, []);

    const addWorkout = (workout) => {
        const newWorkout = { ...workout, id: uuidv4() };
        setWorkouts(prev => [...prev, newWorkout]);
    };

    const updateWorkout = (id, updatedData) => {
        setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...updatedData } : w));
    };

    const deleteWorkout = (id) => {
        setWorkouts(prev => prev.filter(w => w.id !== id));
    };

    return { workouts, addWorkout, updateWorkout, deleteWorkout };
}
