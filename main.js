//#region - SKROLL
let currentSection = 0; // Praćenje trenutne sekcije

const sections = document.querySelectorAll('section'); // Svi <section> elementi
const totalSections = sections.length;

function scrollToSection(index) {
  if (index >= 0 && index < totalSections) {
    sections[index].scrollIntoView({ behavior: 'smooth' });
    currentSection = index; // Ažuriraj trenutnu sekciju
  }
}

// Detekcija skrolovanja
window.addEventListener('wheel', (event) => {
  if (event.deltaY > 0) {
    // Skrolovanje dole, idemo na sledeću sekciju
    scrollToSection(currentSection + 1);
  } else {
    // Skrolovanje gore, idemo na prethodnu sekciju
    scrollToSection(currentSection - 1);
  }
});

// Detekcija na dugmiću za pomeranje sekcija (ako je potrebno)
document.querySelectorAll('.scroll-to-section-btn').forEach((button, index) => {
  button.addEventListener('click', () => {
    scrollToSection(index);
  });
});

//#endregion

//#region - BACK TO TOP
const progressCircle = document.querySelector('#progress circle');
const progressWrapper = document.querySelector('#back-to-top');
const radius = progressCircle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

const updateTotalHeight = () => document.documentElement.scrollHeight - window.innerHeight;

const handleScroll = () => {
    const totalHeight = updateTotalHeight();
    const scrollPosition = window.scrollY;
    const progressPercentage = (scrollPosition / totalHeight) * circumference;
    progressCircle.style.strokeDashoffset = circumference - progressPercentage;
    progressWrapper.style.opacity = scrollPosition > 30 ? 1 : 0;
};

window.addEventListener('load', handleScroll);
window.addEventListener('resize', handleScroll);
window.onscroll = handleScroll;

document.getElementById('backToTop').onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

//#endregion
