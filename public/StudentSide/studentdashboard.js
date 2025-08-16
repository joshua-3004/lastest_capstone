function toggleDarkMode() {
            const body = document.body;
            const modeIcon = document.getElementById('mode-icon');
            
            body.classList.toggle('dark-mode');
            
            if (body.classList.contains('dark-mode')) {
                modeIcon.className = 'fas fa-sun';
            } else {
                modeIcon.className = 'fas fa-moon';
            }
        }

        // Add interactive features
        document.addEventListener('DOMContentLoaded', function() {
            // Add click handlers for grade cells to show more details
            const gradeCells = document.querySelectorAll('.grade');
            gradeCells.forEach(cell => {
                cell.addEventListener('click', function() {
                    const grade = this.textContent;
                    const row = this.closest('tr');
                    const subject = row.querySelector('.subject-title').textContent;
                    
                    alert(`${subject}\nGrade: ${grade}\nClick the GPA cards for detailed analytics.`);
                });
            });

            // Add animation to GPA cards
            const gpaCards = document.querySelectorAll('.gpa-card');
            gpaCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.style.animation = 'fadeInUp 0.6s ease forwards';
            });
        });

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);


        

        class AcademicCalendar {
            constructor() {
                this.currentDate = new Date();
                this.events = this.loadEvents();
                this.editingEventId = null;
                this.init();
            }

            init() {
                this.renderCalendar();
                this.renderEvents();
                this.updateStats();
                this.bindEvents();
            }

            bindEvents() {
                document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
                document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
                document.getElementById('addEventBtn').addEventListener('click', () => this.showEventForm());
                document.getElementById('saveEventBtn').addEventListener('click', () => this.saveEvent());
                document.getElementById('cancelEventBtn').addEventListener('click', () => this.hideEventForm());
            }

            previousMonth() {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            }

            nextMonth() {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            }

            renderCalendar() {
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                
                // Update month display
                const months = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
                document.getElementById('currentMonth').textContent = `${months[month]} ${year}`;

                // Create calendar grid
                const grid = document.getElementById('calendarGrid');
                grid.innerHTML = '';

                // Add day headers
                const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                dayHeaders.forEach(day => {
                    const header = document.createElement('div');
                    header.className = 'day-header';
                    header.textContent = day;
                    grid.appendChild(header);
                });

                // Get first day of month and number of days
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const daysInPrevMonth = new Date(year, month, 0).getDate();

                // Add previous month's trailing days
                for (let i = firstDay - 1; i >= 0; i--) {
                    const day = daysInPrevMonth - i;
                    const cell = this.createDayCell(day, true, year, month - 1);
                    grid.appendChild(cell);
                }

                // Add current month's days
                for (let day = 1; day <= daysInMonth; day++) {
                    const cell = this.createDayCell(day, false, year, month);
                    grid.appendChild(cell);
                }

                // Add next month's leading days
                const totalCells = grid.children.length - 7; // Subtract headers
                const remainingCells = 42 - totalCells; // 6 rows × 7 days
                for (let day = 1; day <= remainingCells; day++) {
                    const cell = this.createDayCell(day, true, year, month + 1);
                    grid.appendChild(cell);
                }
            }

            createDayCell(day, isOtherMonth, year, month) {
                const cell = document.createElement('div');
                cell.className = 'day-cell';
                
                if (isOtherMonth) {
                    cell.classList.add('other-month');
                }

                // Check if today
                const today = new Date();
                const cellDate = new Date(year, month, day);
                if (cellDate.toDateString() === today.toDateString()) {
                    cell.classList.add('today');
                }

                // Check for events
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = this.events.filter(event => event.date === dateStr);
                
                if (dayEvents.length > 0) {
                    cell.classList.add('has-events');
                }

                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = day;
                cell.appendChild(dayNumber);

                // Add event dots
                const dotsContainer = document.createElement('div');
                dayEvents.slice(0, 3).forEach(() => {
                    const dot = document.createElement('div');
                    dot.className = 'event-dot';
                    dotsContainer.appendChild(dot);
                });
                cell.appendChild(dotsContainer);

                // Add click event
                cell.addEventListener('click', () => {
                    document.getElementById('eventDate').value = dateStr;
                    this.showEventForm();
                });

                return cell;
            }

            showEventForm(event = null) {
                const form = document.getElementById('eventForm');
                form.classList.add('active');
                
                if (event) {
                    // Editing existing event
                    this.editingEventId = event.id;
                    document.getElementById('eventTitle').value = event.title;
                    document.getElementById('eventDate').value = event.date;
                    document.getElementById('eventTime').value = event.time || '';
                    document.getElementById('eventType').value = event.type;
                    document.getElementById('eventDescription').value = event.description || '';
                    document.getElementById('saveEventBtn').textContent = 'Update Event';
                } else {
                    // Adding new event
                    this.editingEventId = null;
                    document.getElementById('eventTitle').value = '';
                    document.getElementById('eventTime').value = '';
                    document.getElementById('eventType').value = 'class';
                    document.getElementById('eventDescription').value = '';
                    document.getElementById('saveEventBtn').textContent = 'Save Event';
                }
            }

            hideEventForm() {
                document.getElementById('eventForm').classList.remove('active');
                this.editingEventId = null;
            }

            saveEvent() {
                const title = document.getElementById('eventTitle').value.trim();
                const date = document.getElementById('eventDate').value;
                const time = document.getElementById('eventTime').value;
                const type = document.getElementById('eventType').value;
                const description = document.getElementById('eventDescription').value.trim();

                if (!title || !date) {
                    alert('Please fill in title and date fields.');
                    return;
                }

                const event = {
                    id: this.editingEventId || Date.now().toString(),
                    title,
                    date,
                    time,
                    type,
                    description
                };

                if (this.editingEventId) {
                    // Update existing event
                    const index = this.events.findIndex(e => e.id === this.editingEventId);
                    this.events[index] = event;
                } else {
                    // Add new event
                    this.events.push(event);
                }

                this.saveEvents();
                this.renderCalendar();
                this.renderEvents();
                this.updateStats();
                this.hideEventForm();
            }

            deleteEvent(eventId) {
                if (confirm('Are you sure you want to delete this event?')) {
                    this.events = this.events.filter(event => event.id !== eventId);
                    this.saveEvents();
                    this.renderCalendar();
                    this.renderEvents();
                    this.updateStats();
                }
            }

            renderEvents() {
                const eventsList = document.getElementById('eventsList');
                eventsList.innerHTML = '';

                if (this.events.length === 0) {
                    eventsList.innerHTML = '<div class="no-events">No events scheduled</div>';
                    return;
                }

                // Sort events by date
                const sortedEvents = [...this.events].sort((a, b) => new Date(a.date) - new Date(b.date));

                sortedEvents.forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.className = 'event-item';

                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    });

                    eventItem.innerHTML = `
                        <div class="event-title">${event.title}</div>
                        <div class="event-date">${formattedDate}${event.time ? ` at ${event.time}` : ''}</div>
                        <div class="event-type ${event.type}">${event.type}</div>
                        ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                        <div class="event-actions">
                            <button class="btn-small btn-edit" onclick="calendar.showEventForm(${JSON.stringify(event).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn-small btn-delete" onclick="calendar.deleteEvent('${event.id}')">Delete</button>
                        </div>
                    `;

                    eventsList.appendChild(eventItem);
                });
            }

            updateStats() {
                const today = new Date();
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                
                const totalEvents = this.events.length;
                const upcomingEvents = this.events.filter(event => new Date(event.date) >= today).length;
                const overdueEvents = this.events.filter(event => new Date(event.date) < today).length;
                const thisWeekEvents = this.events.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate >= today && eventDate <= weekFromNow;
                }).length;
                
                document.getElementById('totalEvents').textContent = totalEvents;
                document.getElementById('upcomingEvents').textContent = upcomingEvents;
                document.getElementById('overdueEvents').textContent = overdueEvents;
                document.getElementById('thisWeekEvents').textContent = thisWeekEvents;
            }

            saveEvents() {
                // In a real application, you would save to a database
                this.events = [...this.events];
            }

            loadEvents() {
                // Sample events matching the academic theme
                return [
                    {
                        id: '1',
                        title: 'Mathematics Final Exam',
                        date: '2025-06-15',
                        time: '09:00',
                        type: 'exam',
                        description: 'Comprehensive final exam covering all semester topics'
                    },
                    {
                        id: '2',
                        title: 'Computer Science Project Due',
                        date: '2025-06-12',
                        time: '23:59',
                        type: 'assignment',
                        description: 'Submit final project with documentation'
                    },
                    {
                        id: '3',
                        title: 'History Class',
                        date: '2025-06-10',
                        time: '14:00',
                        type: 'class',
                        description: 'Weekly history lecture'
                    }
                ];
            }
        }

        // Initialize calendar
        const calendar = new AcademicCalendar();

        // Toggle password visibility
        function togglePassword(fieldId) {
            const field = document.getElementById(fieldId);
            const icon = field.nextElementSibling;
            
            if (field.type === 'password') {
                field.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                field.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        // Password strength checker
        function checkPasswordStrength(password) {
            let strength = 0;
            let status = '';
            
            if (password.length >= 8) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            const strengthBar = document.getElementById('strengthBar');
            const passwordStatus = document.getElementById('passwordStatus');
            
            strengthBar.className = 'password-strength-bar';
            
            if (strength < 3) {
                strengthBar.classList.add('weak');
                status = 'Password strength: Weak';
            } else if (strength < 5) {
                strengthBar.classList.add('medium');
                status = 'Password strength: Medium';
            } else {
                strengthBar.classList.add('strong');
                status = 'Password strength: Strong';
            }
            
            passwordStatus.textContent = status;
        }

        // Check password match
        function checkPasswordMatch() {
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const matchIndicator = document.getElementById('matchIndicator');
            
            if (confirmPassword === '') {
                matchIndicator.textContent = '';
                return;
            }
            
            if (newPassword === confirmPassword) {
                matchIndicator.textContent = '✓ Passwords match';
                matchIndicator.className = 'password-match-indicator match';
            } else {
                matchIndicator.textContent = '✗ Passwords do not match';
                matchIndicator.className = 'password-match-indicator no-match';
            }
        }

        // Form submission
        document.getElementById('passwordChangeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Hide previous messages
            document.getElementById('successMessage').style.display = 'none';
            document.getElementById('errorMessage').style.display = 'none';
            
            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                showError('Please fill in all required fields.');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showError('New passwords do not match.');
                return;
            }
            
            if (newPassword.length < 8) {
                showError('New password must be at least 8 characters long.');
                return;
            }
            
            if (currentPassword === newPassword) {
                showError('New password must be different from current password.');
                return;
            }
            
            // Simulate API call (replace with actual implementation)
            setTimeout(() => {
                // Simulate success (in real implementation, check with server)
                if (currentPassword === 'wrongpassword') {
                    showError('Current password is incorrect.');
                } else {
                    showSuccess();
                    resetForm();
                }
            }, 1000);
        });

        function showSuccess() {
            const successMsg = document.getElementById('successMessage');
            successMsg.style.display = 'flex';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 5000);
        }

        function showError(message) {
            const errorMsg = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            errorText.textContent = message;
            errorMsg.style.display = 'flex';
            setTimeout(() => {
                errorMsg.style.display = 'none';
            }, 5000);
        }

        function resetForm() {
            document.getElementById('passwordChangeForm').reset();
            document.getElementById('strengthBar').className = 'password-strength-bar';
            document.getElementById('passwordStatus').textContent = 'Password strength: Not set';
            document.getElementById('matchIndicator').textContent = '';
            document.getElementById('successMessage').style.display = 'none';
            document.getElementById('errorMessage').style.display = 'none';
        }

        // Event listeners
        document.getElementById('newPassword').addEventListener('input', function() {
            checkPasswordStrength(this.value);
            checkPasswordMatch();
        });

        document.getElementById('confirmPassword').addEventListener('input', checkPasswordMatch);

        // Dark mode toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.querySelector('.dark-mode-toggle i');
            
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        // Initialize form
        document.addEventListener('DOMContentLoaded', function() {
            resetForm();
        });


        // STUDENT-ONLY ANNOUNCEMENTS MANAGER
