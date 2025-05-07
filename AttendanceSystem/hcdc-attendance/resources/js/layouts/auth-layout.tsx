import { ReactNode } from 'react';
import { Head } from '@inertiajs/react';

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/image/hcdc_background.png')" }}
        >
            <Head title={title ?? 'Auth'} />

            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg max-w-md w-full">
                {title && (
                    <div className="mb-4 text-center">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
                    </div>
                )}

                {children}
            </div>
        </div>
    );
}
