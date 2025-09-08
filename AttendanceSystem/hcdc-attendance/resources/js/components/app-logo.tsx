//import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center space-x-2">
            <img
                src="/image/hcdc_logo.jpg"
                alt="App Logo"
                className="h-8 w-8 object-contain rounded-md"
            />
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                Smart Attendance
            </span>
        </div>
    );
}
