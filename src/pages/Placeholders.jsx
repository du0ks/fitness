import NutritionDashboard from '../components/nutrition/NutritionDashboard';
import WorkoutList from '../components/workouts/WorkoutList';
import CalendarView from '../components/planner/CalendarView';

export default function Dashboard() {
    return (
        <div className="p-4 safe-top pb-24 space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Today</h1>
                <p className="text-zinc-400">Track your progress and nutrition</p>
            </header>
            <NutritionDashboard />
        </div>
    );
}

export function CalendarPage() {
    return <CalendarView />;
}

export function WorkoutsPage() {
    return <WorkoutList />;
}