// This extends the main AnnouncementsManager but removes admin/faculty features
class StudentAnnouncementsManager extends AnnouncementsManager {
    constructor() {
    super();
    this.isStudentView = true;
    this.studentCourse = null;
    this.studentYear = null;
    console.log('🎓 Student Announcements Manager initialized (view-only)');
}

// UPDATED init method
async init() {
    // Initialize student information first
    this.initializeStudentInfo();
    
    this.setupStudentEventListeners();
    await this.loadAnnouncements();
    await this.updateStats();
    console.log('🎓 Student AnnouncementsManager initialized with filtering for:', {
        course: this.studentCourse,
        year: this.studentYear
    });
}

    // Student-specific event listeners (no add/edit/delete functionality)
    setupStudentEventListeners() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachStudentEventListeners());
        } else {
            this.attachStudentEventListeners();
        }
    }

    attachStudentEventListeners() {
        console.log('🎓 Setting up student event listeners (read-only)...');

        // Filter buttons - students can filter announcements
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e, 'priority'));
        });

        // Search input - students can search announcements
        const searchInput = document.getElementById('announcement-search') || 
                           document.getElementById('announcementSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Pagination for students
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }

        console.log('✅ Student event listeners setup complete (read-only)');
    }

    // Override renderAnnouncements for student view (no edit/delete buttons)
    renderAnnouncements() {
        const container = document.getElementById('announcements-list') || 
                         document.getElementById('announcementsList');
        const noAnnouncementsMsg = document.getElementById('no-announcements') || 
                                  document.getElementById('noAnnouncementsMessage');
        
        if (!container) return;

        if (this.announcements.length === 0) {
            container.innerHTML = '';
            if (noAnnouncementsMsg) noAnnouncementsMsg.style.display = 'block';
            return;
        }

        if (noAnnouncementsMsg) noAnnouncementsMsg.style.display = 'none';

        // Render announcements without admin controls
        container.innerHTML = this.announcements.map(announcement => {
            console.log('🎨 Rendering student view for announcement:', {
                id: announcement.id,
                title: announcement.title,
                hasImage: !!announcement.image_url
            });

            // Image handling (same as original but read-only)
            let imageHtml = '';
            if (announcement.image_url) {
                const imageUrl = this.getImageUrl(announcement.image_url);
                imageHtml = `
                    <div class="announcement-image-container" style="margin: 15px 0;">
                        <img src="${imageUrl}" 
                             alt="Announcement image" 
                             class="announcement-image" 
                             style="max-width: 100%; height: auto; border-radius: 8px; display: block;"
                             onload="console.log('✅ Student view image loaded:', this.src);"
                             onerror="this.style.display='none'; console.error('❌ Student view image failed:', this.src);">
                    </div>
                `;
            }

            return `
                <div class="announcement-card student-view" data-id="${announcement.id}">
                    <div class="announcement-header">
                        <div class="announcement-badges">
                            <span class="priority-badge ${announcement.priority}">${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}</span>
                            ${announcement.target_course !== 'All' ? `<span class="course-badge">${announcement.target_course}</span>` : ''}
                            ${announcement.target_year !== 'All' ? `<span class="year-badge">${announcement.target_year}</span>` : ''}
                        </div>
                        <!-- NO ACTION BUTTONS FOR STUDENTS -->
                    </div>
                    <h3 class="announcement-title">${this.escapeHtml(announcement.title)}</h3>
                    <div class="announcement-content">${this.escapeHtml(announcement.content)}</div>
                    ${imageHtml}
                    <div class="announcement-meta">
                        <div class="meta-left">
                            <div class="meta-item">
                                <i class="fas fa-user"></i>
                                <span>${this.escapeHtml(announcement.posted_by_username || 'Unknown')}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>${this.formatDateTime(announcement.created_at)}</span>
                            </div>
                        </div>
                        <div class="view-count">
                            <i class="fas fa-eye"></i>
                            <span>${announcement.view_count || 0} views</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add animation
        const cards = container.querySelectorAll('.announcement-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Disable admin/faculty methods for students
    showModal() {
        console.log('🚫 Students cannot add announcements');
        return;
    }

    editAnnouncement() {
        console.log('🚫 Students cannot edit announcements');
        return;
    }

    deleteAnnouncement() {
        console.log('🚫 Students cannot delete announcements');
        return;
    }

    handleFormSubmit() {
        console.log('🚫 Students cannot submit announcement forms');
        return;
    }

    // Add pagination methods for students
    previousPage() {
        console.log('📖 Previous page requested');
        // Implement pagination logic here
    }

    nextPage() {
        console.log('📖 Next page requested');
        // Implement pagination logic here
    }

    // Override update stats to use student-specific elements
    async updateStats() {
        try {
            const response = await fetch(`${this.apiUrl}/stats/summary`, {
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                const { urgent_count } = result.data;
                const unreadCount = this.announcements.filter(a => !this.isAnnouncementRead(a.id)).length;
                
                // Update student dashboard stats
                const urgentCountElement = document.getElementById('urgent-count');
                const unreadCountElement = document.getElementById('unread-count');

                if (urgentCountElement) urgentCountElement.textContent = `${urgent_count} Urgent`;
                if (unreadCountElement) unreadCountElement.textContent = `${unreadCount} Unread`;
            }
        } catch (error) {
            console.error('Error updating student stats:', error);
        }
    }

    // Student-specific method to track read announcements
    isAnnouncementRead(announcementId) {
        const readAnnouncements = JSON.parse(localStorage.getItem('studentReadAnnouncements') || '[]');
        return readAnnouncements.includes(announcementId);
    }

    markAsRead(announcementId) {
        const readAnnouncements = JSON.parse(localStorage.getItem('studentReadAnnouncements') || '[]');
        if (!readAnnouncements.includes(announcementId)) {
            readAnnouncements.push(announcementId);
            localStorage.setItem('studentReadAnnouncements', JSON.stringify(readAnnouncements));
            this.updateStats(); // Update unread count
        }
    }
}

// Initialize student announcements manager
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 DOM loaded, initializing Student AnnouncementsManager...');
    window.studentAnnouncementsManager = new StudentAnnouncementsManager();
});

// Add this after the StudentAnnouncementsManager class
document.addEventListener('click', (e) => {
    const announcementCard = e.target.closest('.announcement-card.student-view');
    if (announcementCard && window.studentAnnouncementsManager) {
        const announcementId = announcementCard.getAttribute('data-id');
        window.studentAnnouncementsManager.markAsRead(announcementId);
        announcementCard.classList.add('read');
        announcementCard.classList.remove('unread');
    }
});

function checkAuthentication() {
        const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        const hasToken = sessionStorage.getItem('authToken') !== null;
        const hasUser = sessionStorage.getItem('userData') !== null;
        
        // Fallback to old authentication method for backward compatibility
        const oldAuth = sessionStorage.getItem('loggedIn') === 'true';
        const hasUserName = sessionStorage.getItem('userName') !== null;
        
        console.log("🔍 Auth status:", { isAuthenticated, hasToken, hasUser, oldAuth, hasUserName });
        
        if ((!isAuthenticated || !hasToken || !hasUser) && (!oldAuth || !hasUserName)) {
            console.log("❌ Not authenticated, redirecting to login...");
            window.location.href = '../login.html';
            return false;
        }
        
        return true;
    }
    
    // Get current user data
    function getCurrentUser() {
        try {
            const userData = sessionStorage.getItem('userData');
            if (userData) {
                return JSON.parse(userData);
            }
            
            // Fallback to old user data format
            const userName = sessionStorage.getItem('userName');
            const userEmail = sessionStorage.getItem('userEmail');
            const userRole = sessionStorage.getItem('userRole');
            
            if (userName) {
                return {
                    username: userName,
                    name: userName,
                    email: userEmail,
                    role: userRole || 'Student'
                };
            }
            
            return null;
        } catch (error) {
            console.error("Error parsing user data:", error);
            return null;
        }
    }
    
    // Enhanced server request with error handling
    async function makeServerRequest(url, options = {}) {
        const token = sessionStorage.getItem('authToken');
        
        // Add auth header if token exists
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
        
        const requestOptions = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, requestOptions);
            
            // Handle authentication errors
            if (response.status === 401) {
                console.log("🔒 Authentication expired, redirecting to login...");
                sessionStorage.clear();
                window.location.href = '../login.html';
                return null;
            }
            
            return response;
        } catch (error) {
            console.error("🚨 Server request failed:", error);
            
            // Check if we just logged in - if so, don't show error
            const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';
            const skipServerCheck = sessionStorage.getItem('skipInitialServerCheck') === 'true';
            
            if (justLoggedIn || skipServerCheck) {
                console.log("⏭️ Skipping server error - just logged in");
                // Clear the flags after first use
                sessionStorage.removeItem('justLoggedIn');
                sessionStorage.removeItem('skipInitialServerCheck');
                return null;
            }
            
            // Show error for genuine server issues
            showServerError();
            return null;
        }
    }
    
    // Show server error modal/message
    function showServerError() {
        // Check if error modal already exists
        if (document.getElementById('serverErrorModal')) {
            return;
        }
        
        const errorModal = document.createElement('div');
        errorModal.id = 'serverErrorModal';
        errorModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        errorModal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <h3 style="color: #ef4444; margin-bottom: 15px;">Server Connection Error</h3>
                <p style="margin-bottom: 20px; color: #666;">
                    Cannot connect to server. Please check if the server is running on port 3006.
                </p>
                <button id="dismissError" style="
                    background: #3b82f6;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                ">OK</button>
                <button id="retryConnection" style="
                    background: #10b981;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Retry</button>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        
        // Add event listeners
        document.getElementById('dismissError').addEventListener('click', () => {
            errorModal.remove();
        });
        
        document.getElementById('retryConnection').addEventListener('click', () => {
            errorModal.remove();
            // Retry loading dashboard data
            setTimeout(() => {
                window.location.reload();
            }, 500);
        });
    }
    
    // Load dashboard data with fallback
    async function loadDashboardData() {
        console.log("📊 Loading dashboard data...");
        
        // Try to load announcements
        try {
            const response = await makeServerRequest('http://localhost:3006/api/announcements');
            if (response && response.ok) {
                const data = await response.json();
                console.log("📢 Announcements loaded:", data);
                // Update announcements UI here
            }
        } catch (error) {
            console.log("⚠️ Failed to load announcements, using offline mode");
            // Show offline message or cached data
        }
        
        // Try to load other data...
        // Add similar blocks for grades, schedules, etc.
        
        console.log("📊 Dashboard data loading complete");
    }

    