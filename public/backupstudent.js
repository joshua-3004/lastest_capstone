

// Sample curriculum data for different programs, years, and terms
const curriculumData = {
    'BSIT': {
        '1st Year': {
            '1st Term': [
                { code: 'IT 101', description: 'Introduction to Computing', section: 'A', units: 3, prereq: '-', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 102', description: 'Computer Programming 1', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '10:00-11:30' },
                { code: 'GE 01', description: 'Mathematics in the Modern World', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 02', description: 'Understanding the Self', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 01', description: 'Physical Education 1', section: 'C', units: 2, prereq: '-', day: 'SAT', time: '08:00-10:00' }
            ],
            '2nd Term': [
                { code: 'IT 103', description: 'Computer Programming 2', section: 'A', units: 3, prereq: 'IT 102', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 104', description: 'Web Systems and Technologies', section: 'A', units: 3, prereq: 'IT 101', day: 'TTH', time: '10:00-11:30' },
                { code: 'GE 03', description: 'The Contemporary World', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 04', description: 'Purposive Communication', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 02', description: 'Physical Education 2', section: 'C', units: 2, prereq: 'PE 01', day: 'SAT', time: '08:00-10:00' }
            ],
            '3rd Term': [
                { code: 'IT 105', description: 'Data Structures and Algorithms', section: 'A', units: 3, prereq: 'IT 103', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 106', description: 'Database Management Systems', section: 'A', units: 3, prereq: 'IT 104', day: 'TTH', time: '10:00-11:30' },
                { code: 'GE 05', description: 'Art Appreciation', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 06', description: 'Science, Technology and Society', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 03', description: 'Physical Education 3', section: 'C', units: 2, prereq: 'PE 02', day: 'SAT', time: '08:00-10:00' }
            ]
        },
        '2nd Year': {
            '1st Term': [
                { code: 'IT 201', description: 'Object-Oriented Programming', section: 'A', units: 3, prereq: 'IT 105', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 202', description: 'Systems Analysis and Design', section: 'A', units: 3, prereq: 'IT 106', day: 'TTH', time: '10:00-11:30' },
                { code: 'IT 203', description: 'Human Computer Interaction', section: 'B', units: 3, prereq: 'IT 104', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 07', description: 'Ethics and Social Responsibility', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 04', description: 'Physical Education 4', section: 'C', units: 2, prereq: 'PE 03', day: 'SAT', time: '08:00-10:00' }
            ],
            '2nd Term': [
                { code: 'IT 204', description: 'Network Technologies', section: 'A', units: 3, prereq: 'IT 201', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 205', description: 'Software Engineering', section: 'A', units: 3, prereq: 'IT 202', day: 'TTH', time: '10:00-11:30' },
                { code: 'IT 206', description: 'Information Security', section: 'B', units: 3, prereq: 'IT 204', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 08', description: 'Readings in Philippine History', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'NSTP 01', description: 'National Service Training Program 1', section: 'C', units: 3, prereq: '-', day: 'SAT', time: '08:00-11:00' }
            ],
            '3rd Term': [
                { code: 'IT 207', description: 'Mobile Application Development', section: 'A', units: 3, prereq: 'IT 205', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 208', description: 'Advanced Database Systems', section: 'A', units: 3, prereq: 'IT 106', day: 'TTH', time: '10:00-11:30' },
                { code: 'IT 209', description: 'IT Project Management', section: 'B', units: 3, prereq: 'IT 202', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 09', description: 'Life and Works of Rizal', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'NSTP 02', description: 'National Service Training Program 2', section: 'C', units: 3, prereq: 'NSTP 01', day: 'SAT', time: '08:00-11:00' }
            ]
        },
        '3rd Year': {
            '1st Term': [
                { code: 'IT 301', description: 'Systems Integration and Architecture', section: 'A', units: 3, prereq: 'IT 207', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 302', description: 'Web Application Development', section: 'A', units: 3, prereq: 'IT 208', day: 'TTH', time: '10:00-11:30' },
                { code: 'IT 303', description: 'IT Capstone Project 1', section: 'B', units: 3, prereq: 'IT 209', day: 'MWF', time: '13:00-14:00' },
                { code: 'IT 304', description: 'Advanced Programming', section: 'A', units: 3, prereq: 'IT 207', day: 'TTH', time: '14:00-15:30' },
                { code: 'ELEC 01', description: 'IT Elective 1', section: 'C', units: 3, prereq: '-', day: 'SAT', time: '08:00-11:00' }
            ],
            '2nd Term': [
                { code: 'IT 305', description: 'Machine Learning and AI', section: 'A', units: 3, prereq: 'IT 301', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 306', description: 'Cloud Computing', section: 'A', units: 3, prereq: 'IT 302', day: 'TTH', time: '10:00-11:30' },
                { code: 'IT 307', description: 'IT Capstone Project 2', section: 'B', units: 3, prereq: 'IT 303', day: 'MWF', time: '13:00-14:00' },
                { code: 'IT 308', description: 'DevOps and Automation', section: 'A', units: 3, prereq: 'IT 304', day: 'TTH', time: '14:00-15:30' },
                { code: 'ELEC 02', description: 'IT Elective 2', section: 'C', units: 3, prereq: 'ELEC 01', day: 'SAT', time: '08:00-11:00' }
            ],
            '3rd Term': [
                { code: 'IT 309', description: 'Emerging Technologies', section: 'A', units: 3, prereq: 'IT 305', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 310', description: 'IT Audit and Compliance', section: 'A', units: 3, prereq: 'IT 306', day: 'TTH', time: '10:00-11:30' },
                { code: 'IT 311', description: 'Professional Issues in IT', section: 'B', units: 3, prereq: 'IT 307', day: 'MWF', time: '13:00-14:00' },
                { code: 'IT 312', description: 'Internship/Practicum', section: 'A', units: 6, prereq: 'IT 308', day: 'MTW', time: '08:00-17:00' }
            ]
        },
        '4th Year': {
            '1st Term': [
                { code: 'IT 401', description: 'Advanced Systems Development', section: 'A', units: 3, prereq: 'IT 309', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 402', description: 'IT Research Methods', section: 'A', units: 3, prereq: 'IT 310', day: 'TTH', time: '10:00-11:30' },
                { code: 'IT 403', description: 'Thesis/Capstone Project', section: 'B', units: 6, prereq: 'IT 311', day: 'MWF', time: '13:00-16:00' },
                { code: 'ELEC 03', description: 'IT Elective 3', section: 'C', units: 3, prereq: 'ELEC 02', day: 'SAT', time: '08:00-11:00' }
            ],
            '2nd Term': [
                { code: 'IT 404', description: 'IT Entrepreneurship', section: 'A', units: 3, prereq: 'IT 401', day: 'MWF', time: '08:00-09:00' },
                { code: 'IT 405', description: 'Advanced Database Administration', section: 'A', units: 3, prereq: 'IT 402', day: 'TTH', time: '10:00-11:30' },
                { code: 'IT 406', description: 'Thesis/Capstone Project 2', section: 'B', units: 6, prereq: 'IT 403', day: 'MWF', time: '13:00-16:00' },
                { code: 'ELEC 04', description: 'IT Elective 4', section: 'C', units: 3, prereq: 'ELEC 03', day: 'SAT', time: '08:00-11:00' }
            ]
        }
    },
    'BSCS': {
        '1st Year': {
            '1st Term': [
                { code: 'CS 101', description: 'Introduction to Computer Science', section: 'A', units: 3, prereq: '-', day: 'MWF', time: '08:00-09:00' },
                { code: 'CS 102', description: 'Programming Fundamentals', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '10:00-11:30' },
                { code: 'MATH 01', description: 'Calculus 1', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 01', description: 'Understanding the Self', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 01', description: 'Physical Education 1', section: 'C', units: 2, prereq: '-', day: 'SAT', time: '08:00-10:00' }
            ],
            '2nd Term': [
                { code: 'CS 103', description: 'Object-Oriented Programming', section: 'A', units: 3, prereq: 'CS 102', day: 'MWF', time: '08:00-09:00' },
                { code: 'CS 104', description: 'Discrete Mathematics', section: 'A', units: 3, prereq: 'MATH 01', day: 'TTH', time: '10:00-11:30' },
                { code: 'MATH 02', description: 'Calculus 2', section: 'B', units: 3, prereq: 'MATH 01', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 02', description: 'Purposive Communication', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 02', description: 'Physical Education 2', section: 'C', units: 2, prereq: 'PE 01', day: 'SAT', time: '08:00-10:00' }
            ],
            '3rd Term': [
                { code: 'CS 105', description: 'Data Structures', section: 'A', units: 3, prereq: 'CS 103', day: 'MWF', time: '08:00-09:00' },
                { code: 'CS 106', description: 'Computer Organization', section: 'A', units: 3, prereq: 'CS 104', day: 'TTH', time: '10:00-11:30' },
                { code: 'MATH 03', description: 'Linear Algebra', section: 'B', units: 3, prereq: 'MATH 02', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 03', description: 'The Contemporary World', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 03', description: 'Physical Education 3', section: 'C', units: 2, prereq: 'PE 02', day: 'SAT', time: '08:00-10:00' }
            ]
        }
    },
    'BSIS': {
        '1st Year': {
            '1st Term': [
                { code: 'IS 101', description: 'Introduction to Information Systems', section: 'A', units: 3, prereq: '-', day: 'MWF', time: '08:00-09:00' },
                { code: 'IS 102', description: 'Programming Logic and Design', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '10:00-11:30' },
                { code: 'GE 01', description: 'Mathematics in the Modern World', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 02', description: 'Understanding the Self', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 01', description: 'Physical Education 1', section: 'C', units: 2, prereq: '-', day: 'SAT', time: '08:00-10:00' }
            ],
            '2nd Term': [
                { code: 'IS 103', description: 'Business Process Management', section: 'A', units: 3, prereq: 'IS 101', day: 'MWF', time: '08:00-09:00' },
                { code: 'IS 104', description: 'Database Systems', section: 'A', units: 3, prereq: 'IS 102', day: 'TTH', time: '10:00-11:30' },
                { code: 'GE 03', description: 'The Contemporary World', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 04', description: 'Purposive Communication', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 02', description: 'Physical Education 2', section: 'C', units: 2, prereq: 'PE 01', day: 'SAT', time: '08:00-10:00' }
            ],
            '3rd Term': [
                { code: 'IS 105', description: 'Systems Analysis', section: 'A', units: 3, prereq: 'IS 103', day: 'MWF', time: '08:00-09:00' },
                { code: 'IS 106', description: 'Information Systems Security', section: 'A', units: 3, prereq: 'IS 104', day: 'TTH', time: '10:00-11:30' },
                { code: 'GE 05', description: 'Art Appreciation', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 06', description: 'Science, Technology and Society', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 03', description: 'Physical Education 3', section: 'C', units: 2, prereq: 'PE 02', day: 'SAT', time: '08:00-10:00' }
            ]
        }
    },
    'BSBA': {
        '1st Year': {
            '1st Term': [
                { code: 'BA 101', description: 'Introduction to Business', section: 'A', units: 3, prereq: '-', day: 'MWF', time: '08:00-09:00' },
                { code: 'BA 102', description: 'Business Mathematics', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '10:00-11:30' },
                { code: 'GE 01', description: 'Mathematics in the Modern World', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 02', description: 'Understanding the Self', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 01', description: 'Physical Education 1', section: 'C', units: 2, prereq: '-', day: 'SAT', time: '08:00-10:00' }
            ],
            '2nd Term': [
                { code: 'BA 103', description: 'Principles of Management', section: 'A', units: 3, prereq: 'BA 101', day: 'MWF', time: '08:00-09:00' },
                { code: 'BA 104', description: 'Financial Accounting', section: 'A', units: 3, prereq: 'BA 102', day: 'TTH', time: '10:00-11:30' },
                { code: 'GE 03', description: 'The Contemporary World', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 04', description: 'Purposive Communication', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 02', description: 'Physical Education 2', section: 'C', units: 2, prereq: 'PE 01', day: 'SAT', time: '08:00-10:00' }
            ],
            '3rd Term': [
                { code: 'BA 105', description: 'Marketing Management', section: 'A', units: 3, prereq: 'BA 103', day: 'MWF', time: '08:00-09:00' },
                { code: 'BA 106', description: 'Business Statistics', section: 'A', units: 3, prereq: 'BA 104', day: 'TTH', time: '10:00-11:30' },
                { code: 'GE 05', description: 'Art Appreciation', section: 'B', units: 3, prereq: '-', day: 'MWF', time: '13:00-14:00' },
                { code: 'GE 06', description: 'Science, Technology and Society', section: 'A', units: 3, prereq: '-', day: 'TTH', time: '14:00-15:30' },
                { code: 'PE 03', description: 'Physical Education 3', section: 'C', units: 2, prereq: 'PE 02', day: 'SAT', time: '08:00-10:00' }
            ]
        }
    }
};

// Program title mappings
const programTitles = {
    'BSIT': 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY',
    'BSCS': 'BACHELOR OF SCIENCE IN COMPUTER SCIENCE',
    'BSIS': 'BACHELOR OF SCIENCE IN INFORMATION SYSTEMS',
    'BSBA': 'BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION'
};

// DOM elements
const enrollmentForm = document.getElementById('enrollmentForm');
const programCards = document.querySelectorAll('input[name="program"]');
const yearCards = document.querySelectorAll('input[name="yearLevel"]');
const termCards = document.querySelectorAll('input[name="academicTerm"]');
const selectedProgram = document.getElementById('selectedProgram');
const selectedYear = document.getElementById('selectedYear');
const selectedTerm = document.getElementById('selectedTerm');
const successMessage = document.getElementById('successMessage');
const curriculumModal = document.getElementById('curriculumModal');



// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for form interactions
    programCards.forEach(card => {
        card.addEventListener('change', handleProgramChange);
    });

    yearCards.forEach(card => {
        card.addEventListener('change', handleYearChange);
    });

    termCards.forEach(card => {
        card.addEventListener('change', handleTermChange);
    });

    // Handle card selection visual feedback
    document.querySelectorAll('.selection-card, .year-card, .term-card').forEach(card => {
        card.addEventListener('click', function() {
            const input = this.querySelector('input[type="radio"]');
            if (input) {
                input.checked = true;
                updateCardSelection(input.name);
                updateSummary();
            }
        });
    });

    // Form submission
    enrollmentForm.addEventListener('submit', handleFormSubmit);

    // Modal close event
    window.addEventListener('click', function(event) {
        if (event.target === curriculumModal) {
            closeModal();
        }
    });
});

// Handle program selection
function handleProgramChange() {
    updateCardSelection('program');
    updateSummary();
}

// Handle year level selection
function handleYearChange() {
    updateCardSelection('yearLevel');
    updateSummary();
}

// Handle term selection
function handleTermChange() {
    updateCardSelection('academicTerm');
    updateSummary();
}

// Update card visual selection
function updateCardSelection(name) {
    const cards = document.querySelectorAll(`input[name="${name}"]`);
    cards.forEach(card => {
        const cardElement = card.closest('.selection-card, .year-card, .term-card');
        if (card.checked) {
            cardElement.classList.add('selected');
        } else {
            cardElement.classList.remove('selected');
        }
    });
}

// Update enrollment summary
function updateSummary() {
    const program = document.querySelector('input[name="program"]:checked');
    const year = document.querySelector('input[name="yearLevel"]:checked');
    const term = document.querySelector('input[name="academicTerm"]:checked');

    selectedProgram.textContent = program ? program.value : 'Not selected';
    selectedProgram.className = program ? 'summary-value' : 'summary-value not-selected';

    selectedYear.textContent = year ? year.value : 'Not selected';
    selectedYear.className = year ? 'summary-value' : 'summary-value not-selected';

    selectedTerm.textContent = term ? term.value : 'Not selected';
    selectedTerm.className = term ? 'summary-value' : 'summary-value not-selected';
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const program = document.querySelector('input[name="program"]:checked');
    const year = document.querySelector('input[name="yearLevel"]:checked');
    const term = document.querySelector('input[name="academicTerm"]:checked');

    if (!program || !year || !term) {
        alert('Please select all required fields before submitting.');
        return;
    }

    // Show success message
    successMessage.classList.add('show');
    
    // Hide success message after 3 seconds and show modal
    setTimeout(() => {
        successMessage.classList.remove('show');
        showCurriculumModal(program.value, year.value, term.value);
    }, 3000);
}

// Show curriculum modal
function showCurriculumModal(program, year, term) {
    // Update modal header information
    document.getElementById('modalCourseTitle').textContent = programTitles[program];
    document.getElementById('modalYearLevel').textContent = year.toUpperCase();
    document.getElementById('modalTermLevel').textContent = term.toUpperCase();
    document.getElementById('modalProgram').textContent = program;
    document.getElementById('modalYear').textContent = year;
    document.getElementById('modalTerm').textContent = term;

    // Get curriculum data
    const subjects = getCurriculumData(program, year, term);
    
    // Calculate total units
    const totalUnits = subjects.reduce((sum, subject) => sum + subject.units, 0);
    document.getElementById('totalUnits').textContent = totalUnits;

    // Populate table
    populateTable(subjects);

    // Show modal
    curriculumModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Get curriculum data based on selection
function getCurriculumData(program, year, term) {
    if (curriculumData[program] && curriculumData[program][year] && curriculumData[program][year][term]) {
        return curriculumData[program][year][term];
    }
    
    // Return default data if not found
    return [
        { code: 'N/A', description: 'No curriculum data available', section: '-', units: 0, prereq: '-', day: '-', time: '-' }
    ];
}

// Populate curriculum table
function populateTable(subjects) {
    const tableBody = document.getElementById('modalTableBody');
    tableBody.innerHTML = '';

    subjects.forEach(subject => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subject.code}</td>
            <td>${subject.description}</td>
            <td>${subject.section}</td>
            <td class="units-cell">${subject.units}</td>
            <td class="prereq-cell">${subject.prereq}</td>
            <td class="day-cell">${subject.day}</td>
            <td class="time-cell">${subject.time}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Close modal
function closeModal() {
    curriculumModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Reset form
function resetForm() {
    // Reset all form inputs
    enrollmentForm.reset();
    
    // Remove all selected classes
    document.querySelectorAll('.selection-card, .year-card, .term-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset summary
    selectedProgram.textContent = 'Not selected';
    selectedProgram.className = 'summary-value not-selected';
    selectedYear.textContent = 'Not selected';
    selectedYear.className = 'summary-value not-selected';
    selectedTerm.textContent = 'Not selected';
    selectedTerm.className = 'summary-value not-selected';
    
    // Hide success message
    successMessage.classList.remove('show');
    
    // Close modal if open
    closeModal();
}

// Keyboard navigation for modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && curriculumModal.classList.contains('show')) {
        closeModal();
    }
});

// Print functionality
function printCurriculum() {
    const printContent = document.getElementById('curriculumModal').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    
    // Re-initialize event listeners after restoring content
    location.reload();
}

// Download curriculum as PDF (basic implementation)
function downloadCurriculum() {
    // Create a simple text version for download
    const program = document.getElementById('modalProgram').textContent;
    const year = document.getElementById('modalYear').textContent;
    const term = document.getElementById('modalTerm').textContent;
    
    const subjects = getCurriculumData(program, year, term);
    const totalUnits = subjects.reduce((sum, subject) => sum + subject.units, 0);
    
    let content = `ENROLLMENT DETAILS\n`;
    content += `Program: ${program}\n`;
    content += `Year Level: ${year}\n`;
    content += `Term: ${term}\n`;
    content += `Total Units: ${totalUnits}\n\n`;
    content += `CURRICULUM:\n`;
    content += `${'CODE'.padEnd(12)} ${'DESCRIPTION'.padEnd(35)} ${'SEC'.padEnd(5)} ${'UNITS'.padEnd(7)} ${'PREREQ'.padEnd(12)} ${'DAY'.padEnd(8)} ${'TIME'.padEnd(15)}\n`;
    content += `${'='.repeat(100)}\n`;
    
    subjects.forEach(subject => {
        content += `${subject.code.padEnd(12)} ${subject.description.padEnd(35)} ${subject.section.padEnd(5)} ${subject.units.toString().padEnd(7)} ${subject.prereq.padEnd(12)} ${subject.day.padEnd(8)} ${subject.time.padEnd(15)}\n`;
    });
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${program}_${year}_${term}_Curriculum.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Search functionality for subjects
function searchSubjects(searchTerm) {
    const rows = document.querySelectorAll('#modalTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Add search functionality to modal
function addSearchToModal() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search subjects...';
    searchInput.className = 'search-input';
    searchInput.addEventListener('input', function() {
        searchSubjects(this.value);
    });
    
    const modalHeader = document.querySelector('.modal-header');
    if (modalHeader && !modalHeader.querySelector('.search-input')) {
        modalHeader.appendChild(searchInput);
    }
}

// Enhanced form validation
function validateForm() {
    const program = document.querySelector('input[name="program"]:checked');
    const year = document.querySelector('input[name="yearLevel"]:checked');
    const term = document.querySelector('input[name="academicTerm"]:checked');
    
    const errors = [];
    
    if (!program) errors.push('Please select a program');
    if (!year) errors.push('Please select a year level');
    if (!term) errors.push('Please select an academic term');
    
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }
    
    return true;
}

// Enhanced form submission with validation
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const program = document.querySelector('input[name="program"]:checked');
    const year = document.querySelector('input[name="yearLevel"]:checked');
    const term = document.querySelector('input[name="academicTerm"]:checked');

    // Show success message
    successMessage.classList.add('show');
    
    // Hide success message after 3 seconds and show modal
    setTimeout(() => {
        successMessage.classList.remove('show');
        showCurriculumModal(program.value, year.value, term.value);
    }, 3000);
}

// Enhanced modal display with search functionality
function showCurriculumModal(program, year, term) {
    // Update modal header information
    document.getElementById('modalCourseTitle').textContent = programTitles[program];
    document.getElementById('modalYearLevel').textContent = year.toUpperCase();
    document.getElementById('modalTermLevel').textContent = term.toUpperCase();
    document.getElementById('modalProgram').textContent = program;
    document.getElementById('modalYear').textContent = year;
    document.getElementById('modalTerm').textContent = term;

    // Get curriculum data
    const subjects = getCurriculumData(program, year, term);
    
    // Calculate total units
    const totalUnits = subjects.reduce((sum, subject) => sum + subject.units, 0);
    document.getElementById('totalUnits').textContent = totalUnits;

    // Populate table
    populateTable(subjects);

    // Add search functionality
    addSearchToModal();

    // Show modal
    curriculumModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Local storage functionality for form data persistence
function saveFormData() {
    const program = document.querySelector('input[name="program"]:checked');
    const year = document.querySelector('input[name="yearLevel"]:checked');
    const term = document.querySelector('input[name="academicTerm"]:checked');
    
    const formData = {
        program: program ? program.value : null,
        year: year ? year.value : null,
        term: term ? term.value : null,
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem('enrollmentFormData', JSON.stringify(formData));
    } catch (e) {
        console.log('Unable to save form data to localStorage');
    }
}

// Load saved form data
function loadFormData() {
    try {
        const savedData = localStorage.getItem('enrollmentFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            // Check if data is not too old (24 hours)
            const dayInMs = 24 * 60 * 60 * 1000;
            if (Date.now() - formData.timestamp < dayInMs) {
                if (formData.program) {
                    const programInput = document.querySelector(`input[name="program"][value="${formData.program}"]`);
                    if (programInput) {
                        programInput.checked = true;
                        updateCardSelection('program');
                    }
                }
                
                if (formData.year) {
                    const yearInput = document.querySelector(`input[name="yearLevel"][value="${formData.year}"]`);
                    if (yearInput) {
                        yearInput.checked = true;
                        updateCardSelection('yearLevel');
                    }
                }
                
                if (formData.term) {
                    const termInput = document.querySelector(`input[name="academicTerm"][value="${formData.term}"]`);
                    if (termInput) {
                        termInput.checked = true;
                        updateCardSelection('academicTerm');
                    }
                }
                
                updateSummary();
            }
        }
    } catch (e) {
        console.log('Unable to load form data from localStorage');
    }
}

// Save form data when selections change
document.addEventListener('change', function(event) {
    if (event.target.name === 'program' || event.target.name === 'yearLevel' || event.target.name === 'academicTerm') {
        saveFormData();
    }
});

// Enhanced initialization
document.addEventListener('DOMContentLoaded', function() {
    // Load saved form data
    loadFormData();
    
    // Add event listeners for form interactions
    programCards.forEach(card => {
        card.addEventListener('change', handleProgramChange);
    });

    yearCards.forEach(card => {
        card.addEventListener('change', handleYearChange);
    });

    termCards.forEach(card => {
        card.addEventListener('change', handleTermChange);
    });

    // Handle card selection visual feedback
    document.querySelectorAll('.selection-card, .year-card, .term-card').forEach(card => {
        card.addEventListener('click', function() {
            const input = this.querySelector('input[type="radio"]');
            if (input) {
                input.checked = true;
                updateCardSelection(input.name);
                updateSummary();
            }
        });
    });

    // Form submission
    enrollmentForm.addEventListener('submit', handleFormSubmit);

    // Modal close event
    window.addEventListener('click', function(event) {
        if (event.target === curriculumModal) {
            closeModal();
        }
    });

    // Initialize summary
    updateSummary();
});

// Utility function to format time display
function formatTime(time) {
    if (!time || time === '-') return '-';
    
    const [start, end] = time.split('-');
    if (!start || !end) return time;
    
    const formatSingleTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return `${formatSingleTime(start)} - ${formatSingleTime(end)}`;
}

// Enhanced table population with better formatting
function populateTable(subjects) {
    const tableBody = document.getElementById('modalTableBody');
    tableBody.innerHTML = '';

    subjects.forEach(subject => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="code-cell">${subject.code}</td>
            <td class="description-cell">${subject.description}</td>
            <td class="section-cell">${subject.section}</td>
            <td class="units-cell">${subject.units}</td>
            <td class="prereq-cell">${subject.prereq}</td>
            <td class="day-cell">${subject.day}</td>
            <td class="time-cell">${formatTime(subject.time)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Clear localStorage on reset
function resetForm() {
    // Reset all form inputs
    enrollmentForm.reset();
    
    // Remove all selected classes
    document.querySelectorAll('.selection-card, .year-card, .term-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset summary
    selectedProgram.textContent = 'Not selected';
    selectedProgram.className = 'summary-value not-selected';
    selectedYear.textContent = 'Not selected';
    selectedYear.className = 'summary-value not-selected';
    selectedTerm.textContent = 'Not selected';
    selectedTerm.className = 'summary-value not-selected';
    
    // Hide success message
    successMessage.classList.remove('show');
    
    // Close modal if open
    closeModal();
    
    // Clear saved data
    try {
        localStorage.removeItem('enrollmentFormData');
    } catch (e) {
        console.log('Unable to clear localStorage');
    }
}