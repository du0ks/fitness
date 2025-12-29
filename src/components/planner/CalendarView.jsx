import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { useSchedule } from '../../hooks/useSchedule';
import { useWorkouts } from '../../hooks/useWorkouts';
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Map colors to CSS gradient stops or plain text classes
const COLOR_MAP = {
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    purple: '#a855f7',
    orange: '#f97316',
};

const COLORS = [
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'green', bg: 'bg-green-500' },
    { name: 'red', bg: 'bg-red-500' },
    { name: 'purple', bg: 'bg-purple-500' },
    { name: 'orange', bg: 'bg-orange-500' },
];

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { getWorkoutsForDate, addRecurrence, removeRecurrence, schedule } = useSchedule();
    const { workouts } = useWorkouts();
    const [isManageMode, setIsManageMode] = useState(false);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    // weekStartsOn 1 means Monday
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="p-4 safe-top pb-24 space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Plan</h1>
                <button
                    onClick={() => setIsManageMode(true)}
                    className="text-blue-500 font-medium text-sm"
                >
                    Manage Habits
                </button>
            </header>

            {/* Calendar Grid */}
            <div className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-full"><ChevronLeft /></button>
                    <h2 className="font-bold text-lg">{format(currentDate, 'MMMM yyyy')}</h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-full"><ChevronRight /></button>
                </div>

                <div className="grid grid-cols-7 text-center mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                        <div key={d} className="text-zinc-500 text-xs font-bold">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2">
                    {days.map(day => {
                        const habits = getWorkoutsForDate(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        let style = {};
                        if (habits.length > 0) {
                            if (habits.length === 1) {
                                style = { color: COLOR_MAP[habits[0].color] || 'white' };
                            } else {
                                // Create gradient
                                const stops = habits.map(h => COLOR_MAP[h.color] || 'white').join(', ');
                                style = {
                                    backgroundImage: `linear-gradient(to right, ${stops})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    color: 'transparent' // Fallback
                                };
                            }
                        } else {
                            style = { color: 'white' };
                        }

                        return (
                            <div
                                key={day.toISOString()}
                                className={clsx(
                                    "aspect-square flex flex-col items-center justify-center rounded-xl relative",
                                    !isCurrentMonth && "opacity-30",
                                    isToday(day) && "bg-zinc-800",
                                )}
                            >
                                <span className="text-sm font-bold" style={style}>{format(day, 'd')}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* List of Habits */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-zinc-400">Active Habits</h3>
                {schedule.recurrences.length === 0 && <p className="text-zinc-500 text-sm">No recurring schedules set.</p>}
                {schedule.recurrences.map(rule => {
                    const workout = workouts.find(w => w.id === rule.workoutId);
                    const colorBg = COLORS.find(c => c.name === (rule.color || 'blue'))?.bg;

                    let desc = "";
                    if (rule.type === 'weekly') {
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        desc = `Every ${rule.days.map(d => dayNames[d]).join(', ')}`;
                    } else {
                        desc = `Every ${rule.interval} days`;
                    }

                    return (
                        <div key={rule.id} className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className={clsx("w-3 h-3 rounded-full", colorBg)} />
                                <div>
                                    <p className="font-bold text-white">{workout?.name || 'Unknown Workout'}</p>
                                    <p className="text-xs text-zinc-500">{desc}</p>
                                </div>
                            </div>
                            <button onClick={() => removeRecurrence(rule.id)} className="text-red-500 text-xs">Remove</button>
                        </div>
                    )
                })}
            </div>

            <ManageHabitModal
                isOpen={isManageMode}
                onClose={() => setIsManageMode(false)}
                workouts={workouts}
                onAdd={addRecurrence}
            />
        </div>
    );
}

function ManageHabitModal({ isOpen, onClose, workouts, onAdd }) {
    const [type, setType] = useState('weekly');
    const [selectedWorkout, setSelectedWorkout] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [interval, setInterval] = useState(2);
    const [color, setColor] = useState('blue');

    const toggleDay = (d) => {
        if (selectedDays.includes(d)) setSelectedDays(prev => prev.filter(x => x !== d));
        else setSelectedDays(prev => [...prev, d]);
    };

    const handleSave = () => {
        if (!selectedWorkout) return;
        if (type === 'weekly' && selectedDays.length === 0) return;

        onAdd({
            type,
            workoutId: selectedWorkout,
            days: type === 'weekly' ? selectedDays : [],
            interval: type === 'interval' ? interval : 0,
            startDate: new Date().toISOString(),
            color
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                        className="dark bg-zinc-900 w-full max-w-sm rounded-2xl p-6 z-10 border border-zinc-800 relative"
                    >
                        <h3 className="font-bold text-xl mb-4">Add Schedule</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">Workout</label>
                                <select
                                    value={selectedWorkout}
                                    onChange={e => setSelectedWorkout(e.target.value)}
                                    className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-white outline-none"
                                >
                                    <option value="">Select a workout...</option>
                                    {workouts.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-xs text-zinc-500 mb-2">Color Label</label>
                                <div className="flex gap-2">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.name}
                                            onClick={() => setColor(c.name)}
                                            className={clsx(
                                                "w-8 h-8 rounded-full transition-transform active:scale-90 flex items-center justify-center",
                                                c.bg,
                                                color === c.name ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""
                                            )}
                                        >
                                            {color === c.name && <Check size={14} className="text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex bg-zinc-950 p-1 rounded-xl mb-3">
                                    <button onClick={() => setType('weekly')} className={clsx("flex-1 py-2 rounded-lg text-sm font-medium transition-colors", type === 'weekly' ? 'bg-zinc-800 text-white' : 'text-zinc-500')}>Weekly</button>
                                    <button onClick={() => setType('interval')} className={clsx("flex-1 py-2 rounded-lg text-sm font-medium transition-colors", type === 'interval' ? 'bg-zinc-800 text-white' : 'text-zinc-500')}>Interval</button>
                                </div>

                                {type === 'weekly' ? (
                                    <div className="flex justify-between">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
                                            // map visual index to date-fns getDay index (0=Sun, 1=Mon...)
                                            // visual: 0=Mon, 1=Tue... 6=Sun
                                            // date-fns: 0=Sun, 1=Mon...
                                            // so visual 0 -> 1, visual 6 -> 0
                                            const dayIndex = i === 6 ? 0 : i + 1;

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => toggleDay(dayIndex)}
                                                    className={clsx(
                                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                                                        selectedDays.includes(dayIndex) ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
                                                    )}
                                                >
                                                    {d}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Repeat Every X Days</label>
                                        <input
                                            type="number"
                                            value={interval}
                                            onChange={e => setInterval(Number(e.target.value))}
                                            className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-white"
                                        />
                                    </div>
                                )}
                            </div>

                            <button onClick={handleSave} className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white mt-4">Save Schedule</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
