// Types for the mock data
type YearlyData = {
    [key: string]: {
        monthlyData: typeof baseMonthlyData;
        topJobsData: typeof baseTopJobsData;
        genderData: typeof baseGenderData;
        educationData: typeof baseEducationData;
        sectorData: typeof baseSectorData;
        quickStats: typeof baseQuickStats;
        monthlyGenderData: { male: number; female: number }[];
    };
};

// Base data structure for monthly performance
const baseMonthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        {
            label: 'Solicited Vacancies',
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            fill: true,
            data: [] as number[]
        },
        {
            label: 'Registered Applicants',
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            fill: true,
            data: [] as number[]
        },
        {
            label: 'Referred Applicants',
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.7)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            fill: true,
            data: [] as number[]
        },
        {
            label: 'Placed Applicants',
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            fill: true,
            data: [] as number[]
        }
    ]
};

// Base data structure for top jobs
const baseTopJobsData = {
    labels: [
        'IT Professionals',
        'Healthcare Workers',
        'Customer Service Representatives',
        'Sales Professionals',
        'Administrative Staff',
        'Engineers',
        'Teachers/Trainers',
        'Skilled Trade Workers',
        'Financial Analysts',
        'Digital Marketing Specialists'
    ],
    datasets: [{
        label: 'Available Positions',
        backgroundColor: '#2563eb',
        borderColor: '#1e40af',
        borderWidth: 1,
        data: [] as number[]
    }]
};

// Base data structure for gender distribution
const baseGenderData = {
    labels: ['Male', 'Female'],
    datasets: [{
        backgroundColor: ['rgba(71, 85, 105, 0.8)', 'rgba(156, 39, 176, 0.8)'],
        borderColor: ['rgb(51, 65, 85)', 'rgb(123, 31, 139)'],
        borderWidth: 1,
        data: [] as number[]
    }]
};

// Base data structure for education distribution
const baseEducationData = {
    labels: ['College Degree', 'Vocational', 'High School', 'Post-Graduate'],
    datasets: [{
        backgroundColor: [
            'rgba(71, 85, 105, 0.8)',   // Slate
            'rgba(20, 184, 166, 0.8)',   // Teal
            'rgba(234, 88, 12, 0.8)',    // Orange
            'rgba(109, 40, 217, 0.8)'    // Purple
        ],
        borderColor: [
            'rgb(51, 65, 85)',         // Darker Slate
            'rgb(17, 94, 89)',         // Darker Teal
            'rgb(194, 65, 12)',        // Darker Orange
            'rgb(88, 28, 135)'         // Darker Purple
        ],
        borderWidth: 1,
        data: [] as number[]
    }]
};

// Base data structure for sector distribution
const baseSectorData = {
    labels: ['Private Sector', 'Government', 'NGO/Non-Profit'],
    datasets: [{
        backgroundColor: [
            'rgba(71, 85, 105, 0.8)',   // Slate
            'rgba(20, 184, 166, 0.8)',   // Teal
            'rgba(109, 40, 217, 0.8)'    // Purple
        ],
        borderColor: [
            'rgb(51, 65, 85)',         // Darker Slate
            'rgb(17, 94, 89)',         // Darker Teal
            'rgb(88, 28, 135)'         // Darker Purple
        ],
        borderWidth: 1,
        data: [] as number[]
    }]
};

// Base data structure for quick stats
const baseQuickStats = {
    solicitedVacancies: { value: 0, change: 0 },
    registeredApplicants: { value: 0, change: 0 },
    referredApplicants: { value: 0, change: 0 },
    placedApplicants: { value: 0, change: 0 }
};

