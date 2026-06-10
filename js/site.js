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

  const draggableHeroItems = document.querySelectorAll('[data-draggable]');
  let dragLayer = 10;

  draggableHeroItems.forEach((item) => {
    const stage = item.closest('.hero-still');
    if (!stage) {
      return;
    }

    const placeItem = (left, top) => {
      const stageRect = stage.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const maxLeft = Math.max(0, stageRect.width - itemRect.width);
      const maxTop = Math.max(0, stageRect.height - itemRect.height);
      item.style.left = `${Math.min(Math.max(left, 0), maxLeft)}px`;
      item.style.top = `${Math.min(Math.max(top, 0), maxTop)}px`;
      item.style.right = 'auto';
    };

    item.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) {
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const offsetX = event.clientX - itemRect.left;
      const offsetY = event.clientY - itemRect.top;

      item.classList.add('is-dragging');
      item.style.zIndex = String(++dragLayer);
      item.setPointerCapture(event.pointerId);
      event.preventDefault();

      const moveItem = (moveEvent) => {
        placeItem(
          moveEvent.clientX - stageRect.left - offsetX,
          moveEvent.clientY - stageRect.top - offsetY
        );
      };

      const stopDrag = () => {
        item.classList.remove('is-dragging');
        item.removeEventListener('pointermove', moveItem);
        item.removeEventListener('pointerup', stopDrag);
        item.removeEventListener('pointercancel', stopDrag);
      };

      item.addEventListener('pointermove', moveItem);
      item.addEventListener('pointerup', stopDrag);
      item.addEventListener('pointercancel', stopDrag);
    });

    item.addEventListener('keydown', (event) => {
      const movementKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
      if (!movementKeys.includes(event.key)) {
        return;
      }

      const itemRect = item.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const step = event.shiftKey ? 18 : 6;
      const currentLeft = itemRect.left - stageRect.left;
      const currentTop = itemRect.top - stageRect.top;
      const nextLeft = currentLeft + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0);
      const nextTop = currentTop + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0);

      placeItem(nextLeft, nextTop);
      event.preventDefault();
    });
  });

  const modalLinks = document.querySelectorAll('[data-modal-src]');

  if (modalLinks.length) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Vista ampliada de imagen');
    modal.innerHTML = `
      <button class="image-modal__close" type="button" aria-label="Cerrar">&times;</button>
      <button class="image-modal__nav image-modal__nav--prev" type="button" aria-label="Imagen anterior">&larr;</button>
      <figure class="image-modal__frame">
        <img src="" alt="">
        <figcaption></figcaption>
      </figure>
      <button class="image-modal__nav image-modal__nav--next" type="button" aria-label="Imagen siguiente">&rarr;</button>
    `;
    document.body.appendChild(modal);

    const modalImage = modal.querySelector('img');
    const modalCaption = modal.querySelector('figcaption');
    const closeButton = modal.querySelector('.image-modal__close');
    const prevButton = modal.querySelector('.image-modal__nav--prev');
    const nextButton = modal.querySelector('.image-modal__nav--next');
    const galleryItems = Array.from(modalLinks);
    let activeIndex = 0;

    const loadImage = (index) => {
      activeIndex = (index + galleryItems.length) % galleryItems.length;
      const link = galleryItems[activeIndex];
      const thumbnail = link.querySelector('img');
      modalImage.src = link.dataset.modalSrc;
      modalImage.alt = thumbnail?.alt || link.dataset.modalTitle || '';
      modalCaption.textContent = link.dataset.modalTitle || '';
      const hideNavigation = galleryItems.length < 2;
      prevButton.hidden = hideNavigation;
      nextButton.hidden = hideNavigation;
    };

    const openModal = (index) => {
      loadImage(index);
      document.body.classList.add('modal-open');
      modal.classList.add('is-open');
      closeButton.focus();
    };

    const closeModal = () => {
      document.body.classList.remove('modal-open');
      modal.classList.remove('is-open');
      modalImage.removeAttribute('src');
      modalImage.alt = '';
      modalCaption.textContent = '';
    };

    galleryItems.forEach((link, index) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        openModal(index);
      });
    });

    closeButton.addEventListener('click', closeModal);
    prevButton.addEventListener('click', () => loadImage(activeIndex - 1));
    nextButton.addEventListener('click', () => loadImage(activeIndex + 1));
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!modal.classList.contains('is-open')) {
        return;
      }

      if (event.key === 'Escape') {
        closeModal();
      }
      if (event.key === 'ArrowLeft') {
        loadImage(activeIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        loadImage(activeIndex + 1);
      }
    });
  }
});
