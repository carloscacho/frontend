'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';

export default function NavigationLink({ href, children, onClick, isNavLink = false, activeColor, ...props }) {
    const router = useRouter();
    const pathname = usePathname();
    const { startLoading, stopLoading } = useNavigationLoading();

    const targetPath = typeof href === 'string' ? href : href.pathname;

    // Check if this link is the current active page
    const isActive = pathname === targetPath ||
        (targetPath !== '/' && pathname?.startsWith(targetPath) && targetPath.split('/').length >= 3);

    const handleClick = (e) => {
        // Call original onClick if provided
        if (onClick) {
            onClick(e);
        }

        // Don't trigger loading for same page or if prevented
        if (e.defaultPrevented) return;

        // Don't show loading for same page navigation
        if (targetPath === pathname) return;

        // Don't trigger for external links or anchor links
        if (targetPath?.startsWith('http') || targetPath?.startsWith('#')) return;

        // Start loading indicator
        startLoading();

        // Stop loading after navigation completes (fallback timeout)
        setTimeout(() => {
            stopLoading();
        }, 3000);
    };

    // If it's a navigation link, add active indicator styling and hover effect
    if (isNavLink) {
        return (
            <Link
                href={href}
                onClick={handleClick}
                {...props}
                className={`${props.className || ''} relative transition-all duration-200 group`}
            >
                {children}
                {/* Underline indicator - shows on active OR grows on hover */}
                <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 transition-all duration-300 ease-out
                               ${isActive ? 'w-4/5' : 'w-0 group-hover:w-3/5'}`}
                    style={{ backgroundColor: activeColor || 'currentColor' }}
                />
            </Link>
        );
    }

    return (
        <Link href={href} onClick={handleClick} {...props}>
            {children}
        </Link>
    );
}

