let allArticles = []; // Global variable to store articles

document.addEventListener('DOMContentLoaded', function () {
    // Only run splash screen logic if we're on the index page
    const isIndexPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    
    if (isIndexPage) {
        // Splash screen logic (only applies to index.html)
        const splashBtn = document.querySelector('.splash-btn');
        if (splashBtn) {
            splashBtn.addEventListener('click', function (e) {
                e.preventDefault();
                sessionStorage.setItem('splashShown', 'true');
                document.querySelector('.splash-container').style.display = 'none';
                var mainContent = document.getElementById('main-content');
                mainContent.style.display = 'block';
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    initializeNavbarComponents();
                }, 100);
            });
        }

        var splashShown = sessionStorage.getItem('splashShown');
        if (!splashShown) {
            const splashContainer = document.querySelector('.splash-container');
            if (splashContainer) {
                splashContainer.style.display = 'block';
            }
        } else {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.style.display = 'block';
                setTimeout(initializeNavbarComponents, 300);
            }
        }

        if (document.getElementById('main-content')?.style.display === 'block') {
            setupAnimations();
        }
    } else {
        // For all other pages, just initialize components
        initializeNavbarComponents();
    }

    // Load blog posts if on blog.html
    if (document.getElementById('blog-posts')) {
        loadBlogPosts();
    }
    
    // Load blog preview on home page
    if (document.getElementById('home-blog-posts')) {
        loadHomeBlogPosts();
    }

    // Add search functionality
    const searchInput = document.querySelector('input[placeholder="Search articles..."]');
    const searchButton = document.querySelector('.input-group button');
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', function () {
            filterArticles(searchInput.value);
        });
        searchInput.addEventListener('input', function () {
            filterArticles(this.value);
        });
    }
});

function initializeNavbarComponents() {
    if (typeof bootstrap !== 'undefined') {
        var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
        dropdownElementList.map(function (dropdownToggleEl) {
            return new bootstrap.Dropdown(dropdownToggleEl);
        });
        var collapseElementList = [].slice.call(document.querySelectorAll('.navbar-toggler'));
        collapseElementList.map(function (collapseToggleEl) {
            return new bootstrap.Collapse(document.querySelector(collapseToggleEl.dataset.bsTarget), {
                toggle: false
            });
        });
    }
}

function setupAnimations() {
    const animatedElements = document.querySelectorAll('.card, .hero-banner, .feature-icon, h2.fw-bold, .lead');
    animatedElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animate__animated', 'animate__fadeIn');
        }, index * 150);
    });
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

