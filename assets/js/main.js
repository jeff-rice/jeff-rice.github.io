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
    }, 0);
});

document.addEventListener('DOMContentLoaded', function () {
    var splashShown = sessionStorage.getItem('splashShown');
    if (!splashShown) {
        // Show the splash container if splashShown is not 'true'
        document.querySelector('.splash-container').style.display = 'block';
    } else {
        // Ensure main content is shown
        document.getElementById('main-content').style.display = 'block';
    }

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
});

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
}

function loadUserVideos(videos) {
    const videosContainer = document.getElementById('videosContainer');
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
