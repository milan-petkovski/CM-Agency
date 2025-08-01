const isHomePage = /index|\/$/.test(window.location.href);
const isFaqPage = /\/faq\.html$/.test(window.location.href);
const isPostsPage = /postovi|\/$/.test(window.location.href);

//#region - HEADER STICKY & LOGO COLOR
const updateHeaderAndLogo = () => {
    const header = document.querySelector("header");
    const logo = document.querySelector(".logo");

    if (window.scrollY > 50) {
        header.classList.add("active");
        header.classList.remove("inactive");
        logo.classList.add("active");
        logo.classList.remove("inactive");
    } else {
        header.classList.add("inactive");
        header.classList.remove("active");
        logo.classList.add("inactive");
        logo.classList.remove("active");
    }
};

window.addEventListener("scroll", updateHeaderAndLogo);
window.addEventListener("load", updateHeaderAndLogo);

//#endregion

//#region - HEADER RESPONSIVE
if (isHomePage) {
    document.addEventListener('DOMContentLoaded', () => {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('header ul');

        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('ion-icon');
            icon.setAttribute('name', navMenu.classList.contains('active') ? 'close-outline' : 'menu-outline');
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.querySelector('ion-icon').setAttribute('name', 'menu-outline');
            });
        });
    });
}
//#endregion

//#region - FULL-PAGE SCROLL
if (isHomePage && window.innerWidth > 768) {
    let currentSection = 0;
    const sections = document.querySelectorAll('section');
    const totalSections = sections.length;
    let isScrolling = false;
    let scrollTimeout;

    const scrollToSection = (index) => {
        if (index >= 0 && index < totalSections) {
            isScrolling = true;
            sections[index].scrollIntoView({ behavior: 'smooth' });
            currentSection = index;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 800);
        }
    };

    const handleScrollEvent = (e) => {
        if (isScrolling) return;
        const direction = e.deltaY > 0 ? 'down' : 'up';
        if (direction === 'down' && currentSection < totalSections - 1) {
            scrollToSection(currentSection + 1);
        } else if (direction === 'up' && currentSection > 0) {
            scrollToSection(currentSection - 1);
        }
    };

    let wheelCooldown = false;
    window.addEventListener('wheel', e => {
        e.preventDefault();
        if (!wheelCooldown) {
            wheelCooldown = true;
            handleScrollEvent(e);
            setTimeout(() => wheelCooldown = false, 800);
        }
    }, { passive: false });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById(link.getAttribute('href').substring(1));
            if (target) scrollToSection(Array.from(sections).indexOf(target));
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isScrolling) {
                currentSection = Array.from(sections).indexOf(entry.target);
            }
        });
    }, { threshold: 0.6 });
    sections.forEach(section => observer.observe(section));

    let touchStartY = 0;
    window.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
    });
    window.addEventListener('touchmove', e => {
        const deltaY = touchStartY - e.touches[0].clientY;
        if (!isScrolling) {
            if (deltaY > 50 && currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
            } else if (deltaY < -50 && currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        }
    });
}

//#endregion

//#region - BACK TO TOP
const progressCircle = document.querySelector('#progress circle');
const progressWrapper = document.querySelector('#back-to-top');

