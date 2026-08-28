import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer Stadium Rail Track */}
            <circle
                cx="12"
                cy="12"
                r="9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="opacity-40"
            />
            {/* Outer Arena Ring */}
            <circle
                cx="12"
                cy="12"
                r="7.5"
                stroke="currentColor"
                strokeWidth="1"
                className="opacity-20"
            />
            {/* Blade 1 (Top) */}
            <path
                d="M12 3C13.2 5.8 15.6 7.6 19 8.2C16.8 10 14.5 10.8 12 11.2V3Z"
                fill="currentColor"
            />
            {/* Blade 2 (Bottom-Right) */}
            <path
                d="M19 14.8C16.2 15.6 14.5 17.5 13.8 20.8C12.2 18.5 11.4 16.2 12.2 12.8C14.8 13.6 17 14.2 19 14.8Z"
                fill="currentColor"
            />
            {/* Blade 3 (Bottom-Left) */}
            <path
                d="M5 14.2C7.8 13.6 9.6 11.5 10.2 8.2C11.8 10.5 12.4 12.8 11.8 14.8C9.2 14.2 7 13.8 5 14.2Z"
                fill="currentColor"
            />
            {/* Core Bit Center */}
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            <circle
                cx="12"
                cy="12"
                r="0.9"
                fill="var(--color-sidebar, var(--color-background, #000))"
            />
        </svg>
    );
}
