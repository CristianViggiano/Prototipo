//Carousel de testimonios
const container = document.querySelector('.testimonios-container');
const testimonios = document.querySelectorAll('.testimonio');
const dotsContainer = document.querySelector('.dots-container');

let index = 0;
let autoSlide;

function createDots() {
    testimonios.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.addEventListener('click', () => showTestimonio(i));
        dotsContainer.appendChild(dot);
    });
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');
}

function showTestimonio(i) {
    if (i < 0) index = testimonios.length - 1;
    else if (i >= testimonios.length) index = 0;
    else index = i;
    container.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
}

function startAutoSlide() {
    autoSlide = setInterval(() => showTestimonio(index + 1), 5000);
}

function stopAutoSlide() {
    clearInterval(autoSlide);
}

const prevBtn = document.querySelector('.prev');

if (prevBtn) {
    prevBtn.addEventListener('click', () => showTestimonio(index - 1));
} else {
    console.warn('No se encontró el botón "prev" en el DOM');
}

const nextBtn = document.querySelector('.next');

if (nextBtn) {
    nextBtn.addEventListener('click', () => showTestimonio(index + 1));
} else {
    console.warn('No se encontró el botón "prev" en el DOM');
}

// Pausa cuando el usuario pasa el mouse
document.querySelector('.carousel').addEventListener('mouseenter', stopAutoSlide);
document.querySelector('.carousel').addEventListener('mouseleave', startAutoSlide);

createDots();
showTestimonio(index);
startAutoSlide();


//fin de carousel de testimonios