if (progressCircle && progressWrapper) {
    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    const updateTotalHeight = () => document.documentElement.scrollHeight - window.innerHeight;

    const handleScrollBackToTop = () => {
        const totalHeight = updateTotalHeight();
        const scrollPosition = window.scrollY;
        const progressPercentage = (scrollPosition / totalHeight) * circumference;
        progressCircle.style.strokeDashoffset = circumference - progressPercentage;

        if (scrollPosition > 30) {
            progressWrapper.style.opacity = 1;
            progressWrapper.style.pointerEvents = 'auto';
        } else {
            progressWrapper.style.opacity = 0;
            progressWrapper.style.pointerEvents = 'none';
        }
    };

    window.addEventListener('load', handleScrollBackToTop);
    window.addEventListener('resize', handleScrollBackToTop);
    window.addEventListener('scroll', handleScrollBackToTop);

    const backToTopButton = document.querySelector('#backToTop');
    if (backToTopButton) {
        backToTopButton.onclick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
}

//#endregion

//#region - SHARE
const sharePost = () => {
    const shareData = { title: document.title, url: window.location.href };
    navigator.share ? navigator.share(shareData).catch(err => console.error('Share error:', err)) :
        alert('Deljenje nije podržano na ovom uređaju ili pretraživaču.');
};

//#endregion

//#region - RADOVI
if (isHomePage) {
    document.addEventListener('DOMContentLoaded', function() {
        const videoContainer = document.querySelector('.video-container');
        const prevVideoBtn = document.getElementById('prevVideo');
        const nextVideoBtn = document.getElementById('nextVideo');
        const videos = document.querySelectorAll('.video-card video');

        if (videoContainer && prevVideoBtn && nextVideoBtn && videos.length) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target;
                    if (entry.isIntersecting) {
                        video.play();
                    } else {
                        video.pause();
                        video.currentTime = 0;
                    }
                });
            }, {
                threshold: 0.5
            });

            videos.forEach(video => {
                observer.observe(video);
            });

            const scrollVideos = (direction) => {
                const cardWidth = document.querySelector('.video-card').offsetWidth + 25;
                const scrollAmount = cardWidth * 1;
                const currentScroll = videoContainer.scrollLeft;
                const maxScroll = videoContainer.scrollWidth - videoContainer.clientWidth;

                let newScrollPosition;
                if (direction === 'next') {
                    newScrollPosition = currentScroll + scrollAmount;
                    if (newScrollPosition > maxScroll) {
                        newScrollPosition = maxScroll;
                    }
                } else if (direction === 'prev') {
                    newScrollPosition = currentScroll - scrollAmount;
                    if (newScrollPosition < 0) {
                        newScrollPosition = 0;
                    }
                }

                newScrollPosition = Math.round(newScrollPosition / cardWidth) * cardWidth;

                videoContainer.scrollTo({
                    left: newScrollPosition,
                    behavior: 'smooth'
                });

                setTimeout(updateButtonStates, 300);
            };

            const updateButtonStates = () => {
                const maxScroll = videoContainer.scrollWidth - videoContainer.clientWidth;
                const currentScroll = videoContainer.scrollLeft;

                if (currentScroll <= 0) {
                    prevVideoBtn.style.visibility = 'hidden';
                    prevVideoBtn.style.opacity = '0';
                } else {
                    prevVideoBtn.style.visibility = 'visible';
                    prevVideoBtn.style.opacity = '1';
                }

                if (currentScroll >= maxScroll - 1) { // -1 za malu toleranciju
                    nextVideoBtn.style.visibility = 'hidden';
                    nextVideoBtn.style.opacity = '0';
                } else {
                    nextVideoBtn.style.visibility = 'visible';
                    nextVideoBtn.style.opacity = '1';
                }
            };

            updateButtonStates();
            prevVideoBtn.addEventListener('click', () => scrollVideos('prev'));
            nextVideoBtn.addEventListener('click', () => scrollVideos('next'));

            // Funkcije za kontrolu play/mute (možda ih treba dodeliti dugmadima u HTML-u)
            window.togglePlay = (button) => {
                let video = button.parentElement.querySelector('video');
                if (video.paused) {
                    video.play();
                    button.innerHTML = '<ion-icon name="pause-outline"></ion-icon>';
                } else {
                    video.pause();
                    button.innerHTML = '<ion-icon name="play-outline"></ion-icon>';
                }
            };
            window.toggleMute = (button) => {
                let video = button.parentElement.querySelector('video');
                video.muted = !video.muted;
                button.innerHTML = video.muted ? '<ion-icon name="volume-mute-outline"></ion-icon>' : '<ion-icon name="volume-high-outline"></ion-icon>';
            };
        }
    });
}
//#endregion

