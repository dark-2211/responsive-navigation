const menuButton = document.querySelector('.menu-button');
const closeButton = document.querySelector('.close-button');
const drawer = document.querySelector('.drawer');
const links = document.querySelectorAll('nav a');
const desktop = window.matchMedia('(min-width: 760px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let closeTimer;
let closing = false;
let nextLink;

document.documentElement.classList.add('js');

function highlightLink() {
  const currentId = location.hash || '#home';

  links.forEach(link => {
    if (link.hash === currentId) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function openMenu() {
  if (desktop.matches || drawer.open) return;

  drawer.showModal();
  document.body.classList.add('menu-open');
  menuButton.setAttribute('aria-expanded', 'true');

  // The browser needs to see the starting position before we move the drawer.
  drawer.getBoundingClientRect();
  drawer.classList.add('open');
}

function finishClose() {
  if (!drawer.open) return;

  clearTimeout(closeTimer);
  drawer.classList.remove('open');
  drawer.close();
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  closing = false;

  if (nextLink) {
    const section = document.getElementById(nextLink.slice(1));
    location.hash = nextLink;
    section.focus({ preventScroll: true });
    section.scrollIntoView();
    nextLink = undefined;
  } else if (desktop.matches) {
    const activeLink = document.querySelector('.desktop-nav [aria-current]');
    (activeLink || document.querySelector('.logo')).focus();
  } else {
    menuButton.focus();
  }
}

function closeMenu(hash) {
  if (!drawer.open || closing) return;

  closing = true;
  nextLink = hash;
  drawer.classList.remove('open');

  if (reducedMotion.matches || desktop.matches) {
    finishClose();
  } else {
    // Also close if a resize or browser setting interrupts the transition.
    closeTimer = setTimeout(finishClose, 320);
  }
}

menuButton.addEventListener('click', openMenu);
closeButton.addEventListener('click', () => closeMenu());

drawer.addEventListener('cancel', event => {
  event.preventDefault();
  closeMenu();
});

drawer.addEventListener('click', event => {
  const link = event.target.closest('.mobile-nav a');
  if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    closeMenu(link.hash);
    return;
  }

  if (event.target === drawer && event.clientX < drawer.getBoundingClientRect().left) {
    closeMenu();
  }
});

drawer.addEventListener('transitionend', event => {
  if (closing && event.target === drawer && event.propertyName === 'transform') {
    finishClose();
  }
});

desktop.addEventListener('change', event => {
  if (event.matches) finishClose();
});

window.addEventListener('hashchange', highlightLink);
highlightLink();
