// Enhanced profile.js with better error handling and debugging

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.baseURL = window.location.origin; // Automatically detect base URL
        this.init();
    }

    async init() {
    await this.getCurrentUser();
    this.setupEventListeners();
    
    // Initialize sidebar if we're not on the profile page
    if (!document.getElementById('profile-form')) {
        await this.initializeSidebar();
    } else {
        // If we're on the profile page, load profile data normally
        await this.loadProfileData();
    }
}

    // Add this method to ProfileManager class
getAuthToken() {
    // Try multiple storage methods to be more flexible
    return sessionStorage.getItem('authToken') || 
           localStorage.getItem('authToken') || 
           'mock-token-for-testing'; // Fallback for development
}

// Update the getCurrentUser method
async getCurrentUser() {
    try {
        // Get user data from sessionStorage to match authCheck.js
        const userData = sessionStorage.getItem('userData');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            console.log('Current user from session:', this.currentUser);
        } else {
            // Fallback to window.currentUser set by authCheck.js
            this.currentUser = window.currentUser || { id: 1, username: 'student' };
            console.log('Using fallback user:', this.currentUser);
        }
    } catch (error) {
        console.error('Error getting current user:', error);
        this.currentUser = { id: 1, username: 'student' };
    }
}

    

    setupEventListeners() {
        // Profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Avatar upload in profile form
        const avatarInput = document.getElementById('avatar-file-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', this.handleAvatarUpload.bind(this));
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', this.resetForm.bind(this));
        }

        // Auto-update display name from first and last name
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const displayNameInput = document.getElementById('displayName');

        if (firstNameInput && lastNameInput && displayNameInput) {
            const updateDisplayName = () => {
                const firstName = firstNameInput.value.trim();
                const lastName = lastNameInput.value.trim();
                if (firstName && lastName && !displayNameInput.value) {
                    displayNameInput.value = `${firstName} ${lastName}`;
                }
            };

            firstNameInput.addEventListener('blur', updateDisplayName);
            lastNameInput.addEventListener('blur', updateDisplayName);
        }
    }

    async loadProfileData() {
    try {
        const token = this.getAuthToken();
        if (!token) {
            console.log('⚠️ No auth token found, user needs to log in');
            // Redirect to login if no token
            window.location.href = '/login.html';
            return;
        }

        console.log('Loading profile data from:', `${this.baseURL}/api/profile/get`);
        
        const response = await fetch(`${this.baseURL}/api/profile/get`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                console.log('⚠️ Authentication failed, redirecting to login');
                localStorage.removeItem('authToken');
                window.location.href = '/login.html';
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        console.log('Profile data response:', result);

        if (result.success) {
            if (result.data) {
                this.populateForm(result.data);
                this.updateAvatarDisplay(result.data.avatar_url);
                this.updateSidebarInfo(result.data);
            } else {
                console.log('No profile data found - this is normal for new users');
            }
        } else {
            console.warn('Failed to load profile data:', result.message);
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        if (error.message.includes('401')) {
            window.location.href = '/login.html';
        }
    }
}

async handleFormSubmit(event) {
    event.preventDefault();
    
    const token = this.getAuthToken();
    if (!token) {
        this.showErrorMessage('Authentication required. Please log in.');
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    
    try {
        // Show loading state
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const formData = this.getFormData();
        
        // Validate required fields
        if (!this.validateForm(formData)) {
            return;
        }

        console.log('Sending profile data:', formData);

        const response = await fetch(`${this.baseURL}/api/profile/save`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login.html';
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Server response:', result);

        if (result.success) {
            this.showSuccessMessage('Profile updated successfully!');
            
            // Update sidebar display if data is available
            if (result.data) {
                this.updateSidebarInfo(result.data);
            }
        } else {
            throw new Error(result.message || 'Failed to save profile');
        }

    } catch (error) {
        console.error('Error saving profile:', error);
        this.showErrorMessage(error.message || 'Failed to save profile. Please try again.');
    } finally {
        // Reset button state
        saveBtn.classList.remove('loading');
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

async handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const token = this.getAuthToken();
    if (!token) {
        this.showErrorMessage('Authentication required. Please log in.');
        return;
    }

    console.log('🔄 Avatar upload started:', {
        name: file.name,
        size: file.size,
        type: file.type
    });

    if (!this.validateImageFile(file)) {
        return;
    }

    // Show loading state
    const uploadBtn = event.target.closest('.avatar-upload-btn');
    if (uploadBtn) {
        uploadBtn.classList.add('uploading');
    }

    try {
        const formData = new FormData();
        formData.append('avatar', file);

        console.log('📤 Uploading to:', `${this.baseURL}/api/profile/upload-avatar`);

        const response = await fetch(`${this.baseURL}/api/profile/upload-avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log('📨 Upload response:', {
            status: response.status,
            statusText: response.statusText
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login.html';
                return;
            }
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                // Use default error message
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Avatar upload successful:', result);

        if (result.success) {
            // Update avatar display with new URL
            this.updateAvatarDisplay(result.avatarUrl);
            this.showSuccessMessage('Avatar updated successfully!');
        } else {
            throw new Error(result.message || 'Failed to upload avatar');
        }

    } catch (error) {
        console.error('❌ Avatar upload error:', error);
        this.showErrorMessage(error.message || 'Failed to upload avatar. Please try again.');
        
        // Reset file input
        event.target.value = '';
    } finally {
        // Remove loading state
        if (uploadBtn) {
            uploadBtn.classList.remove('uploading');
        }
    }
}

    updateAvatarDisplay(avatarUrl) {
    console.log('Updating avatar display with:', avatarUrl);
    
    // Update profile form avatar
    const profileAvatar = document.getElementById('preview-avatar');
    if (profileAvatar) {
        if (avatarUrl) {
            // FIXED: Use absolute URL with base URL
            const fullAvatarUrl = avatarUrl.startsWith('http') ? avatarUrl : `${this.baseURL}${avatarUrl}`;
            profileAvatar.style.backgroundImage = `url('${fullAvatarUrl}')`;
            profileAvatar.style.backgroundSize = 'cover';
            profileAvatar.style.backgroundPosition = 'center';
            profileAvatar.innerHTML = '<div class="avatar-upload-btn"><i class="fas fa-camera"></i><input type="file" id="avatar-file-input" accept="image/*"></div>';
            
            // Re-attach event listener to new input
            const newInput = profileAvatar.querySelector('#avatar-file-input');
            if (newInput) {
                newInput.addEventListener('change', this.handleAvatarUpload.bind(this));
            }
        } else {
            profileAvatar.style.backgroundImage = '';
            profileAvatar.innerHTML = '<i class="fas fa-user"></i><div class="avatar-upload-btn"><i class="fas fa-camera"></i><input type="file" id="avatar-file-input" accept="image/*"></div>';
            
            // Re-attach event listener
            const newInput = profileAvatar.querySelector('#avatar-file-input');
            if (newInput) {
                newInput.addEventListener('change', this.handleAvatarUpload.bind(this));
            }
        }
    }

    // Update sidebar avatar if it exists
    const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
    if (sidebarAvatar) {
        if (avatarUrl) {
            const fullAvatarUrl = avatarUrl.startsWith('http') ? avatarUrl : `${this.baseURL}${avatarUrl}`;
            sidebarAvatar.style.backgroundImage = `url('${fullAvatarUrl}')`;
            sidebarAvatar.style.backgroundSize = 'cover';
            sidebarAvatar.style.backgroundPosition = 'center';
            sidebarAvatar.innerHTML = '';
        } else {
            sidebarAvatar.style.backgroundImage = '';
            sidebarAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }
    }
}

    updateSidebarInfo(profileData) {
    console.log('Updating sidebar with profile data:', profileData);
    
    // Update sidebar user name
    const sidebarUserName = document.querySelector('.sidebar-user-name');
    if (sidebarUserName) {
        if (profileData.display_name) {
            sidebarUserName.textContent = profileData.display_name;
        } else if (profileData.first_name && profileData.last_name) {
            sidebarUserName.textContent = `${profileData.first_name} ${profileData.last_name}`;
        }
    }

    // Update sidebar course info with both major and year level
    const sidebarUserInfo = document.querySelector('.sidebar-user-info');
    if (sidebarUserInfo) {
        let courseInfo = '';
if (profileData.major && profileData.year_level && profileData.student_type) {
    const formattedMajor = this.formatMajor(profileData.major);
    const formattedYear = this.formatYearLevel(profileData.year_level);
    const formattedType = this.formatStudentType(profileData.student_type);
    courseInfo = `${formattedMajor} - ${formattedYear} (${formattedType})`;
} else if (profileData.major && profileData.year_level) {
    const formattedMajor = this.formatMajor(profileData.major);
    const formattedYear = this.formatYearLevel(profileData.year_level);
    courseInfo = `${formattedMajor} - ${formattedYear}`;
} else if (profileData.major) {
    courseInfo = this.formatMajor(profileData.major);
} else {
    courseInfo = 'Course Info';
}
        sidebarUserInfo.textContent = courseInfo;
    }
}

    // Initialize sidebar on page load - ADD THIS METHOD
async initializeSidebar() {
    try {
        console.log('🔄 Initializing sidebar display...');
        
        // Load and display current profile data in sidebar
        await this.loadProfileData();
        
        // Set up user name from session if available
        if (this.currentUser && this.currentUser.username) {
            const sidebarUserName = document.querySelector('.sidebar-user-name');
            if (sidebarUserName && !sidebarUserName.textContent.includes(this.currentUser.username)) {
                sidebarUserName.textContent = this.currentUser.username;
            }
        }
        
        console.log('✅ Sidebar initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing sidebar:', error);
    }
}

    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        console.log('Validating file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        if (!validTypes.includes(file.type)) {
            this.showErrorMessage('Please select a valid image file (JPEG, PNG, GIF, or WebP).');
            return false;
        }

        if (file.size > maxSize) {
            this.showErrorMessage('Image file must be less than 5MB.');
            return false;
        }

        return true;
    }

    getFormData() {
    const formData = {
        firstName: document.getElementById('firstName')?.value.trim() || '',
        lastName: document.getElementById('lastName')?.value.trim() || '',
        displayName: document.getElementById('displayName')?.value.trim() || '',
        email: document.getElementById('email')?.value.trim() || '',
        phone: document.getElementById('phone')?.value.trim() || '',
        dateOfBirth: document.getElementById('dateOfBirth')?.value || null,
        homeAddress: document.getElementById('homeAddress')?.value.trim() || '',
        city: document.getElementById('city')?.value.trim() || '',
        postalCode: document.getElementById('postalCode')?.value.trim() || '',
        province: document.getElementById('province')?.value.trim() || '',
        country: document.getElementById('country')?.value || '',
        studentId: document.getElementById('studentId')?.value.trim() || '',
        studentType: document.getElementById('studentType')?.value || 'regular', // FIXED: Proper fallback
        major: document.getElementById('major')?.value || '',
        yearLevel: document.getElementById('yearLevel')?.value || ''
    };

    console.log('Form data collected:', formData);
    return formData;
}

    validateForm(formData) {
        const requiredFields = ['firstName', 'lastName', 'displayName', 'email', 'studentId', 'studentType', 'major', 'yearLevel'];
        const missingFields = [];

        requiredFields.forEach(field => {
            if (!formData[field]) {
                missingFields.push(this.getFieldDisplayName(field));
            }
        });

        if (missingFields.length > 0) {
            this.showErrorMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            this.showErrorMessage('Please enter a valid email address.');
            return false;
        }

        return true;
    }

    getFieldDisplayName(field) {
        const displayNames = {
            'firstName': 'First Name',
            'lastName': 'Last Name',
            'displayName': 'Display Name',
            'email': 'Email',
            'studentId': 'Student ID',
            'studentType': 'Student Type',
            'major': 'Major',
            'yearLevel': 'Year Level'
        };
        return displayNames[field] || field;
    }

    

    populateForm(data) {
        console.log('Populating form with data:', data);
        
        const fieldMappings = {
            'firstName': 'first_name',
            'lastName': 'last_name',
            'displayName': 'display_name',
            'email': 'email',
            'phone': 'phone',
            'dateOfBirth': 'date_of_birth',
            'homeAddress': 'home_address',
            'city': 'city',
            'postalCode': 'postal_code',
            'province': 'province',
            'country': 'country',
            'studentId': 'student_id',
            'studentType': 'student_type',
            'major': 'major',
            'yearLevel': 'year_level'
        };

        Object.entries(fieldMappings).forEach(([htmlField, dbField]) => {
            const element = document.getElementById(htmlField);
            if (element && data[dbField] !== undefined && data[dbField] !== null) {
                element.value = data[dbField];
                console.log(`Set ${htmlField} to:`, data[dbField]);
            }
        });
    }

    resetForm() {
        console.log('Resetting form...');
        
        const form = document.getElementById('profile-form');
        if (form) {
            form.reset();
            // Reset avatar display
            this.updateAvatarDisplay(null);
            this.hideMessages();
        }
    }

    // Add this new method to the ProfileManager class
formatStudentType(studentType) {
    const typeMap = {
        'regular': 'Regular',
        'irregular': 'Irregular'
    };
    return typeMap[studentType] || studentType;
}

    formatMajor(major) {
        const majorMap = {
            'computer_science': 'BSCS',
            'information_technology': 'BSIT',
            'information_system': 'BSIS',
            'business_administration': 'BSBA',
        };
        return majorMap[major] || major;
    }

    formatYearLevel(yearLevel) {
    const yearMap = {
        '1st_year': '1st Year',
        '2nd_year': '2nd Year', 
        '3rd_year': '3rd Year',
        '4th_year': '4th Year'
        
    };
    return yearMap[yearLevel] || yearLevel;
}

    showSuccessMessage(message) {
        console.log('Success:', message);
        
        this.hideMessages(); // Hide any existing messages first
        
        let successDiv = document.getElementById('success-message');
        if (!successDiv) {
            // Create success message div if it doesn't exist
            successDiv = document.createElement('div');
            successDiv.id = 'success-message';
            successDiv.className = 'success-message';
            successDiv.innerHTML = '<i class="fas fa-check-circle"></i><span></span>';
            
            const form = document.getElementById('profile-form');
            if (form) {
                form.insertBefore(successDiv, form.firstChild);
            }
        }

        successDiv.style.display = 'flex';
        successDiv.querySelector('span').textContent = message;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (successDiv) {
                successDiv.style.display = 'none';
            }
        }, 5000);
    }

    showErrorMessage(message) {
        console.error('Error:', message);
        
        this.hideMessages(); // Hide any existing messages first
        
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            // Create error message div if it doesn't exist
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i><span></span>';
            
            const form = document.getElementById('profile-form');
            if (form) {
                form.insertBefore(errorDiv, form.firstChild);
            }
        }

        errorDiv.style.display = 'flex';
        errorDiv.querySelector('span').textContent = message;
        
        // Auto-hide after 7 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 7000);
    }

    hideMessages() {
        const successDiv = document.getElementById('success-message');
        const errorDiv = document.getElementById('error-message');
        
        if (successDiv) successDiv.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'none';
    }


// ADD this method to ProfileManager class - Better session management
updateUserSession(profileData) {
    console.log('🔄 Updating user session with profile data:', profileData);
    
    try {
        // Update sessionStorage userData
        let userData = {};
        const existingUserData = sessionStorage.getItem('userData');
        if (existingUserData) {
            userData = JSON.parse(existingUserData);
        }
        
        // Update with new profile data
        userData.studentId = profileData.studentId || profileData.student_id;
        userData.student_id = profileData.studentId || profileData.student_id;
        userData.studentType = profileData.studentType || profileData.student_type;
        userData.firstName = profileData.firstName || profileData.first_name;
        userData.lastName = profileData.lastName || profileData.last_name;
        userData.displayName = profileData.displayName || profileData.display_name;
        userData.email = profileData.email;
        userData.major = profileData.major;
        userData.yearLevel = profileData.yearLevel || profileData.year_level;
        
        // Save back to sessionStorage
        sessionStorage.setItem('userData', JSON.stringify(userData));
        
        // Update window.currentUser if it exists
        if (window.currentUser) {
            Object.assign(window.currentUser, userData);
        } else {
            window.currentUser = userData;
        }
        
        // Store critical info in localStorage as backup
        if (userData.studentId) {
            localStorage.setItem('student_id', userData.studentId);
        }
        
        console.log('✅ User session updated:', userData);
        
    } catch (error) {
        console.error('❌ Error updating user session:', error);
    }
}

// ADD this method to ProfileManager class - Better student ID handling
async ensureStudentIdInDatabase() {
    try {
        console.log('🔗 Ensuring student ID is properly set in database...');
        
        const token = this.getAuthToken();
        if (!token) return;
        
        // Get current user data
        const userData = sessionStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            
            // Make sure the database has the correct student_id reference
            const response = await fetch(`${this.baseURL}/api/profile/sync-student-id`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id || this.currentUser?.id,
                    studentId: user.student_id || user.id
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Student ID synchronized:', result);
            }
        }
    } catch (error) {
        console.error('❌ Error syncing student ID:', error);
    }
}

// REPLACE the existing handleFormSubmit method with this updated version:
async handleFormSubmit(event) {
    event.preventDefault();
    
    const token = this.getAuthToken();
    if (!token) {
        this.showErrorMessage('Authentication required. Please log in.');
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    
    try {
        // Show loading state
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const formData = this.getFormData();
        
        // Validate required fields
        if (!this.validateForm(formData)) {
            return;
        }

        console.log('Sending profile data:', formData);

        const response = await fetch(`${this.baseURL}/api/profile/save`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login.html';
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Server response:', result);

        if (result.success) {
            // Update user session with saved data
            this.updateUserSession(formData);
            
            // Ensure student ID is properly synchronized
            await this.ensureStudentIdInDatabase();
            
            this.showSuccessMessage('Profile updated successfully! You can now proceed with enrollment.');
            
            // Update sidebar display
            this.updateSidebarInfo(result.data || formData);
            
            // Auto-redirect to enrollment if they came from enrollment page
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('redirect') === 'enrollment') {
                    console.log('🔄 Redirecting back to enrollment...');
                    window.location.href = '/StudentSide/studentdashboard.html#enrollment';
                }
            }, 2000);
            
        } else {
            throw new Error(result.message || 'Failed to save profile');
        }

    } catch (error) {
        console.error('Error saving profile:', error);
        this.showErrorMessage(error.message || 'Failed to save profile. Please try again.');
    } finally {
        // Reset button state
        saveBtn.classList.remove('loading');
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}


    // Debug method to test API endpoints
    async testAPI() {
        console.log('🧪 Testing Profile API...');
        
        try {
            const response = await fetch(`${this.baseURL}/api/profile/test`);
            const result = await response.json();
            console.log('API Test Result:', result);
            return result;
        } catch (error) {
            console.error('API Test Failed:', error);
            return null;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ProfileManager...');
    
    // Add some debug info
    console.log('Profile form found:', !!document.getElementById('profile-form'));
    console.log('Avatar input found:', !!document.getElementById('avatar-file-input'));
    console.log('Save button found:', !!document.getElementById('saveBtn'));
    console.log('Base URL:', window.location.origin);
    
    const profileManager = new ProfileManager();
    
    // Make profileManager available globally for debugging
    window.profileManager = profileManager;
    
    // Test API endpoint on load (for debugging)
    if (window.location.search.includes('debug=true')) {
        setTimeout(() => {
            profileManager.testAPI();
        }, 1000);
    }
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManager;
}
// Global ProfileManager for sidebar updates across all pages
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Initialize ProfileManager on all pages for sidebar functionality
        if (!window.profileManager) {
            window.profileManager = new ProfileManager();
        }
    });
}