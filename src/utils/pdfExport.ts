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
        onExportStart?.()

        // Create a clone of the report element
        const clone = reportElement.cloneNode(true) as HTMLElement
        document.body.appendChild(clone)

        // Apply appropriate styles based on the type of report
        if (isSummary) {
            setupSummaryStyles(clone)
        } else {
            setupBasicStyles(clone)
            setupTableStyles(clone)
            setupContentStyles(clone)
        }

        // Capture the clone with html2canvas
        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 2480, // A4 width at 300 DPI
            windowHeight: 3508, // A4 height at 300 DPI
        })

        // Remove the clone after capturing
        document.body.removeChild(clone)

        // Create PDF with appropriate orientation
        const pdf = new jsPDF({
            orientation: isSummary ? 'portrait' : 'landscape',
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