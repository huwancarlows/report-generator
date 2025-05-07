import html2canvas from 'html2canvas';

interface ExportOptions {
    scale?: number;
    backgroundColor?: string;
    windowWidth?: number;
    windowHeight?: number;
    waitForImages?: boolean;
    delay?: number;
}

export const createHighQualityCanvas = async (element: HTMLElement, options: ExportOptions = {}) => {
    // Wait for any animations or transitions to complete
    await new Promise(resolve => setTimeout(resolve, options.delay || 500));

    // --- PATCH: Replace all canvas with img (toDataURL) to fix blank chart export ---
    const canvases = element.querySelectorAll('canvas');
    const replaced: { canvas: HTMLCanvasElement, img: HTMLImageElement }[] = [];
    canvases.forEach(canvas => {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const img = document.createElement('img');
            img.src = dataUrl;
            img.width = canvas.width;
            img.height = canvas.height;
            img.style.display = canvas.style.display;
            img.style.position = canvas.style.position;
            canvas.parentNode?.replaceChild(img, canvas);
            replaced.push({ canvas, img });
        } catch (e) {
            // fallback: do nothing
        }
    });

    // Calculate device pixel ratio and scale
    const dpr = window.devicePixelRatio || 1;
    const scale = options.scale || Math.max(dpr, 2); // Use at least 2x scaling for better quality

    // Default configuration for best quality
    const defaultOptions = {
        scale: scale,
        useCORS: false, // Set to false for local canvas
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
        removeContainer: true,
        backgroundColor: options.backgroundColor || '#ffffff',
        windowWidth: options.windowWidth,
        windowHeight: options.windowHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: element.offsetWidth,
        height: element.offsetHeight,
        foreignObjectRendering: true,
        onclone: (clonedDoc: Document) => {
            // Add necessary styles for high-quality export
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
        * { 
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        canvas { 
          max-width: none !important; 
          max-height: none !important;
        }
        .chart-container { 
          position: relative !important;
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `;
            clonedDoc.head.appendChild(style);

            // Wait for images to load in cloned document
            if (options.waitForImages) {
                const images = clonedDoc.getElementsByTagName('img');
                const imagePromises = Array.from(images).map(img => {
                    if (img.complete) {
                        return Promise.resolve();
                    }
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                });
                return Promise.all(imagePromises);
            }
        }
    };

    try {
        // Create initial canvas
        const canvas = await html2canvas(element, { ...defaultOptions, ...options });

        // Restore original canvases
        replaced.forEach(({ canvas, img }) => {
            img.parentNode?.replaceChild(canvas, img);
        });

        // Create a new canvas with the exact same dimensions for better quality
        const perfectCanvas = document.createElement('canvas');
        perfectCanvas.width = canvas.width;
        perfectCanvas.height = canvas.height;
        const ctx = perfectCanvas.getContext('2d');

        if (ctx) {
            // Apply high-quality rendering settings
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(canvas, 0, 0);
        }

        return perfectCanvas;
    } catch (error) {
        console.error('Error creating high-quality canvas:', error);
        throw error;
    }
};

export const exportToImage = async (
    element: HTMLElement,
    filename: string,
    options: ExportOptions = {}
) => {
    try {
        const canvas = await createHighQualityCanvas(element, {
            ...options,
            waitForImages: true,
        });

        // Convert to high-quality PNG
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        // Create and trigger download
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        return true;
    } catch (error) {
        console.error('Export error:', error);
        return false;
    }
}; 