// FIXED public/announcements.js - Complete Image Handling Fix
class AnnouncementsManager {
    constructor() {
        this.announcements = [];
        this.currentFilters = {
            priority: 'all',
            target_course: 'all',
            target_year: 'all',
            search: ''
        };
        this.currentEditId = null;
        this.apiUrl = '/api/announcements';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadAnnouncements();
        await this.updateStats();
        console.log('AnnouncementsManager initialized');
    }

    getAuthToken() {
        let token = localStorage.getItem('authToken') || 
                   sessionStorage.getItem('authToken') || 
                   localStorage.getItem('token') || 
                   sessionStorage.getItem('token');
        
        if (!token) {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'authToken' || name === 'token') {
                    token = value;
                    break;
                }
            }
        }
        
        console.log('🔐 Auth token found:', !!token);
        return token;
    }

    // UPDATED loadAnnouncements method for StudentAnnouncementsManager
async loadAnnouncements() {
    try {
        this.showLoading(true);
        
        // Get student's course and year from the page or local storage
        const studentCourse = this.getStudentCourse();
        const studentYear = this.getStudentYear();
        
        console.log('🎓 Loading announcements for student:', {
            course: studentCourse,
            year: studentYear
        });
        
        const params = new URLSearchParams();
        
        // Add student's course and year to filter announcements
        if (studentCourse && studentCourse !== 'All') {
            params.append('target_course', studentCourse);
        }
        if (studentYear && studentYear !== 'All') {
            params.append('target_year', studentYear);
        }
        
        // Add other existing filters
        if (this.currentFilters.priority !== 'all') {
            params.append('priority', this.currentFilters.priority);
        }
        if (this.currentFilters.search) {
            params.append('search', this.currentFilters.search);
        }
        params.append('limit', '50');

        const response = await fetch(`${this.apiUrl}?${params}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();

        if (result.success) {
            this.announcements = result.data;
            console.log(`📢 Loaded ${this.announcements.length} announcements for ${studentCourse} ${studentYear}`);
            this.renderAnnouncements();
        } else {
            throw new Error(result.message || 'Failed to load announcements');
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        this.showAlert('Failed to load announcements. Please refresh the page.', 'error');
        this.announcements = [];
        this.renderAnnouncements();
    } finally {
        this.showLoading(false);
    }
}

// IMPROVED helper methods - Add these to your StudentAnnouncementsManager class

// Better method to get student's course
getStudentCourse() {
    // Method 1: Try data attributes
    const studentInfo = document.getElementById('student-info');
    if (studentInfo && studentInfo.dataset.studentCourse) {
        console.log('📚 Found course from data attribute:', studentInfo.dataset.studentCourse);
        return studentInfo.dataset.studentCourse;
    }
    
    // Method 2: Try profile elements
    const courseElement = document.querySelector('.student-course[data-course]');
    if (courseElement && courseElement.dataset.course) {
        console.log('📚 Found course from profile:', courseElement.dataset.course);
        return courseElement.dataset.course;
    }
    
    // Method 3: Parse from text content
    const profileText = document.querySelector('.student-course')?.textContent;
    if (profileText) {
        const courseMatch = profileText.match(/(BSBA|BSCS|BSIT|BSA|BSED|Computer Science|Information Technology|Business Administration)/i);
        if (courseMatch) {
            let course = courseMatch[0].toUpperCase();
            // Normalize course names
            if (course.includes('COMPUTER SCIENCE')) course = 'BSCS';
            if (course.includes('INFORMATION TECHNOLOGY')) course = 'BSIT';
            if (course.includes('BUSINESS ADMINISTRATION')) course = 'BSBA';
            
            console.log('📚 Parsed course from text:', course);
            return course;
        }
    }
    
    console.warn('⚠️ Could not determine student course, defaulting to All');
    return 'All';
}

// Better method to get student's year level
getStudentYear() {
    // Method 1: Try data attributes
    const studentInfo = document.getElementById('student-info');
    if (studentInfo && studentInfo.dataset.studentYear) {
        console.log('📅 Found year from data attribute:', studentInfo.dataset.studentYear);
        return studentInfo.dataset.studentYear;
    }
    
    // Method 2: Try profile elements
    const yearElement = document.querySelector('.student-year[data-year]');
    if (yearElement && yearElement.dataset.year) {
        console.log('📅 Found year from profile:', yearElement.dataset.year);
        return yearElement.dataset.year;
    }
    
    // Method 3: Parse from text content
    const profileText = document.querySelector('.student-course')?.textContent || 
                       document.querySelector('.student-profile')?.textContent;
    if (profileText) {
        const yearMatch = profileText.match(/(\d+)(?:st|nd|rd|th)\s*Year/i);
        if (yearMatch) {
            const yearLevel = yearMatch[1] + 'st_year'; // Normalize format
            console.log('📅 Parsed year from text:', yearLevel);
            return yearLevel;
        }
    }
    
    console.warn('⚠️ Could not determine student year, defaulting to All');
    return 'All';
}

// Add a method to initialize student info on page load
initializeStudentInfo() {
    const course = this.getStudentCourse();
    const year = this.getStudentYear();
    
    console.log('🎓 Student Info Initialized:', {
        course: course,
        year: year,
        willFilter: course !== 'All' || year !== 'All'
    });
    
    // Store in instance for easy access
    this.studentCourse = course;
    this.studentYear = year;
    
    return { course, year };
}

    async updateStats() {
        try {
            const response = await fetch(`${this.apiUrl}/stats/summary`, {
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                const { total_announcements, urgent_count } = result.data;
                const totalCount = document.getElementById('totalCount');
                const urgentCount = document.getElementById('urgentCount');

                if (totalCount) totalCount.textContent = `${total_announcements} Total`;
                if (urgentCount) urgentCount.textContent = `${urgent_count} Urgent`;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    setupEventListeners() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachEventListeners());
        } else {
            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        const addBtnSelectors = [
            '#addAnnouncementBtn',
            '.add-announcement-btn',
            '[data-action="add-announcement"]',
            'button[onclick*="showModal"]'
        ];
        
        let addBtn = null;
        for (const selector of addBtnSelectors) {
            addBtn = document.querySelector(selector);
            if (addBtn) break;
        }

        const modal = document.getElementById('announcementModal');
        const closeBtn = document.getElementById('modalCloseBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const form = document.getElementById('announcementForm');

        console.log('🔍 Setting up event listeners...');
        console.log('Add button:', addBtn ? 'FOUND' : 'NOT FOUND');
        console.log('Modal:', modal ? 'FOUND' : 'NOT FOUND');

        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚀 Add button clicked');
                this.showModal();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e, 'priority'));
        });

        document.querySelectorAll('.course-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCourseFilterChange(e));
        });

        document.querySelectorAll('.year-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleYearFilterChange(e));
        });

        // Search input
        const searchInput = document.getElementById('announcementSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // FIXED: Image upload setup
        this.setupImageUpload();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && (modal.style.display === 'flex' || modal.classList.contains('active'))) {
                this.hideModal();
            }
        });

        console.log('🎉 Event listeners setup complete');
    }

    // COMPLETELY FIXED: Image upload handling
    setupImageUpload() {
        const uploadContainer = document.getElementById('imageUploadContainer');
        const imageInput = document.getElementById('imageInput');
        const imagePreview = document.getElementById('imagePreview');
        const removeBtn = document.getElementById('removeImageBtn');

        console.log('🖼️ Setting up image upload:', {
            uploadContainer: !!uploadContainer,
            imageInput: !!imageInput,
            imagePreview: !!imagePreview,
            removeBtn: !!removeBtn
        });

        if (uploadContainer && imageInput) {
            uploadContainer.addEventListener('click', () => {
                console.log('📁 Upload container clicked');
                imageInput.click();
            });

            uploadContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadContainer.style.borderColor = '#3498db';
                uploadContainer.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
            });

            uploadContainer.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadContainer.style.borderColor = '#dee2e6';
                uploadContainer.style.backgroundColor = '#f8f9fa';
            });

            uploadContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadContainer.style.borderColor = '#dee2e6';
                uploadContainer.style.backgroundColor = '#f8f9fa';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    imageInput.files = files;
                    this.handleImageSelection(files[0]);
                }
            });

            imageInput.addEventListener('change', (e) => {
                console.log('📸 Image input changed:', e.target.files.length);
                if (e.target.files.length > 0) {
                    this.handleImageSelection(e.target.files[0]);
                } else {
                    // FIXED: Handle case when no file is selected
                    this.clearImagePreview();
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                console.log('🗑️ Remove image button clicked');
                this.removeImage();
            });
        }
    }

    // FIXED: Better image selection handling
    handleImageSelection(file) {
        console.log('🖼️ Processing image selection:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        if (!file.type.startsWith('image/')) {
            this.showAlert('Please select a valid image file.', 'error');
            this.clearImagePreview();
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showAlert('Image size must be less than 5MB.', 'error');
            this.clearImagePreview();
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('📸 Image loaded for preview');
            this.showImagePreview(e.target.result);
        };
        
        reader.onerror = () => {
            console.error('❌ Error reading image file');
            this.showAlert('Error reading image file.', 'error');
            this.clearImagePreview();
        };
        
        reader.readAsDataURL(file);
    }

    // FIXED: Proper image preview management
    showImagePreview(imageSrc) {
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const uploadContainer = document.getElementById('imageUploadContainer');
        
        console.log('🖼️ Showing image preview');
        
        if (previewImage && imagePreview && uploadContainer) {
            previewImage.src = imageSrc;
            previewImage.onload = () => {
                console.log('✅ Preview image loaded successfully');
                imagePreview.style.display = 'block';
                uploadContainer.style.display = 'none';
            };
            previewImage.onerror = () => {
                console.error('❌ Error loading preview image');
                this.clearImagePreview();
            };
        }
    }

    // FIXED: Clear image preview properly
    clearImagePreview() {
        const imageInput = document.getElementById('imageInput');
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const uploadContainer = document.getElementById('imageUploadContainer');
        
        console.log('🧹 Clearing image preview');
        
        if (imageInput) imageInput.value = '';
        if (previewImage) {
            previewImage.src = '';
            previewImage.onload = null;
            previewImage.onerror = null;
        }
        if (imagePreview) imagePreview.style.display = 'none';
        if (uploadContainer) uploadContainer.style.display = 'block';
    }

    // FIXED: Remove image function
    removeImage() {
        console.log('🗑️ Removing image');
        this.clearImagePreview();
    }

    showLoading(show) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const announcementsList = document.getElementById('announcementsList');
        
        if (loadingSpinner) {
            loadingSpinner.style.display = show ? 'block' : 'none';
        }
        if (announcementsList) {
            announcementsList.style.display = show ? 'none' : 'block';
        }
    }



    // Add this method to track views accurately
async trackAnnouncementView(announcementId) {
    if (!announcementId) return;
    
    try {
        // Check if we've already viewed this announcement in this session
        const viewedKey = `announcement_viewed_${announcementId}`;
        const alreadyViewed = sessionStorage.getItem(viewedKey);
        
        if (!alreadyViewed) {
            const response = await fetch(`${this.apiUrl}/${announcementId}/view`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Mark as viewed in this session
                sessionStorage.setItem(viewedKey, 'true');
                console.log('👁️ View tracked for announcement:', announcementId);
            }
        }
    } catch (error) {
        console.error('Error tracking view:', error);
    }
}

    // COMPLETELY REDESIGNED: Better announcement rendering with robust image handling
    renderAnnouncements() {
        const container = document.getElementById('announcementsList');
        const noAnnouncementsMsg = document.getElementById('noAnnouncementsMessage');
        
        if (!container) return;

        if (this.announcements.length === 0) {
            container.innerHTML = '';
            if (noAnnouncementsMsg) noAnnouncementsMsg.style.display = 'block';
            return;
        }

        if (noAnnouncementsMsg) noAnnouncementsMsg.style.display = 'none';

        container.innerHTML = this.announcements.map(announcement => {
            console.log('🎨 Rendering announcement:', {
                id: announcement.id,
                title: announcement.title,
                hasImage: !!announcement.image_url,
                imageUrl: announcement.image_url
            });

            // COMPLETELY REDESIGNED image handling
            let imageHtml = '';
            if (announcement.image_url) {
                const imageUrl = this.getImageUrl(announcement.image_url);
                const filename = imageUrl.split('/').pop();
                
                console.log('🔗 Generated image URL:', imageUrl);
                
                imageHtml = `
                    <div class="announcement-image-container" style="margin: 15px 0; background: #f8f9fa; border-radius: 8px; padding: 15px;">
                        <div class="image-debug-info" style="margin-bottom: 10px; font-size: 12px; color: #666; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">
                            <div><strong>Debug Info:</strong></div>
                            <div>Original: ${announcement.image_url}</div>
                            <div>Generated: <a href="${imageUrl}" target="_blank" style="color: #007bff;">${imageUrl}</a></div>
                            <div>Filename: ${filename}</div>
                        </div>
                        <div class="image-wrapper" style="position: relative;">
                            <img src="${imageUrl}" 
                                 alt="Announcement image" 
                                 class="announcement-image" 
                                 style="max-width: 100%; height: auto; border-radius: 8px; display: block; border: 2px solid #dee2e6; transition: border-color 0.3s;"
                                 data-original-url="${announcement.image_url}"
                                 data-generated-url="${imageUrl}"
                                 data-announcement-id="${announcement.id}"
                                 onload="this.style.border='2px solid #28a745'; this.nextElementSibling.style.display='none'; console.log('✅ Image loaded:', this.src);"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; console.error('❌ Image failed:', this.src); window.announcementsManager.handleImageError(this);">
                            <div class="image-error-fallback" style="display: none; padding: 20px; text-align: center; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; color: #856404;">
                                <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px; color: #ff6b6b;"></i>
                                <div><strong>Image Loading Failed</strong></div>
                                <div style="font-size: 12px; margin: 10px 0;">
                                    <div>Filename: ${filename}</div>
                                    <div>URL: ${imageUrl}</div>
                                </div>
                                <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                                    <a href="${imageUrl}" target="_blank" style="color: #007bff; text-decoration: underline; font-size: 12px;">Direct Link</a>
                                    <a href="/api/debug/test-image/${filename}" target="_blank" style="color: #007bff; text-decoration: underline; font-size: 12px;">Debug Test</a>
                                    <a href="/api/announcements/image/${filename}" target="_blank" style="color: #007bff; text-decoration: underline; font-size: 12px;">API Serve</a>
                                    <button onclick="window.announcementsManager.retryImageLoad(this)" style="background: #007bff; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 12px; cursor: pointer;">Retry</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                
<div class="announcement-card" data-id="${announcement.id}" onclick="announcementsManager.trackAnnouncementView(${announcement.id})">
                    <div class="announcement-header">
                        <div class="announcement-badges">
                            <span class="priority-badge ${announcement.priority}">${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}</span>
                            ${announcement.target_course !== 'All' ? `<span class="course-badge">${announcement.target_course}</span>` : ''}
                            ${announcement.target_year !== 'All' ? `<span class="year-badge">${announcement.target_year}</span>` : ''}
                        </div>
                        <div class="announcement-actions">
                            <button class="action-btn edit" title="Edit" onclick="announcementsManager.editAnnouncement(${announcement.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" title="Delete" onclick="announcementsManager.deleteAnnouncement(${announcement.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="announcement-title">${this.escapeHtml(announcement.title)}</h3>
                    <div class="announcement-content">${this.escapeHtml(announcement.content)}</div>
                    ${imageHtml}
                    
<div class="announcement-meta">
    <div class="meta-left">
        <div class="meta-item">
            <i class="fas fa-user"></i>
            <span>${this.escapeHtml(announcement.posted_by_username || 'Unknown')} 
                ${announcement.posted_by_role ? `(${announcement.posted_by_role})` : ''}</span>
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
        
        // Start comprehensive debugging
        setTimeout(() => {
            this.debugImageLoading();
            this.testAllImages();
        }, 1000);
    }

    // NEW: Handle image loading errors with retry logic
    handleImageError(imgElement) {
        console.log('🔧 Handling image error for:', imgElement.src);
        
        const originalUrl = imgElement.dataset.originalUrl;
        const announcementId = imgElement.dataset.announcementId;
        const filename = imgElement.src.split('/').pop();
        
        console.log('🔄 Attempting image recovery:', {
            originalUrl,
            announcementId,
            filename,
            currentSrc: imgElement.src
        });
        
        // Try alternative URLs in sequence
        const alternatives = [
            `/uploads/announcements/${filename}`,
            `/api/announcements/image/${filename}`,
            `/api/debug/test-image/${filename}`
        ];
        
        this.tryImageAlternatives(imgElement, alternatives, 0);
    }

    // NEW: Try alternative image URLs
    tryImageAlternatives(imgElement, alternatives, index) {
        if (index >= alternatives.length) {
            console.log('❌ All image alternatives failed');
            return;
        }
        
        const alternativeUrl = `${window.location.origin}${alternatives[index]}`;
        console.log(`🔄 Trying alternative ${index + 1}:`, alternativeUrl);
        
        const testImg = new Image();
        testImg.onload = () => {
            console.log('✅ Alternative URL works:', alternativeUrl);
            imgElement.src = alternativeUrl;
            imgElement.style.display = 'block';
            imgElement.style.border = '2px solid #28a745';
            imgElement.nextElementSibling.style.display = 'none';
        };
        
        testImg.onerror = () => {
            console.log(`❌ Alternative ${index + 1} failed:`, alternativeUrl);
            this.tryImageAlternatives(imgElement, alternatives, index + 1);
        };
        
        testImg.src = alternativeUrl;
    }

    // NEW: Retry image loading button handler
    retryImageLoad(button) {
        const imageContainer = button.closest('.image-wrapper');
        const img = imageContainer.querySelector('.announcement-image');
        const errorDiv = imageContainer.querySelector('.image-error-fallback');
        
        console.log('🔄 Manual retry triggered for image');
        
        // Hide error, show loading state
        errorDiv.style.display = 'none';
        img.style.display = 'block';
        img.style.border = '2px solid #ffc107';
        
        // Force reload
        const originalSrc = img.src;
        img.src = '';
        setTimeout(() => {
            img.src = originalSrc + '?retry=' + Date.now();
        }, 100);
    }

    // COMPLETELY FIXED: Image URL generation
    getImageUrl(imageUrl) {
        if (!imageUrl) {
            console.log('🖼️ No image URL provided');
            return '';
        }
        
        console.log('🖼️ Processing image URL:', imageUrl);
        
        // If it's already a full URL, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            console.log('🔗 Using full URL:', imageUrl);
            return imageUrl;
        }
        
        // If it starts with /uploads/, it's already correct
        if (imageUrl.startsWith('/uploads/')) {
            const finalUrl = `${window.location.origin}${imageUrl}`;
            console.log('🔗 Using full path with origin:', finalUrl);
            return finalUrl;
        }
        
        // If it starts with uploads/ (without slash), add the slash
        if (imageUrl.startsWith('uploads/')) {
            const finalUrl = `${window.location.origin}/${imageUrl}`;
            console.log('🔗 Added leading slash with origin:', finalUrl);
            return finalUrl;
        }
        
        // If it's just a filename, construct the full path
        const finalUrl = `${window.location.origin}/uploads/announcements/${imageUrl}`;
        console.log('🔗 Generated URL from filename:', finalUrl);
        return finalUrl;
    }

    showModal(editMode = false, announcement = null) {
        const modal = document.getElementById('announcementModal');
        const modalTitle = document.getElementById('modalTitle');
        const saveButton = document.getElementById('saveBtnText');
        const form = document.getElementById('announcementForm');

        console.log('showModal called:', { editMode, hasAnnouncement: !!announcement });

        if (!modal) {
            console.error('Modal element not found!');
            return;
        }

        if (!form) {
            console.error('Form element not found!');
            return;
        }

        this.currentEditId = editMode ? announcement.id : null;

        // Update modal title and button text
        if (modalTitle) {
            modalTitle.textContent = editMode ? 'Edit Announcement' : 'Add New Announcement';
        }
        if (saveButton) {
            saveButton.textContent = editMode ? 'Update Announcement' : 'Save Announcement';
        }

        // Reset form and clear image preview
        form.reset();
        this.clearImagePreview();

        // Fill form if editing
        if (editMode && announcement) {
            const titleInput = document.getElementById('announcementTitle');
            const contentInput = document.getElementById('announcementContent');
            const audienceSelect = document.getElementById('targetAudience');
            const courseSelect = document.getElementById('targetCourse');
            const yearSelect = document.getElementById('targetYear');

            if (titleInput) titleInput.value = announcement.title;
            if (contentInput) contentInput.value = announcement.content;
            if (audienceSelect) audienceSelect.value = announcement.target_audience;
            if (courseSelect) courseSelect.value = announcement.target_course;
            if (yearSelect) yearSelect.value = announcement.target_year;

            const priorityRadio = document.querySelector(`input[name="priority"][value="${announcement.priority}"]`);
            if (priorityRadio) priorityRadio.checked = true;

           // COMPLETELY FIXED: Show existing image in edit mode with better loading
if (announcement.image_url) {
    console.log('🖼️ Loading existing image for edit:', announcement.image_url);
    const imageUrl = this.getImageUrl(announcement.image_url);
    console.log('🔗 Final image URL for edit preview:', imageUrl);
    
    // Test if image exists before showing preview
    const testImg = new Image();
    testImg.onload = () => {
        console.log('✅ Edit image loaded successfully, showing preview');
        this.showImagePreview(imageUrl);
    };
    testImg.onerror = () => {
        console.error('❌ Edit image failed to load:', imageUrl);
        // Don't show preview for broken images
    };
    testImg.src = imageUrl;
}
        }

        // Show modal
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.classList.add('active');
        modal.classList.remove('hidden');
        modal.style.zIndex = '99999';
        modal.style.position = 'fixed';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus on title input
        setTimeout(() => {
            const titleInput = document.getElementById('announcementTitle');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    hideModal() {
        const modal = document.getElementById('announcementModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            document.body.style.overflow = '';
            this.currentEditId = null;
            
            // Clear image preview when closing modal
            this.clearImagePreview();
        }
    }

    // Form submission remains the same as your original code...
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const saveBtn = document.getElementById('saveBtn');
        const saveIcon = document.getElementById('saveIcon');
        const saveBtnText = document.getElementById('saveBtnText');
        
        if (!saveBtn) return;

        try {
            // Disable submit button
            saveBtn.disabled = true;
            if (saveIcon) saveIcon.className = 'fas fa-spinner fa-spin';
            if (saveBtnText) saveBtnText.textContent = this.currentEditId ? 'Updating...' : 'Saving...';

            // Extract form data
            const titleElement = document.getElementById('announcementTitle');
            const contentElement = document.getElementById('announcementContent');
            const audienceElement = document.getElementById('targetAudience');
            const courseElement = document.getElementById('targetCourse');
            const yearElement = document.getElementById('targetYear');
            const priorityElement = document.querySelector('input[name="priority"]:checked');
            const imageInput = document.getElementById('imageInput');

            const title = titleElement?.value?.trim();
            const content = contentElement?.value?.trim();
            const targetAudience = audienceElement?.value || 'All Students';
            const targetCourse = courseElement?.value || 'All';
            const targetYear = yearElement?.value || 'All';
            const priority = priorityElement?.value || 'general';

            console.log('📊 Form data extracted:', {
                title: title ? `"${title}"` : 'EMPTY',
                titleLength: title?.length || 0,
                content: content ? `"${content.substring(0, 50)}..."` : 'EMPTY',
                contentLength: content?.length || 0,
                targetAudience,
                targetCourse,
                targetYear,
                priority,
                hasImage: !!(imageInput?.files?.length)
            });

            // Validation
            if (!title) {
                this.showAlert('Please enter a title for the announcement.', 'error');
                return;
            }

            if (!content) {
                this.showAlert('Please enter content for the announcement.', 'error');
                return;
            }

            if (title.length < 3) {
                this.showAlert('Title must be at least 3 characters long.', 'error');
                return;
            }

            if (content.length < 10) {
                this.showAlert('Content must be at least 10 characters long.', 'error');
                return;
            }

            // Get auth token
            const authToken = this.getAuthToken();
            if (!authToken) {
                this.showAlert('Please log in to continue. Authentication token not found.', 'error');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return;
            }

            // Prepare request
            const url = this.currentEditId 
                ? `${this.apiUrl}/${this.currentEditId}` 
                : this.apiUrl;

            const hasImage = imageInput && imageInput.files && imageInput.files[0];
            let requestOptions;

            if (hasImage) {
                // Use FormData for file upload
                const formData = new FormData();
                formData.append('title', title);
                formData.append('content', content);
                formData.append('target_audience', targetAudience);
                formData.append('target_course', targetCourse);
                formData.append('target_year', targetYear);
                formData.append('priority', priority);
                formData.append('image', imageInput.files[0]);
                
                requestOptions = {
                    method: this.currentEditId ? 'PUT' : 'POST',
                    body: formData,
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                };
            } else {
                // Use JSON for text-only requests
                const requestData = {
                    title,
                    content,
                    target_audience: targetAudience,
                    target_course: targetCourse,
                    target_year: targetYear,
                    priority
                };
                
                requestOptions = {
                    method: this.currentEditId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(requestData),
                    credentials: 'include'
                };
            }

            console.log('📡 Sending request...', {
                url,
                method: requestOptions.method,
                hasImage,
                hasAuth: !!authToken
            });

            // Make the request
            const response = await fetch(url, requestOptions);
            console.log('📨 Response received:', {
                status: response.status,
                ok: response.ok
            });

            let result;
            try {
                const responseText = await response.text();
                if (responseText.trim() === '') {
                    throw new Error('Empty response from server');
                }
                result = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('JSON parsing failed:', jsonError);
                throw new Error('Server returned invalid response. Please try again.');
            }

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(result.message || 'Access denied. Please check your permissions.');
                } else if (response.status === 401) {
                    throw new Error(result.message || 'Authentication failed. Please log in again.');
                } else if (response.status === 400) {
                    throw new Error(result.message || 'Please check that all required fields are filled correctly.');
                } else {
                    throw new Error(result.message || `Server error: ${response.status}`);
                }
            }

            if (result.success) {
                console.log('🎉 Request successful!');
                this.showAlert(
                    this.currentEditId ? 'Announcement updated successfully!' : 'Announcement created successfully!', 
                    'success'
                );
                
                this.hideModal();
                await this.loadAnnouncements();
                await this.updateStats();
            } else {
                throw new Error(result.message || 'Failed to save announcement');
            }

        } catch (error) {
            console.error('❌ Form submission error:', error);
            
            let errorMessage = error.message;
            
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (errorMessage.includes('403') || errorMessage.includes('Access denied')) {
                errorMessage = 'Access denied. Only Admin, Registrar, and Faculty can post announcements.';
            } else if (errorMessage.includes('401') || errorMessage.includes('Authentication')) {
                errorMessage = 'Your session has expired. Please refresh the page and log in again.';
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 3000);
            }
            
            this.showAlert(`Failed to save announcement: ${errorMessage}`, 'error');
        } finally {
            // Re-enable submit button
            saveBtn.disabled = false;
            if (saveIcon) saveIcon.className = 'fas fa-save';
            if (saveBtnText) {
                saveBtnText.textContent = this.currentEditId ? 'Update Announcement' : 'Save Announcement';
            }
        }
    }

    // Keep all other methods the same (editAnnouncement, deleteAnnouncement, filters, etc.)
    async editAnnouncement(id) {
        try {
            const authToken = this.getAuthToken();
            const headers = { 'Content-Type': 'application/json' };
            
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${this.apiUrl}/${id}`, {
                credentials: 'include',
                headers: headers
            });
            const result = await response.json();
            
            if (result.success) {
                this.showModal(true, result.data);
            } else {
                throw new Error(result.message || 'Failed to load announcement');
            }
        } catch (error) {
            console.error('Error loading announcement for edit:', error);
            this.showAlert('Failed to load announcement for editing.', 'error');
        }
    }

    async deleteAnnouncement(id) {
        if (!confirm('Are you sure you want to delete this announcement?')) {
            return;
        }

        try {
            const authToken = this.getAuthToken();
            const headers = {};
            
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: headers
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('Announcement deleted successfully!', 'success');
                await this.loadAnnouncements();
                await this.updateStats();
            } else {
                throw new Error(result.message || 'Failed to delete announcement');
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
            this.showAlert('Failed to delete announcement. Please try again.', 'error');
        }
    }

    // 1. FIRST: Add this debug method to your AnnouncementsManager class
async debugImageLoading() {
    console.log('🔍 Starting image loading debug...');
    
    try {
        // Test 1: Check what announcements we have
        const response = await fetch('/api/announcements', { credentials: 'include' });
        const result = await response.json();
        
        console.log('📋 Loaded announcements:', result.data?.length || 0);
        
        result.data?.forEach(announcement => {
            if (announcement.image_url) {
                console.log('🖼️ Found announcement with image:', {
                    id: announcement.id,
                    title: announcement.title,
                    imageUrl: announcement.image_url,
                    fullUrl: this.getImageUrl(announcement.image_url)
                });
                
                // Test if image loads
                this.testImageLoad(this.getImageUrl(announcement.image_url));
            }
        });
        
        // Test 2: Check debug endpoints
        const debugResponse = await fetch('/debug/image-test');
        const debugResult = await debugResponse.json();
        console.log('🔧 Debug info:', debugResult);
        
    } catch (error) {
        console.error('❌ Debug error:', error);
    }
}

// 2. Add this method to test individual images
async testImageLoad(imageUrl) {
        console.log('🧪 Testing image load:', imageUrl);
        
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            const timeout = setTimeout(() => {
                console.log('⏰ Image load timeout:', imageUrl);
                resolve(false);
            }, 5000);
            
            img.onload = () => {
                clearTimeout(timeout);
                console.log('✅ Image loaded successfully:', imageUrl, {
                    width: img.width,
                    height: img.height,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight
                });
                resolve(true);
            };
            
            img.onerror = async (error) => {
                clearTimeout(timeout);
                console.error('❌ Image failed to load:', imageUrl);
                
                // Try alternative URLs
                const alternatives = [
                    imageUrl.replace(window.location.origin, ''),
                    `/api/announcements/image/${imageUrl.split('/').pop()}`,
                    `/api/debug/test-image/${imageUrl.split('/').pop()}`
                ];
                
                console.log('🔄 Trying alternative URLs:', alternatives);
                
                for (const altUrl of alternatives) {
                    try {
                        const response = await fetch(altUrl);
                        if (response.ok) {
                            console.log('✅ Alternative URL works:', altUrl);
                            resolve(altUrl);
                            return;
                        }
                    } catch (e) {
                        console.log('❌ Alternative failed:', altUrl);
                    }
                }
                
                resolve(false);
            };
            
            img.src = imageUrl;
        });
    }



// 5. Call the debug button in your init method (modify your existing init method)
async init() {
    this.setupEventListeners();
    await this.loadAnnouncements();
    await this.updateStats();
    this.addDebugButton(); // Add this line
    console.log('AnnouncementsManager initialized with debugging');
}

    handleFilterChange(e, type) {
        e.preventDefault();
        const value = e.target.dataset.filter;
        
        e.target.parentElement.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.currentFilters[type] = value;
        this.loadAnnouncements();
    }

    handleCourseFilterChange(e) {
        e.preventDefault();
        const value = e.target.dataset.course;
        
        document.querySelectorAll('.course-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.currentFilters.target_course = value;
        this.loadAnnouncements();
    }

    handleYearFilterChange(e) {
        e.preventDefault();
        const value = e.target.dataset.year;
        
        document.querySelectorAll('.year-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.currentFilters.target_year = value;
        this.loadAnnouncements();
    }

    handleSearch(e) {
        this.currentFilters.search = e.target.value.trim();
        
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadAnnouncements();
        }, 300);
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `announcement-alert announcement-alert-${type}`;
        alert.innerHTML = `
            <div class="announcement-alert-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button class="announcement-alert-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);

        setTimeout(() => {
            alert.classList.add('show');
        }, 100);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDateTime(dateString) {
        if (!dateString) return 'Unknown date';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const dateOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const formattedDate = date.toLocaleDateString('en-US', dateOptions);
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

        if (diffMinutes < 60) {
            return `${diffMinutes === 1 ? '1 minute' : diffMinutes + ' minutes'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours === 1 ? '1 hour' : diffHours + ' hours'} ago`;
        } else if (diffDays === 1) {
            return `Yesterday at ${formattedTime}`;
        } else if (diffDays <= 7) {
            return `${diffDays} days ago at ${formattedTime}`;
        } else {
            return `${formattedDate}, ${formattedTime}`;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AnnouncementsManager...');
    window.announcementsManager = new AnnouncementsManager();
});