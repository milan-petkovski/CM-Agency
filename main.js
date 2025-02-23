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
  const shareButton = event.target.closest('.share');
  const shareCount = shareButton.querySelector('data');

  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).then(() => {
      let currentValue = parseInt(shareCount.getAttribute('value'));
      shareCount.setAttribute('value', currentValue + 1);
      shareCount.innerText = currentValue + 1;
    }).catch((error) => console.log('Greska u deljenju: ', error));
  } else {
    alert('Deljenje nije podržano na ovom uređaju ili pretraživaču.');
  }
}

//#endregion
