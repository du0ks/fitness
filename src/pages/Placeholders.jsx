import NutritionDashboard from '../components/nutrition/NutritionDashboard';
import WorkoutList from '../components/workouts/WorkoutList';
import CalendarView from '../components/planner/CalendarView';

export default function Dashboard() {
    return (
        <div className="p-4 safe-top pb-24 space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">FitTrack</h1>
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
