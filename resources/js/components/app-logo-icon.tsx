import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer Ratchet Attack Frame */}
            <path
                d="M12 2L14.8 5.4C16.6 5.6 18.4 7.4 18.6 9.2L22 12L18.6 14.8C18.4 16.6 16.6 18.4 14.8 18.6L12 22L9.2 18.6C7.4 18.4 5.6 16.6 5.4 14.8L2 12L5.4 9.2C5.6 7.4 7.4 5.6 9.2 5.4L12 2Z"
                fill="currentColor"
                opacity="0.18"
            />
            {/* 4 Dynamic Sweeping Beyblade Attack Blades */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.5C12.8 5.8 15.5 8 19.5 8.5L16.2 11.5C14.2 10.8 12.8 9.2 12.2 7.2L12 2.5ZM21.5 12C18.2 12.8 16 15.5 15.5 19.5L12.5 16.2C13.2 14.2 14.8 12.8 16.8 12.2L21.5 12ZM12 21.5C11.2 18.2 8.5 16 4.5 15.5L7.8 12.5C9.8 13.2 11.2 14.8 11.8 16.8L12 21.5ZM2.5 12C5.8 11.2 8 8.5 8.5 4.5L11.5 7.8C10.8 9.8 9.2 11.2 7.2 11.8L2.5 12Z"
                fill="currentColor"
            />
            {/* Center Bit Core Chip */}
            <circle cx="12" cy="12" r="3.2" fill="currentColor" />
            {/* Beyblade X Center Mark */}
            <path
                d="M10.4 10.4L13.6 13.6M13.6 10.4L10.4 13.6"
                stroke="var(--color-sidebar, var(--color-background, #fff))"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
        </svg>
    );
}