// Mock data for different years
const mockData: YearlyData = {
    '2024': {
        monthlyData: {
            ...baseMonthlyData,
            datasets: baseMonthlyData.datasets.map((dataset, index) => ({
                ...dataset,
                data: [
                    // Solicited Vacancies - Strong growth trend
                    [450, 520, 580, 650, 720, 800, 880, 950, 1020, 1100, 1180, 1250],
                    // Registered Applicants - Steady increase
                    [380, 440, 490, 550, 610, 670, 730, 790, 850, 910, 970, 1030],
                    // Referred Applicants - Following registration pattern
                    [320, 370, 420, 470, 520, 570, 620, 670, 720, 770, 820, 870],
                    // Placed Applicants - Successful placements
                    [250, 290, 330, 370, 410, 450, 490, 530, 570, 610, 650, 690]
                ][index]
            }))
        },
        topJobsData: {
            ...baseTopJobsData,
            datasets: [{
                ...baseTopJobsData.datasets[0],
                data: [1200, 980, 850, 720, 650, 580, 510, 450, 400, 350]
            }]
        },
        genderData: {
            ...baseGenderData,
            datasets: [{
                ...baseGenderData.datasets[0],
                data: [58, 42] // More balanced gender distribution
            }]
        },
        monthlyGenderData: [
            { male: 55, female: 45 }, // January
            { male: 56, female: 44 }, // February
            { male: 57, female: 43 }, // March
            { male: 58, female: 42 }, // April
            { male: 59, female: 41 }, // May
            { male: 60, female: 40 }, // June
            { male: 59, female: 41 }, // July
            { male: 58, female: 42 }, // August
            { male: 57, female: 43 }, // September
            { male: 56, female: 44 }, // October
            { male: 55, female: 45 }, // November
            { male: 54, female: 46 }  // December
        ],
        educationData: {
            ...baseEducationData,
            datasets: [{
                ...baseEducationData.datasets[0],
                data: [50, 25, 15, 10] // Higher proportion of college graduates
            }]
        },
        sectorData: {
            ...baseSectorData,
            datasets: [{
                ...baseSectorData.datasets[0],
                data: [70, 20, 10] // Strong private sector employment
            }]
        },
        quickStats: {
            solicitedVacancies: { value: 8500, change: 15.8 },
            registeredApplicants: { value: 7200, change: 12.5 },
            referredApplicants: { value: 6100, change: 10.2 },
            placedApplicants: { value: 4800, change: 8.7 }
        }
    },
    '2023': {
        monthlyData: {
            ...baseMonthlyData,
            datasets: baseMonthlyData.datasets.map((dataset, index) => ({
                ...dataset,
                data: [
                    // Solicited Vacancies - Recovery period
                    [320, 350, 390, 440, 500, 570, 650, 720, 780, 830, 870, 900],
                    // Registered Applicants - Gradual improvement
                    [280, 310, 350, 400, 460, 520, 590, 650, 700, 740, 770, 790],
                    // Referred Applicants - Steady progress
                    [230, 260, 300, 350, 410, 470, 530, 580, 620, 650, 670, 680],
                    // Placed Applicants - Moderate success
                    [180, 210, 250, 300, 360, 410, 460, 500, 530, 550, 560, 570]
                ][index]
            }))
        },
        topJobsData: {
            ...baseTopJobsData,
            datasets: [{
                ...baseTopJobsData.datasets[0],
                data: [850, 720, 600, 520, 450, 400, 360, 320, 290, 260]
            }]
        },
        genderData: {
            ...baseGenderData,
            datasets: [{
                ...baseGenderData.datasets[0],
                data: [62, 38] // More gender gap
            }]
        },
        monthlyGenderData: [
            { male: 60, female: 40 }, // January
            { male: 61, female: 39 }, // February
            { male: 62, female: 38 }, // March
            { male: 63, female: 37 }, // April
            { male: 64, female: 36 }, // May
            { male: 65, female: 35 }, // June
            { male: 64, female: 36 }, // July
            { male: 63, female: 37 }, // August
            { male: 62, female: 38 }, // September
            { male: 61, female: 39 }, // October
            { male: 60, female: 40 }, // November
            { male: 59, female: 41 }  // December
        ],
        educationData: {
            ...baseEducationData,
            datasets: [{
                ...baseEducationData.datasets[0],
                data: [42, 28, 20, 10] // More diverse education distribution
            }]
        },
        sectorData: {
            ...baseSectorData,
            datasets: [{
                ...baseSectorData.datasets[0],
                data: [65, 25, 10] // Balanced sector distribution
            }]
        },
        quickStats: {
            solicitedVacancies: { value: 6200, change: 10.5 },
            registeredApplicants: { value: 5400, change: 8.3 },
            referredApplicants: { value: 4500, change: 6.9 },
            placedApplicants: { value: 3600, change: 5.4 }
        }
    },
    '2022': {
        monthlyData: {
            ...baseMonthlyData,
            datasets: baseMonthlyData.datasets.map((dataset, index) => ({
                ...dataset,
                data: [
                    // Solicited Vacancies - Post-pandemic recovery
                    [250, 270, 290, 320, 350, 390, 440, 480, 510, 530, 540, 550],
                    // Registered Applicants - Initial challenges
                    [220, 240, 260, 290, 320, 360, 400, 430, 450, 460, 470, 480],
                    // Referred Applicants - Building momentum
                    [180, 200, 220, 250, 280, 320, 350, 370, 380, 390, 395, 400],
                    // Placed Applicants - Early stage
                    [140, 160, 180, 210, 240, 270, 290, 300, 310, 315, 320, 325]
                ][index]
            }))
        },
        topJobsData: {
            ...baseTopJobsData,
            datasets: [{
                ...baseTopJobsData.datasets[0],
                data: [600, 520, 450, 400, 360, 320, 290, 260, 240, 220]
            }]
        },
        genderData: {
            ...baseGenderData,
            datasets: [{
                ...baseGenderData.datasets[0],
                data: [65, 35] // Significant gender gap
            }]
        },
        monthlyGenderData: [
            { male: 63, female: 37 }, // January
            { male: 64, female: 36 }, // February
            { male: 65, female: 35 }, // March
            { male: 66, female: 34 }, // April
            { male: 67, female: 33 }, // May
            { male: 68, female: 32 }, // June
            { male: 67, female: 33 }, // July
            { male: 66, female: 34 }, // August
            { male: 65, female: 35 }, // September
            { male: 64, female: 36 }, // October
            { male: 63, female: 37 }, // November
            { male: 62, female: 38 }  // December
        ],
        educationData: {
            ...baseEducationData,
            datasets: [{
                ...baseEducationData.datasets[0],
                data: [35, 30, 25, 10] // More even distribution
            }]
        },
        sectorData: {
            ...baseSectorData,
            datasets: [{
                ...baseSectorData.datasets[0],
                data: [60, 30, 10] // Government sector focus
            }]
        },
        quickStats: {
            solicitedVacancies: { value: 4800, change: 7.2 },
            registeredApplicants: { value: 4200, change: 5.8 },
            referredApplicants: { value: 3500, change: 4.5 },
            placedApplicants: { value: 2800, change: 3.2 }
        }
    }
};

// Function to get dashboard data for a specific period
export function getDashboardData(period: string) {
    const year = period.length === 4 ? period : '2024'; // Default to 2024 if not a year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate monthly gender distribution data
    const monthlyGenderData = months.map(() => {
        const malePercentage = Math.floor(Math.random() * 20) + 45; // Random between 45-65
        return {
            male: malePercentage,
            female: 100 - malePercentage
        };
    });

    // Get the base data for the year
    const yearData = mockData[year] || mockData['2024']; // Default to 2024 if year not found

    // Return combined data
    return {
        ...yearData,
        monthlyGenderData
    };
} 