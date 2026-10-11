const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  navigation.classList.toggle('open', !isOpen);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  navigation.classList.remove('open');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    menuButton.click();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (navigation.classList.contains('open') && !event.target.closest('.header')) {
    menuButton.click();
  }
});
window.matchMedia('(max-width: 760px)').addEventListener('change', () => {
  if (navigation.classList.contains('open')) menuButton.click();
});
const config = window.CLASSICA_CONFIG;
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  const message = link.dataset.message || config.message;
  link.href = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
});
document.querySelector('#current-year').textContent = new Date().getFullYear();

const photos = config.gallery || [];
const photoGrid = document.querySelector('#photo-grid');
const photoDialog = document.querySelector('.photo-dialog');
const fullPhoto = document.querySelector('#photo-full');
const caption = document.querySelector('#photo-caption');
const counter = document.querySelector('#photo-counter');
const moreButton = document.querySelector('.gallery-more');
fullPhoto.draggable = false;
let currentPhoto = 0;
let previousFocus;

function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  const photo = photos[currentPhoto];
  fullPhoto.src = `assets/images/${photo.file}`;
  fullPhoto.alt = photo.alt;
  caption.textContent = photo.alt;
  counter.textContent = `${currentPhoto + 1} / ${photos.length}`;
}

photos.forEach((photo, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gallery-photo';
  button.hidden = index >= 6;
  button.setAttribute('aria-label', `Ampliar foto: ${photo.alt}`);
  const image = document.createElement('img');
  image.src = `assets/images/${photo.file}`;
  image.alt = photo.alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  if (photo.position) image.style.objectPosition = photo.position;
  button.append(image);
  button.addEventListener('click', () => {
    previousFocus = button;
    showPhoto(index);
    photoDialog.showModal();
    document.body.classList.add('photo-open');
  });
  photoGrid.append(button);
});

moreButton.hidden = photos.length <= 6;
moreButton.addEventListener('click', () => {
  const expanded = moreButton.getAttribute('aria-expanded') !== 'true';
  moreButton.setAttribute('aria-expanded', String(expanded));
  moreButton.textContent = expanded ? 'Mostrar menos fotos' : 'Ver todas as fotos';
  photoGrid.querySelectorAll('.gallery-photo').forEach((button, index) => {
    button.hidden = !expanded && index >= 6;
  });
});

document.querySelector('.photo-close').addEventListener('click', () => photoDialog.close());
document.querySelector('.photo-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
document.querySelector('.photo-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
let photoTouchStart;
fullPhoto.addEventListener('touchstart', event => {
  photoTouchStart = event.touches.length === 1
    ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
    : undefined;
}, { passive: true });
fullPhoto.addEventListener('touchend', event => {
  if (!photoTouchStart || !event.changedTouches.length) return;
  const deltaX = event.changedTouches[0].clientX - photoTouchStart.x;
  const deltaY = event.changedTouches[0].clientY - photoTouchStart.y;
  photoTouchStart = undefined;
  if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
    showPhoto(currentPhoto + (deltaX < 0 ? 1 : -1));
  }
}, { passive: true });
fullPhoto.addEventListener('touchcancel', () => { photoTouchStart = undefined; });
photoDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
photoDialog.addEventListener('click', event => {
  if (event.target === photoDialog) photoDialog.close();
});
photoDialog.addEventListener('close', () => {
  document.body.classList.remove('photo-open');
  previousFocus?.focus({ preventScroll: true });
});
