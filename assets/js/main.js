// On splash-btn click
document.querySelector('.splash-btn').addEventListener('click', function (e) {
    e.preventDefault();
    sessionStorage.setItem('splashShown', 'true');
    document.querySelector('.splash-container').style.display = 'none';

    // Ensure the main content is now visible
    var mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';

    // use setTimeout to allow the display change to take effect before scrolling
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Ensure Bootstrap's JS initializes dropdown menus
        initializeNavbarComponents();
    }, 100);
});

document.addEventListener('DOMContentLoaded', function () {
    var splashShown = sessionStorage.getItem('splashShown');
    if (!splashShown) {
        // Show the splash container if splashShown is not 'true'
        document.querySelector('.splash-container').style.display = 'block';
    } else {
        // Ensure main content is shown
        document.getElementById('main-content').style.display = 'block';
        
        // Initialize navbar components
        setTimeout(initializeNavbarComponents, 300);
    }

    // Setup animations when content is visible
    if (document.getElementById('main-content').style.display === 'block') {
        setupAnimations();
    }
    
    // Add these lines back only if you're using the authentication features
    // Otherwise, you can remove them if they're causing issues
    /*
    // Check if user is logged in
    fetch('http://localhost:3000/isAuthenticated', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.isAuthenticated) {
                showUserDashboard(data.user);
            } else {
                showLoginAndRegisterForms();
            }
        })
        .catch(error => console.log('Error:', error));
    */
});

// Make sure Bootstrap's JS properly initializes navbar components
function initializeNavbarComponents() {
    if (typeof bootstrap !== 'undefined') {
        // Initialize all dropdowns
        var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
        dropdownElementList.map(function (dropdownToggleEl) {
            return new bootstrap.Dropdown(dropdownToggleEl);
        });
        
        // Initialize all collapse elements (for mobile hamburger menu)
        var collapseElementList = [].slice.call(document.querySelectorAll('.navbar-toggler'));
        collapseElementList.map(function (collapseToggleEl) {
            return new bootstrap.Collapse(document.querySelector(collapseToggleEl.dataset.bsTarget), {
                toggle: false
            });
        });
    }
}

// Keep the original functionality for authentication if you're using it
function showUserDashboard(user) {
    document.getElementById('main-content').innerHTML = `
        <h1>Welcome, ${user.username}</h1>
        <h2>Your Videos</h2>
        <div id="videosContainer"></div>
        <button id="logoutBtn" class="btn btn-primary">Logout</button>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        fetch('http://localhost:3000/logout', { method: 'GET', credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    sessionStorage.removeItem('splashShown');
                    location.reload();
                }
            })
            .catch(error => console.log('Error:', error));
    });

    loadUserVideos(user.videos);
}

function showLoginAndRegisterForms() {
    // Only uncomment this if you're actually using the authentication features
    /*
    document.getElementById('main-content').innerHTML = `
        <div class="container mt-5">
            <h1>Login</h1>
            <form id="loginForm">
                <div class="mb-3">
                    <label for="loginUsername" class="form-label">Username:</label>
                    <input type="text" class="form-control" id="loginUsername" name="username" required>
                </div>
                <div class="mb-3">
                    <label for="loginPassword" class="form-label">Password:</label>
                    <input type="password" class="form-control" id="loginPassword" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
            <h1>Register</h1>
            <form id="registerForm">
                <div class="mb-3">
                    <label for="registerUsername" class="form-label">Username:</label>
                    <input type="text" class="form-control" id="registerUsername" name="username" required>
                </div>
                <div class="mb-3">
                    <label for="registerPassword" class="form-label">Password:</label>
                    <input type="password" class="form-control" id="registerPassword" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
            </form>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                showUserDashboard(data.user);
            } else {
                alert('Login failed!');
            }
        })
        .catch(error => console.log('Error:', error));
    });

    document.getElementById('registerForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                showUserDashboard(data.user);
            } else {
                alert('Registration failed!');
            }
        })
        .catch(error => console.log('Error:', error));
    });
    */
}

function loadUserVideos(videos) {
    const videosContainer = document.getElementById('videosContainer');
    if (videosContainer && videos) {
        videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.classList.add('video-item');
            videoElement.innerHTML = `
                <video controls width="100%">
                    <source src="${video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
            videosContainer.appendChild(videoElement);
        });
    }
}

// Setup animations for elements
function setupAnimations() {
    // Add animation classes to elements with a slight delay for each
    const animatedElements = document.querySelectorAll('.card, .hero-banner, .feature-icon, h2.fw-bold, .lead');
    
    animatedElements.forEach((element, index) => {
        // Add a small delay based on element index for staggered animation
        setTimeout(() => {
            element.classList.add('animate__animated', 'animate__fadeIn');
        }, index * 150);
    });
    
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.transition = 'transform 0.3s ease';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.transition = 'transform 0.3s ease';
            this.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
        });
    });
}

// Make Book Now buttons functional
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const bookButtons = document.querySelectorAll('.btn-cta, a[href*="contact.html"]');
        bookButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (!this.getAttribute('href')) {
                    e.preventDefault();
                    window.location.href = './pages/contact.html';
                }
            });
        });
    }, 500); // Delay to ensure all elements are loaded
});

// Handle animations when scrolling
window.addEventListener('scroll', function() {
    const animatedElements = document.querySelectorAll('.section-title, .card:not(.animate__animated)');
    
    animatedElements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.classList.add('animate__animated', 'animate__fadeIn');
        }
    });
});
