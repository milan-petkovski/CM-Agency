//#region - HEADER
window.addEventListener("scroll", function() {
  const header = document.querySelector("header");
  const logo = document.querySelector(".logo");
  
  if (window.scrollY > 50) {
      // Ako je stranica pomerena više od 50px, postavljamo crnu pozadinu i crni tekst
      header.classList.add("active");
      header.classList.remove("inactive");
      logo.classList.add("active");
      logo.classList.remove("inactive");
  } else {
      // Ako nije pomereno više od 50px, postavljamo belu pozadinu i tamni tekst
      header.classList.add("inactive");
      header.classList.remove("active");
      logo.classList.add("inactive");
      logo.classList.remove("active");
  }
});

// Dodaj početnu proveru prilikom učitavanja stranice
window.addEventListener("load", function() {
  const header = document.querySelector("header");
  const logo = document.querySelector(".logo");

  if (window.scrollY > 50) {
      // Ako je stranica već pomerena pri učitavanju, postavljamo crnu pozadinu i crni tekst
      header.classList.add("active");
      header.classList.remove("inactive");
      logo.classList.add("active");
      logo.classList.remove("inactive");
  } else {
      // Inače ostavljamo početno stanje sa belom pozadinom
      header.classList.add("inactive");
      header.classList.remove("active");
      logo.classList.add("inactive");
      logo.classList.remove("active");
  }
});

//#endregion

//#region - SKROLL
if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
  let currentSection = 0;
  const sections = document.querySelectorAll('section');
  const totalSections = sections.length;
  let isScrolling = false;
  let lastScrollTime = 0;
  const debounceDelay = 800;

  function scrollToSection(index) {
      if (index >= 0 && index < totalSections && !isScrolling) {
          isScrolling = true;
          sections[index].scrollIntoView({ behavior: 'smooth' });
          currentSection = index;
          setTimeout(() => isScrolling = false, debounceDelay);
      }
  }

  function debounceScroll(direction) {
      const now = Date.now();
      if (now - lastScrollTime < debounceDelay || isScrolling) return;
      lastScrollTime = now;
      direction === 'down' && currentSection < totalSections - 1 ? scrollToSection(currentSection + 1) :
      direction === 'up' && currentSection > 0 ? scrollToSection(currentSection - 1) : null;
  }

  window.addEventListener('wheel', e => { e.preventDefault(); debounceScroll(e.deltaY > 0 ? 'down' : 'up'); }, { passive: false });
  
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(link.getAttribute('href').substring(1));
      if (target) scrollToSection(Array.from(sections).indexOf(target));
  }));

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting && !isScrolling && (currentSection = Array.from(sections).indexOf(entry.target)));
  }, { root: null, threshold: 0.6 });

  sections.forEach(section => observer.observe(section));

  let touchStartY = 0;
  window.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY);
  window.addEventListener('touchmove', e => {
      const deltaY = touchStartY - e.touches[0].clientY;
      debounceScroll(deltaY > 0 ? 'down' : 'up');
      touchStartY = e.touches[0].clientY;
  });
}

//#endregion

//#region - BACK TO TOP
const progressCircle = document.querySelector('#progress circle');
const progressWrapper = document.querySelector('#back-to-top');
const radius = progressCircle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

const updateTotalHeight = () => document.documentElement.scrollHeight - window.innerHeight;

const handleScrollBackToTop = () => {
    const totalHeight = updateTotalHeight();
    const scrollPosition = window.scrollY;
    const progressPercentage = (scrollPosition / totalHeight) * circumference;
    progressCircle.style.strokeDashoffset = circumference - progressPercentage;

    // Ako je skrolovano više od 30px, prikazujemo dugme, inače sakrivamo
    if (scrollPosition > 30) {
        progressWrapper.style.opacity = 1;
        progressWrapper.style.pointerEvents = 'auto';
    } else {
        progressWrapper.style.opacity = 0;
        progressWrapper.style.pointerEvents = 'none';
    }
};

// Dodajemo događaje za skrolovanje bez preklapanja
window.addEventListener('load', handleScrollBackToTop);
window.addEventListener('resize', handleScrollBackToTop);
window.addEventListener('scroll', handleScrollBackToTop);

// Funkcija za skrolovanje na početak stranice
document.querySelector('#backToTop').onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
//#endregion

//#region - SHARE
function sharePost() {
  const shareData = { title: document.title, url: window.location.href };
  navigator.share ? navigator.share(shareData).catch(err => console.error('Share error:', err)) :
  alert('Deljenje nije podržano na ovom uređaju ili pretraživaču.');
}

//#endregion

//#region - POSTOVI
document.addEventListener('DOMContentLoaded', function() {
  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Podaci o postovima
  const posts = {
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
      Spremni ste da podignete svoje poslovanje na viši nivKontaktirajte nas danas! Naš tim stoji vam na raspolaganju da odgovori na sva vaša pitanja i da zajedno kreiramo uspešnu digitalnu priču vašeg brenda.
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

  if (postId && posts[postId]) {
      const post = posts[postId];
      document.querySelector('.post-title').textContent = post.title;
      document.querySelector('.post-meta time').textContent = post.date;
      document.querySelector('.post-content p').textContent = post.content;
      const postImage = document.querySelector('#post-image');
      if (postImage) {
          postImage.src = post.image;
          postImage.alt = post.title;
      }
  } else {
      document.querySelector('.post').innerHTML = "<p>Post nije pronađen!</p>";
  }

  const recommendedContainer = document.querySelector('.recommended-posts');
  recommendedPostIds.forEach(id => {
      const post = posts[id];
      recommendedContainer.insertAdjacentHTML('beforeend', `
          <div class="blog-card">
              <a href="postovi.html?id=${id}">
                  <img src="${post.image}" alt="${post.title}">
                  <h3>${post.title}</h3>
              </a>
          </div>
      `);
  });
});

//#endregion

//#region - TESTIMONIAL
const testimonials = document.querySelectorAll('.testimonial-item');
let currentTestimonialIndex = 0;

function showTestimonial(index) {
    testimonials.forEach((item, i) => item.classList.toggle('active', i === index));
}

document.getElementById('prevTestimonial')?.addEventListener('click', () => {
    currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonialIndex);
});

document.getElementById('nextTestimonial')?.addEventListener('click', () => {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    showTestimonial(currentTestimonialIndex);
});

setInterval(() => {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    showTestimonial(currentTestimonialIndex);
}, 10000);
// #endregion

//#region - RADOVI
function togglePlay(btn) {
  const video = btn.closest('.video-card')?.querySelector('video');
  const icon = btn.querySelector('ion-icon');
  if (video) {
      video.paused ? video.play() : video.pause();
      icon?.setAttribute('name', video.paused ? 'play-outline' : 'pause-outline');
  }
}

function toggleMute(btn) {
  const video = btn.closest('.video-card')?.querySelector('video');
  const icon = btn.querySelector('ion-icon');
  if (video) {
      video.muted = !video.muted;
      icon?.setAttribute('name', video.muted ? 'volume-mute-outline' : 'volume-high-outline');
  }
}

//#endregion
