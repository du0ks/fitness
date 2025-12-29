# FitTrack PWA

FitTrack is a modern, mobile-first Progressive Web App (PWA) designed for personal fitness and nutrition tracking. It features a sleek dark-themed interface, robust workout management, and detailed calorie/protein logging.

## 🚀 Features

- **Workout Builder & Editor**: Create and modify custom routines with exercises, sets, and rest times.
- **Interactive Exercise Mode**: Active session runner with timestamp-based timers to ensure accuracy even in the background. Features a confirmation prompt to prevent accidental session exit.
- **Advanced Scheduling (Habits)**: Plan your week using a calendar that supports weekly recurrences or interval-based habits (e.g., every 3 days) with custom color-coding.
- **Nutrition Dashboard**: Track daily calories and protein with visual progress bars and a full historical view.
- **Workout History**: Automatic logging of completed sessions, providing a breakdown of exercise time versus rest time.
- **PWA Ready**: Installable on mobile devices with offline support.

## 🛠️ Technology Stack

- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [useLocalStorage](https://usehooks-ts.com/react-hook/use-local-storage) for simplified, persistent local-first data.
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Deployment**: GitHub Pages with automated GitHub Actions.

## 💡 Key Techniques Used

- **Robust Background Timers**: Uses system timestamps instead of simple intervals to keep rest and exercise timers accurate when the browser throttles background tabs.
- **Safe Navigation Interception**: Prevents data loss by intercepting the browser/phone back button during active workouts.
- **Multi-Habit Visualization**: A custom calendar implementation that uses color gradients to display multiple scheduled habits on a single day.
- **Hash Routing**: Configured specifically for GitHub Pages compatibility.

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run locally**:
   ```bash
   npm run dev
   ```
3. **Build for production**:
   ```bash
   npm run build
   ```
