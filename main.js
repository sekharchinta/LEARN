// Global variables
let currentCourse = null;
let currentProgress = 0;

// Initialize the application
function init() {
    displayCourses();
    setupEventListeners();
    loadProgress();
}


// Load saved progress from localStorage
function loadProgress() {
    const savedProgress = localStorage.getItem('courseProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        courses.forEach(course => {
            if (progress[course.id]) {
                course.modules.forEach((module, index) => {
                    module.completed = progress[course.id][index] || false;
                });
            }
        });
    }
}

// Save progress to localStorage
function saveProgress() {
    const progress = {};
    courses.forEach(course => {
        progress[course.id] = course.modules.map(module => module.completed);
    });
    localStorage.setItem('courseProgress', JSON.stringify(progress));
}

// Display all courses
function displayCourses() {
    const coursesGrid = document.querySelector('.courses-grid');
    coursesGrid.innerHTML = courses.map(course => `
        <div class="course-card" data-course-id="${course.id}">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Course card clicks
    document.querySelector('.courses-grid').addEventListener('click', (e) => {
        const courseCard = e.target.closest('.course-card');
        if (courseCard) {
            const courseId = parseInt(courseCard.dataset.courseId);
            showCourseContent(courseId);
        }
    });

    // Take test button
    document.getElementById('take-test').addEventListener('click', showTest);
    
    // Submit test button
    document.getElementById('submit-test').addEventListener('click', submitTest);

    // Back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', goBack);
    });
}

// Show course content
function showCourseContent(courseId) {
    currentCourse = courses.find(course => course.id === courseId);
    if (!currentCourse) return;

    // Hide home section and show course content
    document.getElementById('home').classList.add('hidden');
    document.getElementById('course-content').classList.remove('hidden');
    
    // Update course title
    document.getElementById('course-title').textContent = currentCourse.title;
    
    // Display course modules
    const contentList = document.querySelector('.content-list');
    contentList.innerHTML = currentCourse.modules.map((module, index) => `
        <div class="content-item ${module.completed ? 'completed' : ''}" data-module="${index}">
            <h3>${module.title}</h3>
            <p class="content-description">${module.description}</p>
            <iframe width="100%" height="315" src="${module.videoUrl}" frameborder="0" allowfullscreen></iframe>
            <div class="module-footer">
                <a href="${module.resources}" target="_blank" class="resource-link"> Additional Resources</a>
                <button class="mark-complete-btn ${module.completed ? 'completed' : ''}" onclick="toggleModuleComplete(${index})">
                    ${module.completed ? '✓ Completed' : 'Mark as Complete'}
                </button>
            </div>
        </div>
    `).join('');

    updateProgress();
}

// Toggle module completion
function toggleModuleComplete(moduleIndex) {
    if (!currentCourse) return;
    
    currentCourse.modules[moduleIndex].completed = !currentCourse.modules[moduleIndex].completed;
    saveProgress();
    showCourseContent(currentCourse.id); // Refresh the content
    updateProgress();
}

// Update progress bar
function updateProgress() {
    if (!currentCourse) return;
    
    const completedModules = currentCourse.modules.filter(module => module.completed).length;
    const totalModules = currentCourse.modules.length;
    currentProgress = (completedModules / totalModules) * 100;

    document.querySelector('.progress').style.width = `${currentProgress}%`;
    document.querySelector('.progress-text').textContent = `${Math.round(currentProgress)}% Complete`;

    // Show/hide test button based on progress
    const takeTestButton = document.getElementById('take-test');
    if (currentProgress === 100) {
        takeTestButton.classList.remove('hidden');
    } else {
        takeTestButton.classList.add('hidden');
    }
}

// Show test section
function showTest() {
    document.getElementById('course-content').classList.add('hidden');
    document.getElementById('test-section').classList.remove('hidden');

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = currentCourse.quiz.map((q, qIndex) => `
        <div class="quiz-question">
            <h3>Question ${qIndex + 1}: ${q.question}</h3>
            <div class="quiz-options">
                ${q.options.map((option, oIndex) => `
                    <label>
                        <input type="radio" name="q${qIndex}" value="${oIndex}">
                        ${option}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Submit test
function submitTest() {
    let score = 0;
    currentCourse.quiz.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (selected && parseInt(selected.value) === q.correct) {
            score++;
        }
    });

    const percentage = (score / currentCourse.quiz.length) * 100;
    alert(`Your score: ${percentage}%`);

    // Return to home
    document.getElementById('test-section').classList.add('hidden');
    document.getElementById('home').classList.remove('hidden');
}

// Go back function
function goBack() {
    document.getElementById('course-content').classList.add('hidden');
    document.getElementById('test-section').classList.add('hidden');
    document.getElementById('home').classList.remove('hidden');
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init);