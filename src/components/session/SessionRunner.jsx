import { useState, useEffect, useRef } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useWorkoutHistory } from '../../hooks/useWorkoutHistory';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, SkipForward, Play, Pause, X, AlertTriangle, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function SessionRunner() {
    const navigate = useNavigate();
    const { workouts } = useWorkouts();
    const { addLog } = useWorkoutHistory();

    // Selection State
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);

    // Session State
    const [sessionState, setSessionState] = useState('selection'); // selection, active, rest, finished
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);

    // Timer State
    const [timerDisplay, setTimerDisplay] = useState(0); // For countdowns (rest)
    const [totalTimer, setTotalTimer] = useState(0);     // Total workout duration
    const [currentSetTimer, setCurrentSetTimer] = useState(0); // Active set duration
    const [totalSetTime, setTotalSetTime] = useState(0); // Accumulated time in sets

    const [restType, setRestType] = useState('set'); // 'set' or 'exercise'

    // Refs for timestamps
    const restEndTimeRef = useRef(null);
    const workoutStartTimeRef = useRef(null);
    const setStartTimeRef = useRef(null);

    // Exit Confirmation
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const workout = workouts.find(w => w.id === selectedWorkoutId);
    const currentExercise = workout?.exercises[currentExerciseIndex];

    // --- Navigation Blocking ---
    useEffect(() => {
        if (sessionState === 'active' || sessionState === 'rest') {
            window.history.pushState(null, null, window.location.href);
            const handlePopState = (e) => {
                window.history.pushState(null, null, window.location.href);
                setShowExitConfirm(true);
            };
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [sessionState]);

    // --- Timers ---

    // Rest Countdown
    useEffect(() => {
        let interval = null;
        if (sessionState === 'rest') {
            interval = setInterval(() => {
                if (restEndTimeRef.current) {
                    const now = Date.now();
                    const remaining = Math.ceil((restEndTimeRef.current - now) / 1000);
                    if (remaining <= 0) {
                        setTimerDisplay(0);
                        finishRest();
                    } else {
                        setTimerDisplay(remaining);
                    }
                }
            }, 200);
        } else {
            setTimerDisplay(0);
        }
        return () => clearInterval(interval);
    }, [sessionState]);

    // Total Duration Timer
    useEffect(() => {
        let interval = null;
        if (sessionState === 'active' || sessionState === 'rest') {
            if (!workoutStartTimeRef.current) workoutStartTimeRef.current = Date.now();
            interval = setInterval(() => {
                const now = Date.now();
                setTotalTimer(Math.floor((now - workoutStartTimeRef.current) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionState]);

    // Set Timer (Active)
    useEffect(() => {
        let interval = null;
        if (sessionState === 'active') {
            if (!setStartTimeRef.current) setStartTimeRef.current = Date.now();
            interval = setInterval(() => {
                const now = Date.now();
                setCurrentSetTimer(Math.floor((now - setStartTimeRef.current) / 1000));
            }, 1000);
        } else {
            setCurrentSetTimer(0);
        }
        return () => clearInterval(interval);
    }, [sessionState]);


    const startWorkout = (id) => {
        setSelectedWorkoutId(id);
        setSessionState('active');
        setCurrentExerciseIndex(0);
        setCurrentSet(1);

        setTotalTimer(0);
        setTotalSetTime(0);
        workoutStartTimeRef.current = Date.now();
        setStartTimeRef.current = Date.now();
    };

    const finishSet = () => {
        if (!currentExercise) return;

        // Accumulate set time
        if (setStartTimeRef.current) {
            const duration = Date.now() - setStartTimeRef.current;
            setTotalSetTime(prev => prev + duration);
            setStartTimeRef.current = null; // Clear so it resets for next set
        }

        const isLastSet = currentSet >= currentExercise.sets;
        const isLastExercise = currentExerciseIndex >= workout.exercises.length - 1;

        if (isLastSet && isLastExercise) {
            finishWorkout();
            return;
        }

        setRestType(isLastSet ? 'exercise' : 'set');
        const restDuration = isLastSet ? currentExercise.restExercise : currentExercise.restSet;

        restEndTimeRef.current = Date.now() + (restDuration * 1000);
        setTimerDisplay(restDuration);

        setSessionState('rest');
    };

    const finishRest = () => {
        if (sessionState !== 'rest') return;

        if (restType === 'set') {
            setCurrentSet(s => s + 1);
        } else {
            setCurrentExerciseIndex(i => i + 1);
            setCurrentSet(1);
        }

        setStartTimeRef.current = Date.now(); // Start tracking next set time
        setSessionState('active');
    };

    const finishWorkout = () => {
        setSessionState('finished');

        // Calculate final stats
        // Note: totalTimer is in seconds, totalSetTime is in ms
        const exerciseSec = Math.floor(totalSetTime / 1000);
        const totalSec = totalTimer;
        const restSec = Math.max(0, totalSec - exerciseSec);

        addLog({
            workoutId: workout.id,
            name: workout.name,
            totalTime: totalSec,
            exerciseTime: exerciseSec,
            restTime: restSec
        });
    };

    // ... exit handlers ...
    const handleManualExit = () => setShowExitConfirm(true);
    const confirmExit = () => navigate('/');
    const cancelExit = () => setShowExitConfirm(false);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (sessionState === 'selection') {
        return (
            <div className="p-4 bg-zinc-950 min-h-screen">
                <div className="flex items-center mb-6 safe-top">
                    <button onClick={() => navigate(-1)} className="p-2 mr-2"><ChevronLeft /></button>
                    <h1 className="text-2xl font-bold">Start Workout</h1>
                </div>
                <div className="space-y-4">
                    {workouts.map(w => (
                        <button
                            key={w.id}
                            onClick={() => startWorkout(w.id)}
                            className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-left hover:bg-zinc-800 transition-colors"
                        >
                            <h3 className="text-xl font-bold mb-1">{w.name}</h3>
                            <p className="text-zinc-500">{w.exercises.length} Exercises - Est. {w.exercises.reduce((acc, ex) => acc + (ex.sets * 2) + (ex.sets * (ex.restSet / 60)), 0).toFixed(0)} min</p>
                        </button>
                    ))}
                    {workouts.length === 0 && <p className="text-center text-zinc-500">No workouts found.</p>}
                </div>
            </div>
        )
    }

    if (sessionState === 'finished') {
        // We can use local computation here for display
        const exerciseSec = Math.floor(totalSetTime / 1000);
        const restSec = Math.max(0, totalTimer - exerciseSec);

        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center"
                >
                    <CheckCircle size={48} className="text-black" />
                </motion.div>
                <h1 className="text-4xl font-bold">Workout Complete!</h1>

                <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-8">
                    <div className="bg-zinc-900 p-4 rounded-2xl">
                        <p className="text-zinc-500 text-xs">Total Time</p>
                        <p className="text-xl font-bold text-white">{formatTime(totalTimer)}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl">
                        <p className="text-zinc-500 text-xs">Exercise</p>
                        <p className="text-xl font-bold text-green-500">{formatTime(exerciseSec)}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl col-span-2">
                        <p className="text-zinc-500 text-xs">Rest</p>
                        <p className="text-xl font-bold text-blue-500">{formatTime(restSec)}</p>
                    </div>
                </div>

                <button onClick={() => navigate('/')} className="w-full bg-zinc-800 py-4 rounded-xl font-bold mt-8">Back Home</button>
            </div>
        )
    }

    // Active or Rest active view
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
            <div className={clsx("absolute inset-0 transition-colors duration-500", sessionState === 'rest' ? "bg-blue-900/20" : "bg-transparent")} />

            <div className="p-4 z-10 flex justify-between items-center bg-zinc-950/50 backdrop-blur-md safe-top">
                <button onClick={handleManualExit}><X size={24} className="text-zinc-500" /></button>
                <div className="text-sm font-mono text-zinc-400">{formatTime(totalTimer)}</div>
            </div>

            <div className="flex-1 z-10 p-6 flex flex-col justify-center items-center text-center">
                {sessionState === 'rest' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <h2 className="text-zinc-400 text-xl uppercase tracking-widest">{restType === 'exercise' ? 'Next Exercise' : 'Rest'}</h2>
                        <div className="text-8xl font-black font-mono tabular-nums text-blue-500">
                            {formatTime(timerDisplay)}
                        </div>
                        {restType === 'exercise' && (
                            <div className="bg-zinc-900 p-4 rounded-xl">
                                <p className="text-zinc-400 text-sm">Up Next</p>
                                <p className="text-xl font-bold text-white">{workout.exercises[currentExerciseIndex + 1]?.name}</p>
                            </div>
                        )}
                        <button onClick={finishRest} className="px-8 py-3 bg-zinc-800 rounded-full text-white font-medium flex items-center gap-2 mx-auto">
                            Skip Rest <SkipForward size={18} />
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-8 w-full">
                        <div className="space-y-2">
                            <h2 className="text-sm text-blue-500 font-bold uppercase tracking-widest">
                                Exercise {currentExerciseIndex + 1} / {workout.exercises.length}
                            </h2>
                            <h1 className="text-4xl font-black">{currentExercise.name}</h1>
                        </div>

                        {/* Set Timer Display */}
                        <div className="flex items-center justify-center gap-2 text-zinc-500 font-mono">
                            <Timer size={16} />
                            <span>{formatTime(currentSetTimer)}</span>
                        </div>

                        <div className="flex justify-center gap-2">
                            {Array.from({ length: currentExercise.sets }).map((_, i) => (
                                <div key={i} className={clsx(
                                    "h-2 flex-1 rounded-full bg-zinc-800",
                                    i < currentSet - 1 ? "bg-green-500" : (i === currentSet - 1 ? "bg-blue-500" : "")
                                )} />
                            ))}
                        </div>

                        <div className="py-6">
                            <div className="text-6xl font-black mb-2">{currentSet} <span className="text-2xl text-zinc-500 font-medium">/ {currentExercise.sets}</span></div>
                            <p className="text-zinc-400">Current Set</p>
                        </div>

                        <button
                            onClick={finishSet}
                            className="w-full bg-blue-600 active:bg-blue-700 py-6 rounded-3xl text-xl font-bold shadow-lg shadow-blue-900/40 transform transition-all active:scale-95"
                        >
                            Finish Set
                        </button>
                    </div>
                )}
            </div>

            {/* Exit Confirmation Modal */}
            <AnimatePresence>
                {showExitConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={cancelExit}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm z-50 border border-zinc-800 relative"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="text-red-500" size={32} />
                                </div>
                                <h3 className="text-xl font-bold">Exit Workout?</h3>
                                <p className="text-zinc-400 text-sm">You will lose your current session progress.</p>

                                <div className="flex gap-3 w-full mt-4">
                                    <button onClick={cancelExit} className="flex-1 py-3 font-bold bg-zinc-800 rounded-xl hover:bg-zinc-700">Cancel</button>
                                    <button onClick={confirmExit} className="flex-1 py-3 font-bold bg-red-600 rounded-xl hover:bg-red-700 text-white">Exit</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
