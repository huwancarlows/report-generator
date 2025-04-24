import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

interface StyleOptions {
    element: HTMLElement;
    styles: Partial<CSSStyleDeclaration>;
}

const applyStyles = ({ element, styles }: StyleOptions) => {
    Object.assign(element.style, styles)
}

const setupBasicStyles = (clone: HTMLElement) => {
    clone.style.width = '297mm' // A4 width
    clone.style.height = '210mm' // A4 height
    clone.style.padding = '10mm'
    clone.style.margin = '0'
    clone.style.backgroundColor = '#ffffff'

    // Remove all Tailwind classes and set basic styles
    const elements = clone.querySelectorAll('*')
    elements.forEach(element => {
        const el = element as HTMLElement
        el.className = ''
        applyStyles({
            element: el,
            styles: {
                backgroundColor: '#ffffff',
                color: '#000000',
                borderColor: '#000000',
                fontFamily: 'Arial, sans-serif'
            }
        })
    })
}

const setupTableStyles = (clone: HTMLElement) => {
    // Style table
    const table = clone.querySelector('table')
    if (table) {
        applyStyles({
            element: table,
            styles: {
                width: '100%',
                borderCollapse: 'collapse',
                pageBreakInside: 'auto',
                fontSize: '10px'
            }
        })
    }

    // Style table headers
    const ths = clone.querySelectorAll('th')
    ths.forEach(th => {
        applyStyles({
            element: th,
            styles: {
                border: '1px solid #000000',
                padding: '4px',
                textAlign: 'center',
                verticalAlign: 'middle',
                fontWeight: 'bold',
                fontSize: '10px',
                lineHeight: '1.2'
            }
        })
    })

    // Style table cells
    const tds = clone.querySelectorAll('td')
    tds.forEach(td => {
        applyStyles({
            element: td,
            styles: {
                border: '1px solid #000000',
                padding: '4px',
                fontSize: '10px',
                lineHeight: '1.2',
                verticalAlign: 'top'
            }
        })
    })
}

const setupContentStyles = (clone: HTMLElement) => {
    // Style indicators and sub-indicators
    const indicators = clone.querySelectorAll('.space-y-1')
    indicators.forEach(indicator => {
        applyStyles({
            element: indicator as HTMLElement,
            styles: {
                marginLeft: '0',
                paddingLeft: '0'
            }
        })
    })

    // Style header text
    const headerTexts = clone.querySelectorAll('.text-2xl, .text-lg, .text-sm')
    headerTexts.forEach(text => {
        applyStyles({
            element: text as HTMLElement,
            styles: {
                marginBottom: '4px',
                textAlign: 'center'
            }
        })
    })

    // Adjust grid layout for header info
    const gridContainer = clone.querySelector('.grid')
    if (gridContainer) {
        applyStyles({
            element: gridContainer as HTMLElement,
            styles: {
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px'
            }
        })
    }

    // Style footer section
    const footerSection = clone.querySelector('.mt-8')
    if (footerSection) {
        applyStyles({
            element: footerSection as HTMLElement,
            styles: {
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'space-between'
            }
        })
    }
}

const setupSummaryStyles = (clone: HTMLElement) => {
    // Style the summary container
    applyStyles({
        element: clone,
        styles: {
            padding: '20mm',
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }
    })

    // Style the header
    const header = clone.querySelector('h2')
    if (header) {
        applyStyles({
            element: header,
            styles: {
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '10mm'
            }
        })
    }

    // Style the reporting info
    const reportingInfo = clone.querySelectorAll('.mb-4 p')
    reportingInfo.forEach(info => {
        applyStyles({
            element: info as HTMLElement,
            styles: {
                fontSize: '12px',
                textAlign: 'center',
                marginBottom: '2mm'
            }
        })
    })

    // Style table
    const table = clone.querySelector('table')
    if (table) {
        applyStyles({
            element: table,
            styles: {
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '5mm',
                marginBottom: '5mm'
            }
        })
    }

    // Style table headers
    const ths = clone.querySelectorAll('th')
    ths.forEach(th => {
        applyStyles({
            element: th,
            styles: {
                backgroundColor: '#f3f4f6',
                border: '1px solid #000000',
                padding: '2mm',
                fontSize: '12px',
                fontWeight: 'bold'
            }
        })
    })

    // Style table cells
    const tds = clone.querySelectorAll('td')
    tds.forEach(td => {
        applyStyles({
            element: td,
            styles: {
                border: '1px solid #000000',
                padding: '2mm',
                fontSize: '11px'
            }
        })
    })

    // Style the footer section
    const footerSection = clone.querySelector('.mt-8')
    if (footerSection) {
        applyStyles({
            element: footerSection as HTMLElement,
            styles: {
                marginTop: '15mm',
                display: 'flex',
                justifyContent: 'space-between'
            }
        })
    }

    // Style the signature blocks
    const signatureBlocks = clone.querySelectorAll('.mt-8 .grid > div')
    signatureBlocks.forEach(block => {
        applyStyles({
            element: block as HTMLElement,
            styles: {
                flex: '1',
                padding: '5mm',
                maxWidth: '45%'
            }
        })
    })
}

export const exportToPDF = async (
    reportElement: HTMLElement,
    filename: string,
    onExportStart?: () => void,
    onExportEnd?: () => void,
    isSummary: boolean = false
) => {
    try {
        if (onExportStart) onExportStart()

        // Create a clone of the element to avoid modifying the original
        const clone = reportElement.cloneNode(true) as HTMLElement
        document.body.appendChild(clone)
        clone.style.display = 'block'
        clone.style.position = 'absolute'
        clone.style.left = '-9999px'
        clone.style.top = '-9999px'

        // Apply appropriate styles based on the type of document
        if (isSummary) {
            setupSummaryStyles(clone)
        } else {
            setupBasicStyles(clone)
            setupTableStyles(clone)
            setupContentStyles(clone)
        }

        // Enhanced html2canvas configuration
        const canvas = await html2canvas(clone, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: clone.scrollWidth,
            windowHeight: clone.scrollHeight,
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.body.firstChild as HTMLElement;
                if (clonedElement) {
                    clonedElement.style.transform = 'none';
                }
            }
        })

        // Remove the clone after capturing
        document.body.removeChild(clone)

        const imgData = canvas.toDataURL('image/jpeg', 1.0)
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(filename)

        if (onExportEnd) onExportEnd()
    } catch (error) {
        console.error('Error exporting PDF:', error)
        if (onExportEnd) onExportEnd()
    }
} 