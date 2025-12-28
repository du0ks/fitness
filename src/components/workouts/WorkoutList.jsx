import { useState } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Plus, Trash2, ChevronRight, Clock, Dumbbell, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

export default function WorkoutList() {
    const { workouts, addWorkout, deleteWorkout } = useWorkouts();
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Workouts</h1>
                <button
                    onClick={() => setIsEditorOpen(true)}
                    className="p-3 bg-blue-600 rounded-full text-white shadow-lg active:scale-95 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </header>

            <div className="grid gap-4">
                {workouts.length === 0 && (
                    <p className="text-zinc-500 text-center py-10">No workouts yet. Create one!</p>
                )}
                {workouts.map(workout => (
                    <div key={workout.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center group">
                        <div>
                            <h3 className="font-bold text-lg">{workout.name}</h3>
                            <p className="text-zinc-400 text-sm">{workout.exercises.length} exercises</p>
                        </div>
                        <button onClick={() => deleteWorkout(workout.id)} className="p-2 text-zinc-600 hover:text-red-500">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isEditorOpen && (
                    <WorkoutEditor onClose={() => setIsEditorOpen(false)} onSave={addWorkout} />
                )}
            </AnimatePresence>
        </div>
    );
}

function WorkoutEditor({ onClose, onSave }) {
    const [name, setName] = useState('');
    const [exercises, setExercises] = useState([]);

    const addExercise = () => {
        setExercises([...exercises, {
            id: uuidv4(),
            name: '',
            sets: 3,
            restSet: 60, // seconds
            restExercise: 120 // seconds
        }]);
    };

    const updateExercise = (index, field, value) => {
        const newEx = [...exercises];
        // If value is empty string, don't coerce to 0 yet, let it be ''
        newEx[index] = { ...newEx[index], [field]: value };
        setExercises(newEx);
    };

    const removeExercise = (index) => {
        const newEx = [...exercises];
        newEx.splice(index, 1);
        setExercises(newEx);
    };

    const handleSave = () => {
        if (!name) return;
        // Clean up data before saving (ensure numbers are numbers)
        const cleanExercises = exercises.map(ex => ({
            ...ex,
            sets: Number(ex.sets) || 0,
            restSet: Number(ex.restSet) || 0,
            restExercise: Number(ex.restExercise) || 0
        }));

        onSave({ name, exercises: cleanExercises });
        onClose();
    };

    return (
        <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed inset-0 bg-black z-50 overflow-y-auto flex flex-col"
        >
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-md z-10">
                <button onClick={onClose} className="text-zinc-400">Cancel</button>
                <h2 className="font-bold text-lg">New Workout</h2>
                <button onClick={handleSave} className="text-blue-500 font-bold">Save</button>
            </div>

            <div className="p-4 space-y-6 max-w-xl mx-auto w-full">
                <div>
                    <label className="text-sm text-zinc-500 block mb-2">Routine Name</label>
                    <input
                        value={name} onChange={e => setName(e.target.value)}
                        placeholder="e.g. Push Day"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-xl font-bold focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-4">
                    {exercises.map((ex, i) => (
                        <div key={ex.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 mr-4">
                                    <input
                                        value={ex.name}
                                        onChange={e => updateExercise(i, 'name', e.target.value)}
                                        placeholder="Exercise Name (e.g. Bench Press)"
                                        className="w-full bg-transparent border-b border-zinc-700 p-2 font-medium focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <button onClick={() => removeExercise(i)} className="text-zinc-600 hover:text-red-500 p-1">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Sets</label>
                                    <div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden">
                                        <input
                                            type="number"
                                            value={ex.sets}
                                            onChange={e => updateExercise(i, 'sets', e.target.value)}
                                            className="w-full bg-transparent p-2 text-center outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Set Rest (s)</label>
                                    <div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden">
                                        <Clock size={14} className="ml-2 text-zinc-500" />
                                        <input
                                            type="number"
                                            value={ex.restSet}
                                            onChange={e => updateExercise(i, 'restSet', e.target.value)}
                                            className="w-full bg-transparent p-2 text-center outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">End Rest (s)</label>
                                    <div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden">
                                        <Clock size={14} className="ml-2 text-zinc-500" />
                                        <input
                                            type="number"
                                            value={ex.restExercise}
                                            onChange={e => updateExercise(i, 'restExercise', e.target.value)}
                                            className="w-full bg-transparent p-2 text-center outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addExercise}
                    className="w-full py-4 border border-zinc-700 border-dashed rounded-xl text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors flex items-center justify-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add Exercise</span>
                </button>
            </div>
        </motion.div>
    );
}
