'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useEventTheme } from "@/shared/contexts/EventThemeContext";

/**
 * Extracts the dominant color from the left and right edges of an image.
 * Samples a thin vertical strip on each side and averages the pixel values.
 */
function extractEdgeColor(imgElement) {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(null);

            const w = imgElement.naturalWidth;
            const h = imgElement.naturalHeight;
            if (!w || !h) return resolve(null);

            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(imgElement, 0, 0);

            // Sample strip width: ~2% of image width, minimum 1px, max 20px
            const stripW = Math.max(1, Math.min(20, Math.floor(w * 0.02)));

            let r = 0, g = 0, b = 0, count = 0;

            // Sample left edge
            const leftData = ctx.getImageData(0, 0, stripW, h).data;
            for (let i = 0; i < leftData.length; i += 4) {
                r += leftData[i];
                g += leftData[i + 1];
                b += leftData[i + 2];
                count++;
            }

            // Sample right edge
            const rightData = ctx.getImageData(w - stripW, 0, stripW, h).data;
            for (let i = 0; i < rightData.length; i += 4) {
                r += rightData[i];
                g += rightData[i + 1];
                b += rightData[i + 2];
                count++;
            }

            if (count === 0) return resolve(null);

            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);

            resolve(`rgb(${r}, ${g}, ${b})`);
        } catch {
            resolve(null);
        }
    });
}

export default function EventBanner({ evento: propEvento }) {
    const pathname = usePathname();
    const isOnProgramacao = pathname?.endsWith('/programacao');
    const [edgeColor, setEdgeColor] = useState(null);
    const imgRef = useRef(null);

    let displayEvent = propEvento;
    try {
        const themeContext = useEventTheme();
        // Only use the child event's theme when on the programação page
        if (isOnProgramacao && themeContext.themeEvent) {
            displayEvent = themeContext.themeEvent;
        }
    } catch (e) {
        // Fallback if rendered outside of provider
    }

    const bannerUrl = displayEvent.banner
        ? `http://localhost:4455${displayEvent.banner.startsWith('/') ? '' : '/'}${displayEvent.banner}`
        : null;

    // Fallback color: secondary > primary > dark neutral
    const fallbackColor = displayEvent.cor_secundaria || displayEvent.cor_primaria || '#1a1a2e';

    // Reset edge color when banner URL changes
    useEffect(() => {
        setEdgeColor(null);
    }, [bannerUrl]);

    const handleImageLoad = useCallback(async () => {
        if (imgRef.current) {
            const color = await extractEdgeColor(imgRef.current);
            setEdgeColor(color);
        }
    }, []);

    const bgColor = edgeColor || fallbackColor;

    if (!bannerUrl) {
        // No banner — show colored placeholder with event name
        return (
            <div
                className="w-full flex items-center justify-center py-16"
                style={{
                    background: `linear-gradient(135deg, ${fallbackColor} 0%, ${fallbackColor}dd 100%)`,
                }}
            >
                <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
                    {displayEvent.nome}
                </h1>
            </div>
        );
    }

    return (
        <div
            className="w-full flex justify-center"
            style={{
                backgroundColor: bgColor,
                transition: 'background-color 0.5s ease',
            }}
        >
            {/* Hidden image for color extraction (needs crossOrigin) */}
            <img
                ref={imgRef}
                src={bannerUrl}
                alt=""
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
                className="hidden"
            />

            {/* Visible banner: natural aspect ratio, max-height 50vh, centered */}
            <img
                src={bannerUrl}
                alt={displayEvent.nome}
                style={{
                    maxHeight: '50vh',
                    maxWidth: '100%',
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                }}
            />
        </div>
    );
}

