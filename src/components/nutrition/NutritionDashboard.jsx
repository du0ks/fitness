import { useState } from 'react';
import { useNutrition } from '../../hooks/useNutrition';
import { Plus, Flame, Beef, Settings2, History, ChevronDown, ChevronUp, X } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

export default function NutritionDashboard() {
    const { todayLog, targets, addEntries, updateTargets, logs } = useNutrition();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Calculate percentages
    const calPercent = Math.min(100, (todayLog.calories / targets.targetCalories) * 100);
    const proPercent = Math.min(100, (todayLog.protein / targets.targetProtein) * 100);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Nutrition</h2>
                <div className="flex gap-2">
                    <button onClick={() => setIsHistoryOpen(true)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                        <History size={20} />
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-zinc-400 hover:text-white">
                        <Settings2 size={20} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isHistoryOpen && (
                    <HistoryModal logs={logs} onClose={() => setIsHistoryOpen(false)} />
                )}
            </AnimatePresence>

            {/* Progress Cards */}
            <div className="grid grid-cols-2 gap-4">
                {/* Calories Card */}
                <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden border border-zinc-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                    <Flame className="text-orange-500 mb-2" size={24} />
                    <span className="text-3xl font-bold tabular-nums">{todayLog.calories}</span>
                    <span className="text-xs text-zinc-500"> / {targets.targetCalories} kcal</span>

                    <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${calPercent}%` }}
                            className="h-full bg-orange-500"
                        />
                    </div>
                </div>

                {/* Protein Card */}
                <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden border border-zinc-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                    <Beef className="text-blue-500 mb-2" size={24} />
                    <span className="text-3xl font-bold tabular-nums">{todayLog.protein}g</span>
                    <span className="text-xs text-zinc-500"> / {targets.targetProtein}g</span>

                    <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${proPercent}%` }}
                            className="h-full bg-blue-500"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl flex items-center justify-center space-x-2 font-medium transition-colors border border-zinc-700 dashed"
            >
                <Plus size={20} />
                <span>Add Meal</span>
            </button>

            <AddMealModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addEntries}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                targets={targets}
                onSave={updateTargets}
            />
        </div>
    );
}

function HistoryModal({ logs, onClose }) {
    // Sort logs by date descending
    const sortedHistory = Object.entries(logs)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]));

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950 flex flex-col"
        >
            <div className="p-4 flex justify-between items-center border-b border-zinc-800 safe-top">
                <h2 className="text-xl font-bold">Nutrition History</h2>
                <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sortedHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                        <History size={48} className="mb-4 opacity-20" />
                        <p>No history yet</p>
                    </div>
                )}

                {sortedHistory.map(([date, data]) => (
                    <div key={date} className="bg-zinc-900/50 p-4 rounded-xl flex justify-between items-center border border-zinc-900">
                        <span className="font-medium text-zinc-200">{format(parseISO(date), 'EEEE, MMM d, yyyy')}</span>
                        <div className="flex gap-4 text-sm font-bold">
                            <span className="text-orange-500">{data.calories} kcal</span>
                            <span className="text-blue-500 w-12 text-right">{data.protein}g</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function AddMealModal({ isOpen, onClose, onAdd }) {
    const [cal, setCal] = useState('');
    const [pro, setPro] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!cal && !pro) return;
        onAdd(cal || 0, pro || 0);
        setCal('');
        setPro('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl p-6 z-50 border-t border-zinc-800"
                    >
                        <h3 className="text-xl font-bold mb-4">Add Meal</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Calories</label>
                                <input
                                    type="number" inputMode="numeric" pattern="[0-9]*"
                                    value={cal} onChange={e => setCal(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-lg focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. 500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Protein (g)</label>
                                <input
                                    type="number" inputMode="numeric" pattern="[0-9]*"
                                    value={pro} onChange={e => setPro(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-lg focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. 30"
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4">
                                Add Entry
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function SettingsModal({ isOpen, onClose, targets, onSave }) {
    const [cal, setCal] = useState(targets.targetCalories);
    const [pro, setPro] = useState(targets.targetProtein);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(cal, pro);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="fixed inset-4 m-auto h-fit bg-zinc-900 rounded-3xl p-6 z-50 border border-zinc-800"
                    >
                        <h3 className="text-xl font-bold mb-4">Daily Goals</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Target Calories</label>
                                <input
                                    type="number"
                                    value={cal} onChange={e => setCal(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Target Protein (g)</label>
                                <input
                                    type="number"
                                    value={pro} onChange={e => setPro(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={onClose} className="flex-1 py-3 font-medium text-zinc-400">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl">Save</button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
