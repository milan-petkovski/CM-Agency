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

//#endregion

//#region - SKROLL
if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
  let currentSection = 0;
  const sections = document.querySelectorAll('section');
  const totalSections = sections.length;
  let isScrolling = false;

  function scrollToSection(index) {
    if (index >= 0 && index < totalSections) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
      currentSection = index;
    }
  }

  // Debouncing za skrolovanje
  function debounceScroll(callback, delay = 500) {
    if (isScrolling) return;
    isScrolling = true;
    callback();
    setTimeout(() => {
      isScrolling = false;
    }, delay);
  }

  // Detekcija skrolovanja mišem
  window.addEventListener('wheel', (event) => {
    debounceScroll(() => {
      if (event.deltaY > 0 && currentSection < totalSections - 1) {
        scrollToSection(currentSection + 1);
      } else if (event.deltaY < 0 && currentSection > 0) {
        scrollToSection(currentSection - 1);
      }
    });
  });

  // Ažuriranje currentSection pri kliku na link
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        event.preventDefault();
        const index = Array.from(sections).indexOf(targetSection);
        scrollToSection(index);
      }
    });
  });

  // Ažuriranje currentSection pri manuelnom skrolovanju
  window.addEventListener('scroll', () => {
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
        currentSection = index;
      }
    });
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
  const url = window.location.href;
  const title = document.title;

  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).catch((error) => console.log('Greska u deljenju: ', error));
  } else {
    alert('Deljenje nije podržano na ovom uređaju ili pretraživaču.');
  }
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

  // Preporučeni postovi će biti uzeti iz objekta 'posts'
  const recommendedPostIds = [2, 3, 4];
  const postId = getQueryParam('id');

  if (postId && posts[postId]) {
    const post = posts[postId];
    document.querySelector('.post-title').innerText = post.title;
    document.querySelector('.post-meta time').innerText = post.date;
    document.querySelector('.post-content p').innerText = post.content;

    const postImage = document.querySelector('#post-image');
    if (postImage) {
      postImage.setAttribute('src', post.image);
      postImage.setAttribute('alt', post.title);
    }
  } else {
    document.querySelector('.post').innerHTML = "<p>Post nije pronađen!</p>";
  }

  // Dinamičko generisanje preporučenih postova
  const recommendedContainer = document.querySelector('.recommended-posts');
  recommendedPostIds.forEach((id) => {
    const post = posts[id];
    const card = document.createElement('div');
    card.classList.add('blog-card');
    card.innerHTML = `
      <a href="postovi.html?id=${id}">
      <img src="${post.image}" alt="${post.title}">
      <h3>${post.title}</h3>
      </a>
      `;
    recommendedContainer.appendChild(card);
  });
});

//#endregion

//#region - TESTIMONIAL
const prevBtn = document.getElementById('prevTestimonial');
const nextBtn = document.getElementById('nextTestimonial');
const testimonials = document.querySelectorAll('.testimonial-item');
let currentTestimonialIndex = 0;

function showTestimonial(index) {
  testimonials.forEach((testimonial, i) => {
    testimonial.classList.remove('active');
    if (i === index) {
      testimonial.classList.add('active');
    }
  });
}

prevBtn.addEventListener('click', () => {
  currentTestimonialIndex = (currentTestimonialIndex === 0) ? testimonials.length - 1 : currentTestimonialIndex - 1;
  showTestimonial(currentTestimonialIndex);
});

nextBtn.addEventListener('click', () => {
  currentTestimonialIndex = (currentTestimonialIndex === testimonials.length - 1) ? 0 : currentTestimonialIndex + 1;
  showTestimonial(currentTestimonialIndex);
});

// Auto slider for testimonials
setInterval(() => {
  currentTestimonialIndex = (currentTestimonialIndex === testimonials.length - 1) ? 0 : currentTestimonialIndex + 1;
  showTestimonial(currentTestimonialIndex);
}, 500000); // Change every 5 seconds

//#endregion

function toggleMute(btn) {
  const video = btn.previousElementSibling;
  video.muted = !video.muted;
  btn.querySelector('.icon').textContent = video.muted ? "🔇" : "🔊";
}