function loadBlogPosts() {
    const articlesPath = '/assets/articles.json';
    fetch(articlesPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(articles => {
            console.log('Articles loaded:', articles);
            allArticles = articles; // Store articles globally
            renderArticles(articles);
        })
        .catch(error => {
            console.error('Error loading blog posts:', error);
            // Show a user-friendly error message
            document.getElementById('blog-posts').innerHTML = '<div class="alert alert-info">Blog posts are being updated. Please check back later.</div>';
        });
}

function renderArticles(articles) {
    const featuredContainer = document.getElementById('featured-post');
    const postsContainer = document.getElementById('blog-posts');
    
    if (postsContainer) {
        postsContainer.innerHTML = ''; // Clear existing posts
    }
    
    if (featuredContainer) {
        featuredContainer.innerHTML = ''; // Clear featured post
    }

    if (!articles || articles.length === 0) {
        if (postsContainer) {
            postsContainer.innerHTML = '<div class="alert alert-info">No articles found.</div>';
        }
        return;
    }

    articles.forEach(article => {
        const postHtml = `
            <article id="${article.id}" class="blog-post card mb-4 border-0 shadow animate__animated animate__fadeIn">
                <div class="card-body">
                    <h2 class="blog-post-title">${article.title}</h2>
                    <div class="blog-post-meta d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <span class="text-muted"><i class="far fa-calendar-alt"></i> ${article.date}</span>
                            <span class="ms-3 text-muted"><i class="far fa-user"></i> ${article.author}</span>
                        </div>
                        <div class="blog-post-share">
                            <a href="#" class="text-muted me-2"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="text-muted me-2"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="text-muted"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                    <div class="blog-featured-image mb-4 text-center">
                        <img src="${article.image}" class="img-fluid rounded" alt="${article.alt}" style="max-height: 400px; object-fit: contain;"
                            onerror="this.src='https://via.placeholder.com/800x400?text=${article.title.replace(/ /g, '+')}'">
                    </div>
                    <div class="blog-content">${article.content}</div>
                    <div class="blog-post-tags mt-4">
                        <i class="fas fa-tags me-2"></i>
                        ${article.tags.map(tag => `<span class="tag me-2">${tag}</span>`).join('')}
                    </div>
                </div>
            </article>`;
        
        if (article.isFeatured && featuredContainer) {
            const featuredHtml = `
                <div class="row g-0">
                    <div class="col-md-5">
                        <div class="blog-featured-image">
                            <img src="${article.image}" class="img-fluid rounded-start h-100 w-100 object-fit-cover" alt="${article.alt}"
                                onerror="this.src='https://via.placeholder.com/600x400?text=${article.title.replace(/ /g, '+')}'">
                        </div>
                    </div>
                    <div class="col-md-7">
                        <div class="card-body d-flex flex-column h-100">
                            <div class="d-flex align-items-center mb-2">
                                <span class="badge bg-primary me-2">Featured</span>
                                <small class="text-muted">${article.date}</small>
                            </div>
                            <h2 class="card-title h3">${article.title}</h2>
                            <p class="card-text flex-grow-1">${article.content.split('</p>')[0].replace('<p>', '')}...</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <a href="#${article.id}" class="btn btn-primary">Read Full Article</a>
                                <div>
                                    <span class="me-3"><i class="far fa-clock"></i> ${article.readTime}</span>
                                    <span><i class="far fa-eye"></i> ${article.views} views</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            featuredContainer.innerHTML = featuredHtml;
        }
        
        if (postsContainer) {
            postsContainer.innerHTML += postHtml;
        }
    });
}

function filterArticles(searchTerm) {
    const term = searchTerm.toLowerCase();
    const filteredArticles = allArticles.filter(article => 
        article.title.toLowerCase().includes(term) ||
        article.content.toLowerCase().includes(term) ||
        article.tags.some(tag => tag.toLowerCase().includes(term))
    );
    renderArticles(filteredArticles);
}

function loadHomeBlogPosts() {
    const articlesPath = '/assets/articles.json';
    fetch(articlesPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(articles => {
            const container = document.getElementById('home-blog-posts');
            if (!container) return;
            
            // Take only the first 3 articles (or however many exist)
            const articlesToShow = articles.slice(0, 3);
            
            container.innerHTML = ''; // Clear existing content
            
            articlesToShow.forEach((article, index) => {
                const truncatedContent = article.content.split('</p>')[0].replace('<p>', '');
                const cardHtml = `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card border-0 shadow h-100 blog-card animate__animated animate__fadeIn" style="animation-delay: ${index * 0.2}s;">
                            <div class="card-img-wrapper">
                                <img src="${article.image}" class="card-img-top" alt="${article.alt}"
                                    onerror="this.src='https://via.placeholder.com/300x200?text=${article.title.replace(/ /g, '+')}'">
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${article.title}</h5>
                                <p class="card-text text-muted small">${article.date}</p>
                                <p class="card-text flex-grow-1">${truncatedContent}...</p>
                                <a href="./pages/blog.html#${article.id}" class="btn btn-sm btn-outline-primary mt-auto">Read More</a>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML += cardHtml;
            });
            
            // If no articles, show a message
            if (articlesToShow.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p>No blog posts available yet.</p></div>';
            }
        })
        .catch(error => {
            console.error('Error loading home blog posts:', error);
            const container = document.getElementById('home-blog-posts');
            if (container) {
                container.innerHTML = '<div class="col-12 text-center"><p>Blog posts are being updated. Please check back later.</p></div>';
            }
        });
}

// Global booking button handler
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const bookButtons = document.querySelectorAll('.btn-cta, a[href*="contact.html"]');
        bookButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (!this.getAttribute('href')) {
                    e.preventDefault();
                    window.location.href = '/pages/contact.html';
                }
            });
        });
    }, 500);
});

// Scroll animations
function loadHomeBlogPosts() {
    const articlesPath = '/assets/articles.json';
    fetch(articlesPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(articles => {
            const container = document.getElementById('home-blog-posts');
            if (!container) return;
            
            // Take only the first 3 articles (or however many exist)
            const articlesToShow = articles.slice(0, 3);
            
            container.innerHTML = ''; // Clear existing content
            
            articlesToShow.forEach((article, index) => {
                const truncatedContent = article.content.split('</p>')[0].replace('<p>', '');
                const cardHtml = `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card border-0 shadow h-100 blog-card animate__animated animate__fadeIn" style="animation-delay: ${index * 0.2}s;">
                            <div class="card-img-wrapper">
                                <img src="${article.image}" class="card-img-top" alt="${article.alt}"
                                    onerror="this.src='https://via.placeholder.com/300x200?text=${article.title.replace(/ /g, '+')}'">
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${article.title}</h5>
                                <p class="card-text text-muted small">${article.date}</p>
                                <p class="card-text flex-grow-1">${truncatedContent}...</p>
                                <a href="./pages/blog.html#${article.id}" class="btn btn-sm btn-outline-primary mt-auto">Read More</a>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML += cardHtml;
            });
            
            // If no articles, show a message
            if (articlesToShow.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p>No blog posts available yet.</p></div>';
            }
        })
        .catch(error => {
            console.error('Error loading home blog posts:', error);
            const container = document.getElementById('home-blog-posts');
            if (container) {
                container.innerHTML = '<div class="col-12 text-center"><p>Blog posts are being updated. Please check back later.</p></div>';
            }
        });
}