//#region - TESTIMONIAL
const testimonials = document.querySelectorAll('.testimonial-item');
if (testimonials.length) {
    let currentTestimonialIndex = 0;
    let testimonialInterval;

    const showTestimonial = (index) => {
        testimonials.forEach((item, i) => item.classList.toggle('active', i === index));
    };
    const nextTestimonial = () => {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
        showTestimonial(currentTestimonialIndex);
    };
    const prevTestimonial = () => {
        currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentTestimonialIndex);
    };
    const resetTestimonialInterval = () => {
        clearInterval(testimonialInterval);
        testimonialInterval = setInterval(nextTestimonial, 10000);
    };

    document.getElementById('prevTestimonial')?.addEventListener('click', () => {
        prevTestimonial();
        resetTestimonialInterval();
    });
    document.getElementById('nextTestimonial')?.addEventListener('click', () => {
        nextTestimonial();
        resetTestimonialInterval();
    });

    showTestimonial(currentTestimonialIndex);
    testimonialInterval = setInterval(nextTestimonial, 10000);
}
// #endregion

//#region - DARK MODE
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        toggleButton.textContent = body.classList.contains('dark-mode') ? '🌞' : '🌙';
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        toggleButton.textContent = '🌞';
    }
}

//#endregion

//#region - FAQ
if (isFaqPage) {
    document.addEventListener('DOMContentLoaded', () => {
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;

                faqQuestions.forEach(otherQuestion => {
                    if (otherQuestion !== question && otherQuestion.classList.contains('active')) {
                        otherQuestion.classList.remove('active');
                        otherQuestion.nextElementSibling.classList.remove('active');
                    }
                });

                question.classList.toggle('active');
                answer.classList.toggle('active');
            });
        });
    });
}
// #endregion

