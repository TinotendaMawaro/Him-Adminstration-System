import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
        "./resources/**/*.ts",
        "./resources/**/*.tsx",
        "./resources/**/*.vue",
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            
            // Premium Gold Theme - Warm, spiritual gold
            colors: {
                gold: {
                    50: '#FFFBF0',
                    100: '#FFF3D4',
                    200: '#FFE4A3',
                    300: '#FFD470',
                    400: '#FFC03D',
                    500: '#E6A800',
                    600: '#CC9200',
                    700: '#A67500',
                    800: '#805900',
                    900: '#593F00',
                },
                // Sky Blue Theme - Calm, spiritual
                sky: {
                    50: '#F0F9FF',
                    100: '#E0F2FE',
                    200: '#BAE6FD',
                    300: '#7DD3FC',
                    400: '#38BDF8',
                    500: '#0EA5E9',
                    600: '#0284C7',
                    700: '#0369A1',
                    800: '#075985',
                    900: '#0C4A6E',
                },
                // Apple-inspired grays
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                    950: '#030712',
                },
            },
            
            // Enhanced backdrop blur
            backdropBlur: {
                xs: '2px',
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '24px',
                '3xl': '32px',
            },
            
            // Premium glass morphism shadows
            boxShadow: {
                // Glass effects
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-sm': '0 2px 8px 0 rgba(31, 38, 135, 0.05)',
                'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.1)',
                
                // Gold glow effects
                'glow-gold-xs': '0 0 8px rgba(212, 175, 55, 0.15)',
                'glow-gold-sm': '0 0 12px rgba(212, 175, 55, 0.2)',
                'glow-gold-md': '0 0 20px rgba(212, 175, 55, 0.25)',
                'glow-gold-lg': '0 0 32px rgba(212, 175, 55, 0.35)',
                'glow-gold-xl': '0 0 48px rgba(212, 175, 55, 0.45)',
                
                // Sky glow effects
                'glow-sky-xs': '0 0 8px rgba(14, 165, 233, 0.15)',
                'glow-sky-sm': '0 0 12px rgba(14, 165, 233, 0.2)',
                'glow-sky-md': '0 0 20px rgba(14, 165, 233, 0.25)',
                'glow-sky-lg': '0 0 32px rgba(14, 165, 233, 0.35)',
                
                // Combined gold + sky glow
                'glow-premium': '0 0 20px rgba(212, 175, 55, 0.15), 0 0 20px rgba(14, 165, 233, 0.15)',
                
                // Neumorphic inspired (subtle)
                'neu-flat': '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
                'neu-pressed': 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff',
                
                // Card shadows
                'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
                'card-hover': '0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 10px rgba(0, 0, 0, 0.08)',
            },
            
            // Animation keyframes
            keyframes: {
                // Fade in up (Apple-style entrance)
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                
                // Fade in scale
                'fade-in-scale': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                
                // Shimmer loading effect
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                
                // Gentle pulse
                'gentle-pulse': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                
                // Float animation
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            
            // Animation utilities
            animation: {
                "float-slow": "floatUp 20s linear infinite",
                "soft-glow": "soft-glow 3s ease-in-out infinite",
                "fade-in-up": "fade-in-up 0.5s ease-out forwards",
                "fade-in-scale": "fade-in-scale 0.3s ease-out forwards",
                "shimmer": "shimmer 2s linear infinite",
                "gentle-pulse": "gentle-pulse 2s ease-in-out infinite",
                "float": "float 3s ease-in-out infinite",
            },
            
            // Transition delay utilities
            transitionDelay: {
                '0': '0ms',
                '100': '100ms',
                '200': '200ms',
                '300': '300ms',
                '500': '500ms',
            },
            
            // Background image utilities
            backgroundImage: {
                'gradient-premium': 'linear-gradient(135deg, rgba(255, 251, 240, 0.9) 0%, rgba(240, 249, 255, 0.9) 100%)',
                'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
            },
            
            // Border radius
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
                '6xl': '3rem',
            },
            
            // Spacing
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            
            // Z-index
            zIndex: {
                '1': '1',
                '2': '2',
                '3': '3',
            },
        },
    },

    plugins: [forms],
};
