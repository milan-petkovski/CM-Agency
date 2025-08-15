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
    window.addEventListener('load', function() {
        const container = document.querySelector('.video-container');
        const prevBtn = document.getElementById('prevVideo');
        const nextBtn = document.getElementById('nextVideo');
        const cards = document.querySelectorAll('.video-card');

        if (!container || !prevBtn || !nextBtn || !cards.length) return;

        const getCardWidth = () => cards[0].offsetWidth + 25;

        // Lazy load + autoplay
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    if (!video.src) {
                        const src = video.dataset.src;
                        if (src) { video.src = src; video.load(); }
                    }
                    video.play().catch(err => { if (err.name !== "AbortError") console.error(err); });
                } else {
                    if (!video.paused) { video.pause(); video.currentTime = 0; }
                }
            });
        }, { threshold: 0.5 });

        cards.forEach(card => {
            const video = card.querySelector('video');
            video.volume = 0.3;
            observer.observe(video);
        });

        // Scroll funkcija
        const scroll = (dir) => {
            const scrollAmount = getCardWidth();
            const maxScroll = container.scrollWidth - container.clientWidth;
            let newScroll;

            if (dir === 'next') newScroll = Math.min(container.scrollLeft + scrollAmount, maxScroll);
            else newScroll = Math.max(container.scrollLeft - scrollAmount, 0);

            container.scrollTo({ left: newScroll, behavior: 'smooth' });
        };

        // Update strelica
        const updateButtons = () => {
            const tolerance = 1;
            const firstCardLeft = cards[0].getBoundingClientRect().left;
            const lastCardRight = cards[cards.length - 1].getBoundingClientRect().right;
            const containerRect = container.getBoundingClientRect();

            prevBtn.style.visibility = firstCardLeft >= containerRect.left - tolerance ? 'hidden' : 'visible';
            prevBtn.style.opacity = firstCardLeft >= containerRect.left - tolerance ? '0' : '1';

            nextBtn.style.visibility = lastCardRight <= containerRect.right + tolerance ? 'hidden' : 'visible';
            nextBtn.style.opacity = lastCardRight <= containerRect.right + tolerance ? '0' : '1';
        };

        prevBtn.addEventListener('click', () => { scroll('prev'); setTimeout(updateButtons, 300); });
        nextBtn.addEventListener('click', () => { scroll('next'); setTimeout(updateButtons, 300); });
        container.addEventListener('scroll', updateButtons);
        window.addEventListener('resize', updateButtons);

        updateButtons();
        setTimeout(updateButtons, 200);

        // Play / Pause dugme
        window.togglePlay = (btn) => {
            const video = btn.parentElement.querySelector('video');
            if (video.paused) { video.play().catch(err => { if (err.name !== "AbortError") console.error(err); }); btn.innerHTML = '<ion-icon name="pause-outline"></ion-icon>'; }
            else { video.pause(); btn.innerHTML = '<ion-icon name="play-outline"></ion-icon>'; }
        };

        // Mute dugme
        window.toggleMute = (btn) => {
            const video = btn.parentElement.querySelector('video');
            video.muted = !video.muted;
            btn.innerHTML = video.muted ? '<ion-icon name="volume-mute-outline"></ion-icon>' : '<ion-icon name="volume-high-outline"></ion-icon>';
        };
    });
}
//#endregion

//#region - TESTIMONIAL
document.addEventListener('DOMContentLoaded', () => {
  function adjustTestimonialHeight() {
    const items = document.querySelectorAll('.testimonial-item');

    items.forEach(item => {
      item.style.minHeight = 'initial';
    });

    if (window.innerWidth <= 1024) {
      let maxHeight = 0;

      items.forEach(item => {
        const prevDisplay = item.style.display;
        const prevPosition = item.style.position;
        const prevVisibility = item.style.visibility;

        item.style.display = 'block';
        item.style.position = 'absolute';
        item.style.visibility = 'hidden';

        const height = item.offsetHeight;
        if (height > maxHeight) maxHeight = height;

        item.style.display = prevDisplay;
        item.style.position = prevPosition;
        item.style.visibility = prevVisibility;
      });

      items.forEach(item => {
        item.style.minHeight = maxHeight + 'px';
      });
    }
  }

  adjustTestimonialHeight();
  window.addEventListener('resize', adjustTestimonialHeight);
});

const testimonials = document.querySelectorAll('.testimonial-item');

if (testimonials.length) {
  let currentTestimonialIndex = 0;
  let testimonialInterval;

  const showTestimonial = index => {
    testimonials.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
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