//#region - POSTOVI
if (isPostsPage) {
    document.addEventListener('DOMContentLoaded', function() {
        const postsData = {
            "1": {
                title: "Lansiranje Websajta",
                date: "1 March, 2025",
                content: `Sa modernim dizajnom i naprednim funkcionalnostima, naš novi veb sajt je tu da vas vodi kroz svet digitalnog marketinga i pomogne vam da postignete poslovni uspeh.
                U CM Agency, verujemo da svaki brend ima jedinstvenu priču koja zaslužuje da bude ispričana na pravi način. Naš tim stručnjaka za digitalni marketing posvećen je kreiranju kreativnih i efektivnih rešenja koja ne samo da privlače pažnju, već i povećavaju vaš poslovni rast.

                Šta nudimo?
                Naša agencija pruža širok spektar usluga koje su prilagođene potrebama modernog poslovanja:
                - Web Sajtova: Kreiramo responzivne i vizuelno privlačne sajtove koji odražavaju suštinu vašeg brenda i pružaju vrhunsko korisničko iskustvo.
                - SEO Optimizacija: Optimizujemo vaš sajt za pretraživače kako bi vaša ciljna publika lakše pronašla vašu ponudu.
                - Društvene Mreže: Pomažemo vam da izgradite snažno prisustvo na društvenim mrežama i da kreirate sadržaj koji angažuje i povezuje sa vašim pratiocima.
                - Digitalne Kampanje: Planiramo i sprovodimo digitalne kampanje koje donose merljive rezultate i povećavaju vašu vidljivost na mreži.

                Zašto izabrati baš nas?
                U CM Agency se ponosimo našim individualnim pristupom svakom klijentu. Razumemo da su potrebe svakog brenda drugačije, zbog čega pažljivo slušamo vaše ciljeve i kreiramo strategije koje su u skladu sa vašim poslovnim ambicijama.

                Naša Misija?
                Naša misija je da vam pomognemo da ostvarite pun potencijal vašeg brenda kroz inovativna digitalna rešenja i kreativne marketinške strategije. Uvek smo u toku sa najnovijim trendovima u industriji kako bismo osigurali da vaša komunikacija sa publikom bude autentična, relevantna i efektivna.
                            
                Povežite se sa nama!
                Spremni ste da podignete svoje poslovanje na viši nivo? Kontaktirajte nas danas! Naš tim stoji vam na raspolaganju da odgovori na sva vaša pitanja i da zajedno kreiramo uspešnu digitalnu priču vašeg brenda.
                Dobrodošli na novo digitalno putovanje sa CM Agency!`,
                image: "images/blog/launching.png"
            },
            "2": {
                title: "Kontaktiraj nas!",
                date: "1 March, 2025",
                content: `Imate pitanje ili želite da sarađujete?

                Ne oklevajte da nas kontaktirate! Naš tim stručnjaka je uvek tu da vas podrži i pruži sve potrebne informacije kako biste ostvarili uspešnu saradnju. Bilo da želite da saznate više o našim uslugama, imate specifične zahteve ili tražite savet, mi smo tu da odgovorimo na vaša pitanja.
                Svaka saradnja je prilika za nas da zajedno postignemo najbolje rezultate, pa čekamo vaš poziv sa nestrpljenjem. Popunite kontakt formu ispod i javite nam se. 

                Radujemo se budućoj saradnji!`,
                image: "images/blog/contact.png"
            },
            "3": {
                title: "Zaprati nas na Instagramu!",
                date: "1 March, 2025",
                content: `Pratite nas na Instagramu!
                
                Budite u toku sa najnovijim projektima, inspiracijama i promocijama! Na našem Instagram profilu delimo sve ono što nas inspiriše, kao i najnovije radove koje smo realizovali. Povežite se sa nama i ne propustite ni jedan naš post! Kliknite na link i postanite deo naše zajednice, gde ćete uvek imati priliku da vidite kreativne ideje i buduće projekte. 
                
                Ostanite u kontaktu i budite prvi koji će saznati o ekskluzivnim ponudama!`,
                image: "images/blog/follow_ig.png"
            },
            "4": {
                title: "Zaprati nas na TikToku!",
                date: "1 March, 2025",
                content: `Pratite nas na TikToku!
                
                Za kreativne video sadržaje, savete o dizajnu i marketingu, i mnogo više! Na našem TikTok profilu možete uživati u inspirativnim klipovima koji kombinuju zabavu i korisne informacije. Zabavite se, učite i inspirišite uz naše najnovije video postove. 
                
                Povežite se sa nama i budite u koraku sa svim novitetima u svetu dizajna i marketinga!`,
                image: "images/blog/follow_tt.png"
            }
        };

        const recommendedPostIds = [2, 3, 4];
        const postId = new URLSearchParams(window.location.search).get('id');

        if (postId && postsData[postId]) {
            const post = postsData[postId];
            document.querySelector('.post-title').textContent = post.title;
            document.querySelector('.post-meta time').textContent = post.date;
            document.querySelector('.post-content p').textContent = post.content;
            const postImage = document.querySelector('#post-image');
            if (postImage) {
                postImage.src = post.image;
                postImage.alt = post.title;
            }
        } else {
            const postSection = document.querySelector('.post');
            if (postSection) { // Proveri da li element postoji pre izmene
                postSection.innerHTML = "<p>Post nije pronađen!</p>";
            }
        }

        const recommendedContainer = document.querySelector('.recommended-posts');
        if (recommendedContainer) {
            recommendedPostIds.forEach(id => {
                const post = postsData[id];
                if (post) { // Proveri da li preporučeni post postoji u podacima
                    recommendedContainer.insertAdjacentHTML('beforeend', `
                        <div class="blog-card">
                            <a href="postovi.html?id=${id}">
                                <img src="${post.image}" alt="${post.title}">
                                <h3>${post.title}</h3>
                            </a>
                        </div>
                    `);
                }
            });
        }
    });
}
//#endregion
