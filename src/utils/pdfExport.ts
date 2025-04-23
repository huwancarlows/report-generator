import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface StyleOptions {
    element: HTMLElement;
    styles: Partial<CSSStyleDeclaration>;
}

const applyStyles = ({ element, styles }: StyleOptions) => {
    Object.assign(element.style, styles)
}

const setupBasicStyles = (clone: HTMLElement) => {
    // Set container styles
    applyStyles({
        element: clone,
        styles: {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            backgroundColor: '#ffffff',
            padding: '20px',
            margin: '0',
            boxSizing: 'border-box',
            zIndex: '-1'
        }
    })

    // Remove all Tailwind classes but keep structure
    const elements = clone.querySelectorAll('*')
    elements.forEach(element => {
        const el = element as HTMLElement
        // Keep only grid-related classes if they exist
        const gridClasses = el.className.split(' ').filter(cls =>
            cls.includes('grid-') || cls.includes('col-')
        ).join(' ')
        el.className = gridClasses

        // Ensure text is visible
        applyStyles({
            element: el,
            styles: {
                color: '#000000',
                backgroundColor: 'transparent',
                borderColor: '#000000',
                fontFamily: 'Arial, sans-serif'
            }
        })
    })
}

const setupTableStyles = (clone: HTMLElement) => {
    // Style main table
    const tables = clone.querySelectorAll('table')
    tables.forEach(table => {
        applyStyles({
            element: table as HTMLElement,
            styles: {
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
                fontSize: '10px'
            }
        })

        // Style table headers
        const headers = table.querySelectorAll('th')
        headers.forEach(header => {
            applyStyles({
                element: header as HTMLElement,
                styles: {
                    border: '1px solid #000000',
                    padding: '8px',
                    backgroundColor: '#f3f4f6',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }
            })
        })

        // Style table cells
        const cells = table.querySelectorAll('td')
        cells.forEach(cell => {
            applyStyles({
                element: cell as HTMLElement,
                styles: {
                    border: '1px solid #000000',
                    padding: '8px',
                    textAlign: 'left'
                }
            })
        })
    })
}

const setupContentStyles = (clone: HTMLElement) => {
    // Style headings
    const headings = clone.querySelectorAll('h1, h2, h3')
    headings.forEach(heading => {
        applyStyles({
            element: heading as HTMLElement,
            styles: {
                marginBottom: '10px',
                fontWeight: 'bold',
                textAlign: 'center'
            }
        })
    })

    // Style grid containers
    const grids = clone.querySelectorAll('.grid')
    grids.forEach(grid => {
        applyStyles({
            element: grid as HTMLElement,
            styles: {
                display: 'grid',
                gap: '20px',
                marginBottom: '20px'
            }
        })
    })

    // Style footer section
    const footerSection = clone.querySelector('.mt-8')
    if (footerSection) {
        applyStyles({
            element: footerSection as HTMLElement,
            styles: {
                marginTop: '30px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
            }
        })
    }
}

const setupSummaryStyles = (clone: HTMLElement) => {
    // Style the header
    const header = clone.querySelector('div[style*="text-align: center"]')
    if (header) {
        const elements = header.querySelectorAll('*')
        elements.forEach(element => {
            const el = element as HTMLElement
            el.style.color = '#000000'
            el.style.fontFamily = 'Arial, sans-serif'
        })
    }

    // Style the summary table
    const table = clone.querySelector('table')
    if (table) {
        applyStyles({
            element: table,
            styles: {
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '20px',
                fontSize: '12px'
            }
        })

        // Style headers
        const headers = table.querySelectorAll('th')
        headers.forEach(header => {
            applyStyles({
                element: header as HTMLElement,
                styles: {
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #000000',
                    padding: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }
            })
        })

        // Style cells
        const cells = table.querySelectorAll('td')
        cells.forEach(cell => {
            applyStyles({
                element: cell as HTMLElement,
                styles: {
                    border: '1px solid #000000',
                    padding: '8px',
                    textAlign: 'center'
                }
            })
        })
    }
}

export const exportToPDF = async (
    reportElement: HTMLElement,
    filename: string,
    onExportStart?: () => void,
    onExportEnd?: () => void
) => {
    try {
        onExportStart?.()

        // Create a clone of the report element
        const clone = reportElement.cloneNode(true) as HTMLElement

        // Create a temporary container
        const container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        container.style.top = '0'
        container.appendChild(clone)
        document.body.appendChild(container)

        // Apply styles
        setupBasicStyles(clone)
        setupTableStyles(clone)
        setupContentStyles(clone)

        // Wait for fonts and images to load
        await document.fonts.ready

        // Configure canvas options
        const canvasOptions = {
            scale: 2,
            useCORS: true,
            logging: true,
            backgroundColor: '#ffffff',
            windowWidth: filename.startsWith('Summary-') ? 1240 : 2480,
            windowHeight: filename.startsWith('Summary-') ? 1754 : 3508,
            allowTaint: true,
            foreignObjectRendering: true,
            onclone: (clonedDoc: Document) => {
                const clonedElement = clonedDoc.body.firstChild as HTMLElement
                if (clonedElement) {
                    setupBasicStyles(clonedElement)
                    setupTableStyles(clonedElement)
                    setupContentStyles(clonedElement)
                }
            }
        }

        // Capture the clone with html2canvas
        const canvas = await html2canvas(clone, canvasOptions)

        // Remove the temporary container
        document.body.removeChild(container)

        // Create PDF with appropriate orientation
        const pdf = new jsPDF({
            orientation: filename.startsWith('Summary-') ? 'portrait' : 'landscape',
            unit: 'mm',
            format: 'a4',
        })

        // Add the canvas to the PDF
        const imgData = canvas.toDataURL('image/png')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

        // Save the PDF
        pdf.save(filename)
    } catch (error) {
        console.error('Error exporting to PDF:', error)
    } finally {
        onExportEnd?.()
    }
} 