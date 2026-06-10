document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button');

  if (menuButton) {
    const overlay = document.createElement('nav');
    overlay.className = 'fullscreen-menu';
    overlay.setAttribute('aria-label', 'Menu principal');
    overlay.innerHTML = `
      <a href="/">Home</a>
      <a href="work.html">Work</a>
      <a href="otros.html">Playground</a>
    `;
    document.body.appendChild(overlay);

    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menu' : 'Abrir menu');
    });

    overlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        document.body.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const workItems = document.querySelectorAll('[data-categories]');

  let filterTimer;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      clearTimeout(filterTimer);

      workItems.forEach((item) => {
        const categories = item.dataset.categories.split(' ');
        const shouldShow = filter === 'all' || categories.includes(filter);

        if (shouldShow) {
          item.hidden = false;
          requestAnimationFrame(() => item.classList.remove('filtered-out'));
        } else {
          item.classList.add('filtered-out');
        }
      });

      filterTimer = setTimeout(() => {
        workItems.forEach((item) => {
          if (item.classList.contains('filtered-out')) {
            item.hidden = true;
          }
        });
      }, 220);
    });
  });
});
