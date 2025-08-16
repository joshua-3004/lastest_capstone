// Student Management System - Clean Implementation
class StudentsManager {
    constructor() {
        this.currentPage = 1;
        this.limit = 10;
        this.currentFilters = {
            search: '',
            program: '',
            year: ''
        };
        this.editingStudentId = null;

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.initializeElements();
        this.bindEvents();
        this.loadStudents();
    }

    initializeElements() {
        // Only initialize if elements exist
        this.studentsTable = document.getElementById('studentsTable');
        this.studentsTableBody = document.getElementById('studentsTableBody');
        this.loadingState = document.getElementById('loadingState');
        this.emptyState = document.getElementById('emptyState');
        this.pagination = document.getElementById('pagination');

        // Filter elements
        this.searchInput = document.getElementById('searchInput');
        this.programFilter = document.getElementById('programFilter');
        this.yearFilter = document.getElementById('yearFilter');

        // Modal elements
        this.studentModal = document.getElementById('studentModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.studentForm = document.getElementById('studentForm');
        this.addStudentBtn = document.getElementById('addStudentBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.submitBtn = document.getElementById('submitBtn');

        // Form inputs
        this.firstNameInput = document.getElementById('firstName');
        this.lastNameInput = document.getElementById('lastName');
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        this.programInput = document.getElementById('program');
        this.yearLevelInput = document.getElementById('yearLevel');
        this.dateOfBirthInput = document.getElementById('dateOfBirth');
        this.addressInput = document.getElementById('address');

        // Stats elements
        this.bsitStudents = document.getElementById('bsitStudents');
        this.bscsStudents = document.getElementById('bscsStudents');
        this.bsisStudents = document.getElementById('bsisStudents');
        this.bsbaStudents = document.getElementById('bsbaStudents');
        this.totalStudents = document.getElementById('totalStudents');
    }

    bindEvents() {
        // Only bind events if elements exist
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(() => {
                this.currentFilters.search = this.searchInput.value;
                this.currentPage = 1;
                this.loadStudents();
            }, 300));
        }

        if (this.programFilter) {
            this.programFilter.addEventListener('change', () => {
                this.currentFilters.program = this.programFilter.value;
                this.currentPage = 1;
                this.loadStudents();
            });
        }

        if (this.yearFilter) {
            this.yearFilter.addEventListener('change', () => {
                this.currentFilters.year = this.yearFilter.value;
                this.currentPage = 1;
                this.loadStudents();
            });
        }

        // Modal events
        if (this.addStudentBtn) {
            this.addStudentBtn.addEventListener('click', () => this.openModal());
        }

        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Form submission
        if (this.studentForm) {
            this.studentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Close modal when clicking outside
        if (this.studentModal) {
            this.studentModal.addEventListener('click', (e) => {
                if (e.target === this.studentModal) {
                    this.closeModal();
                }
            });
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async loadStudents() {
    try {
        this.showLoading();
        
        const params = new URLSearchParams({
            page: this.currentPage,
            limit: this.limit,
            ...this.currentFilters
        });

        console.log('Making API request to:', `/api/studentinfo/students?${params}`);

        const response = await fetch(`/api/studentinfo/students?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        this.renderStudents(data.students || []);
        this.renderPagination(data.pagination || { currentPage: 1, totalPages: 1, totalStudents: 0, limit: 10 });
        this.updateStats(data.stats || []);
        
    } catch (error) {
        console.error('Error loading students:', error);
        this.showError(`Failed to load students: ${error.message}`);
    }
}

    showLoading() {
        if (this.loadingState) this.loadingState.style.display = 'block';
        if (this.studentsTable) this.studentsTable.style.display = 'none';
        if (this.emptyState) this.emptyState.style.display = 'none';
        if (this.pagination) this.pagination.style.display = 'none';
    }

    renderStudents(students) {
        if (this.loadingState) this.loadingState.style.display = 'none';

        if (students.length === 0) {
            if (this.studentsTable) this.studentsTable.style.display = 'none';
            if (this.emptyState) this.emptyState.style.display = 'block';
            if (this.pagination) this.pagination.style.display = 'none';
            return;
        }

        if (this.studentsTable) this.studentsTable.style.display = 'table';
        if (this.emptyState) this.emptyState.style.display = 'none';

        if (this.studentsTableBody) {
            this.studentsTableBody.innerHTML = students.map(student => `
                <tr>
    <td>
        <div class="student-info">
            <div class="student-avatar">
                ${this.getInitials(student.first_name, student.last_name)}
            </div>
            <div class="student-details">
                <h4>${this.escapeHtml(student.first_name)} ${this.escapeHtml(student.last_name)}</h4>
                <p>ID: ${this.escapeHtml(student.student_id)}</p>
            </div>
        </div>
    </td>
    <td>${this.escapeHtml(student.student_id)}</td>
    <td>
        <span class="badge ${this.getStudentTypeBadgeClass(student.student_type)}">
            ${this.formatStudentType(student.student_type)}
        </span>
    </td>
    <td>${this.escapeHtml(student.email)}</td>
    <td>
        <span class="badge badge-info">
            ${this.formatProgram(student.major)}
        </span>
    </td>
    <td>
        <span class="badge badge-success">
            ${this.formatYearLevel(student.year_level)}
        </span>
    </td>
    <td>${student.phone ? this.escapeHtml(student.phone) : 'N/A'}</td>
    <td>
        <div class="actions">
            <button class="btn btn-warning btn-sm" onclick="window.studentsManager.editStudent(${student.id})">
                ✏️ Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.studentsManager.deleteStudent(${student.id}, '${this.escapeHtml(student.first_name)} ${this.escapeHtml(student.last_name)}')">
                🗑️ Delete
            </button>
        </div>
    </td>
</tr>
            `).join('');
        }
    }

    renderPagination(pagination) {
        if (!this.pagination) return;

        if (pagination.totalPages <= 1) {
            this.pagination.style.display = 'none';
            return;
        }

        this.pagination.style.display = 'flex';

        let paginationHTML = '';

        // Previous button
        if (pagination.currentPage > 1) {
            paginationHTML += `
                <button class="page-btn" onclick="window.studentsManager.changePage(${pagination.currentPage - 1})">
                    Previous
                </button>
            `;
        }

        // Page numbers
        const startPage = Math.max(1, pagination.currentPage - 2);
        const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === pagination.currentPage ? 'active' : ''}" 
                        onclick="window.studentsManager.changePage(${i})">
                    ${i}
                </button>
            `;
        }

        // Next button
        if (pagination.currentPage < pagination.totalPages) {
            paginationHTML += `
                <button class="page-btn" onclick="window.studentsManager.changePage(${pagination.currentPage + 1})">
                    Next
                </button>
            `;
        }

        this.pagination.innerHTML = paginationHTML;
    }

    updateStats(stats) {
        // Initialize counts
        let bsit = 0, bscs = 0, bsis = 0, bsba = 0, total = 0;

        // Count students by program
        stats.forEach(stat => {
            total += stat.count;
            switch (stat.major) {
                case 'information_technology':
                    bsit = stat.count;
                    break;
                case 'computer_science':
                    bscs = stat.count;
                    break;
                case 'information_system':
                    bsis = stat.count;
                    break;
                case 'business_administration':
                    bsba = stat.count;
                    break;
            }
        });

        // Update DOM elements if they exist
        if (this.bsitStudents) this.bsitStudents.textContent = bsit;
        if (this.bscsStudents) this.bscsStudents.textContent = bscs;
        if (this.bsisStudents) this.bsisStudents.textContent = bsis;
        if (this.bsbaStudents) this.bsbaStudents.textContent = bsba;
        if (this.totalStudents) this.totalStudents.textContent = total;
    }

    changePage(page) {
        this.currentPage = page;
        this.loadStudents();
    }

    openModal(isEdit = false) {
        if (!this.studentModal) return;

        if (this.modalTitle) {
            this.modalTitle.textContent = isEdit ? 'Edit Student' : 'Add New Student';
        }
        if (this.submitBtn) {
            this.submitBtn.textContent = isEdit ? 'Update Student' : 'Save Student';
        }
        
        this.studentModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.studentModal) return;

        this.studentModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        if (this.studentForm) {
            this.studentForm.reset();
        }
        this.editingStudentId = null;
    }

    async editStudent(id) {
        try {
            const response = await fetch(`/api/studentinfo/students/${id}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch student data');
            }

            const student = await response.json();
            
            // Populate form only if inputs exist
            if (this.firstNameInput) this.firstNameInput.value = student.first_name;
            if (this.lastNameInput) this.lastNameInput.value = student.last_name;
            if (this.emailInput) this.emailInput.value = student.email;
            if (this.phoneInput) this.phoneInput.value = student.phone || '';
            if (this.programInput) this.programInput.value = student.major;
            if (this.yearLevelInput) this.yearLevelInput.value = student.year_level;
            if (this.dateOfBirthInput) {
                this.dateOfBirthInput.value = student.date_of_birth ? student.date_of_birth.split('T')[0] : '';
            }
            if (this.addressInput) this.addressInput.value = student.home_address || '';

            this.editingStudentId = id;
            this.openModal(true);

        } catch (error) {
            console.error('Error loading student for edit:', error);
            this.showError('Failed to load student data');
        }
    }

    async deleteStudent(id, name) {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/studentinfo/students/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete student');
            }

            this.showSuccess('Student deleted successfully');
            this.loadStudents();

        } catch (error) {
            console.error('Error deleting student:', error);
            this.showError('Failed to delete student');
        }
    }

    async handleSubmit() {
        try {
            const formData = {
                firstName: this.firstNameInput?.value.trim() || '',
                lastName: this.lastNameInput?.value.trim() || '',
                email: this.emailInput?.value.trim() || '',
                phone: this.phoneInput?.value.trim() || '',
                program: this.programInput?.value || '',
                yearLevel: this.yearLevelInput?.value || '',
                dateOfBirth: this.dateOfBirthInput?.value || '',
                address: this.addressInput?.value.trim() || ''
            };

            const isEdit = this.editingStudentId !== null;
            const url = isEdit 
                ? `/api/studentinfo/students/${this.editingStudentId}`
                : '/api/studentinfo/students';
            
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save student');
            }

            this.showSuccess(isEdit ? 'Student updated successfully' : 'Student created successfully');
            this.closeModal();
            this.loadStudents();

        } catch (error) {
            console.error('Error saving student:', error);
            this.showError(error.message);
        }
    }

    // Utility functions
    getInitials(firstName, lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add these methods to the StudentsManager class
formatStudentType(type) {
    const types = {
        'regular': 'Regular',
        'irregular': 'Irregular'
    };
    return types[type] || type || 'Regular';
}

getStudentTypeBadgeClass(type) {
    return type === 'irregular' ? 'badge-warning' : 'badge-primary';
}

    formatProgram(program) {
        const programs = {
            'information_technology': 'BSIT',
            'computer_science': 'BSCS',
            'information_system': 'BSIS',
            'business_administration': 'BSBA'
        };
        return programs[program] || program;
    }

    formatYearLevel(year) {
        const years = {
            '1st_year': '1st Year',
            '2nd_year': '2nd Year',
            '3rd_year': '3rd Year',
            '4th_year': '4th Year'
        };
        return years[year] || year;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Initialize when script loads, but only once
if (typeof window !== 'undefined' && !window.studentsManager) {
    window.studentsManager = new StudentsManager();
}

// Add CSS animations
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}