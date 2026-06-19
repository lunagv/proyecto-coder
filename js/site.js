document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.body.classList.add('js-loaded'));
  const menuButton = document.querySelector('.menu-button');

  if (menuButton) {
    const overlay = document.createElement('nav');
    overlay.className = 'fullscreen-menu';
    overlay.setAttribute('aria-label', 'Menu principal');
    overlay.innerHTML = `
      <a href="index.html" data-label="Inicio"><span>Inicio</span></a>
      <a href="work.html" data-label="Proyectos"><span>Proyectos</span></a>
      <a href="otros.html" data-label="Playground"><span>Playground</span></a>
    `;
    document.body.appendChild(overlay);

    menuButton.setAttribute('aria-expanded', 'false');
    const closeMenu = (afterClose) => {
      document.body.classList.add('menu-closing');
      document.body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
      window.setTimeout(() => {
        document.body.classList.remove('menu-closing');
        if (afterClose) afterClose();
      }, 980);
    };

    menuButton.addEventListener('click', () => {
      if (document.body.classList.contains('menu-open')) {
        closeMenu();
        return;
      }
      document.body.classList.remove('menu-closing');
      document.body.classList.add('menu-open');
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Cerrar menu');
    });

    overlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') {
          return;
        }
        event.preventDefault();
        closeMenu(() => {
          window.location.href = link.href;
        });
      });
    });
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const workItems = document.querySelectorAll('[data-categories]');
  const workEntries = Array.from(workItems).map((item) => ({
    item,
    categories: new Set(item.dataset.categories.split(' '))
  }));
  let filterFrame;

  filterButtons.forEach((button) => {
    const filter = button.dataset.filter;
    const count = filter === 'all'
      ? workEntries.length
      : workEntries.filter(({ categories }) => categories.has(filter)).length;
    const counter = document.createElement('span');

    counter.className = 'filter-count';
    counter.textContent = count;
    counter.setAttribute('aria-hidden', 'true');
    button.appendChild(counter);
    button.setAttribute('aria-label', `${button.textContent.trim()} (${count})`);
  });

  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');

    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      document.body.classList.add('is-filtering');
      cancelAnimationFrame(filterFrame);

      workEntries.forEach(({ item, categories }) => {
        const shouldShow = filter === 'all' || categories.has(filter);

        item.hidden = !shouldShow;
        item.classList.toggle('filtered-out', !shouldShow);
      });

      filterFrame = requestAnimationFrame(() => {
        requestAnimationFrame(() => document.body.classList.remove('is-filtering'));
      });
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

  const modalLinks = Array.from(document.querySelectorAll('[data-modal-src]'));
  const mediaItems = modalLinks.map((link) => {
      const thumbnail = link.querySelector('img');
      const src = link.dataset.modalSrc;
      const type = link.dataset.modalType || (/\.(mp4|webm|mov)(\?|#|$)/i.test(src) ? 'video' : 'image');
      return {
        trigger: link,
        src,
        type,
        title: link.dataset.modalTitle || thumbnail?.alt || ''
      };
    }).filter((item) => item.src);

  if (mediaItems.length) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Vista ampliada de media');
    modal.innerHTML = `
      <button class="image-modal__close" type="button" aria-label="Cerrar">&times;</button>
      <button class="image-modal__nav image-modal__nav--prev" type="button" aria-label="Media anterior">&larr;</button>
      <figure class="image-modal__frame">
        <div class="image-modal__media"></div>
        <figcaption></figcaption>
      </figure>
      <button class="image-modal__nav image-modal__nav--next" type="button" aria-label="Media siguiente">&rarr;</button>
    `;
    document.body.appendChild(modal);

    const modalMedia = modal.querySelector('.image-modal__media');
    const modalCaption = modal.querySelector('figcaption');
    const closeButton = modal.querySelector('.image-modal__close');
    const prevButton = modal.querySelector('.image-modal__nav--prev');
    const nextButton = modal.querySelector('.image-modal__nav--next');
    let activeIndex = 0;

    const clearModalMedia = () => {
      modalMedia.querySelectorAll('video').forEach((video) => video.pause());
      modalMedia.replaceChildren();
    };

    const loadMedia = (index) => {
      activeIndex = (index + mediaItems.length) % mediaItems.length;
      const item = mediaItems[activeIndex];
      clearModalMedia();

      if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        modalMedia.appendChild(video);
      } else {
        const image = document.createElement('img');
        image.src = item.src;
        image.alt = item.title;
        modalMedia.appendChild(image);
      }

      modalCaption.textContent = item.title;
      const hideNavigation = mediaItems.length < 2;
      prevButton.hidden = hideNavigation;
      nextButton.hidden = hideNavigation;
    };

    const openModal = (index) => {
      loadMedia(index);
      document.body.classList.add('modal-open');
      modal.classList.add('is-open');
      closeButton.focus();
    };

    const closeModal = () => {
      document.body.classList.remove('modal-open');
      modal.classList.remove('is-open');
      clearModalMedia();
      modalCaption.textContent = '';
    };

    mediaItems.forEach(({ trigger }, index) => {
      const figure = trigger.closest('figure');
      trigger.classList.add('js-lightbox-trigger');
      figure?.classList.add('has-lightbox-media');

      if (!trigger.matches('a')) {
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('aria-label', 'Abrir media ampliado');
      }

      const openFromTrigger = (event) => {
        event.preventDefault();
        openModal(index);
      };

      trigger.addEventListener('click', openFromTrigger);
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          openFromTrigger(event);
        }
      });
    });

    closeButton.addEventListener('click', closeModal);
    prevButton.addEventListener('click', () => loadMedia(activeIndex - 1));
    nextButton.addEventListener('click', () => loadMedia(activeIndex + 1));
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
        loadMedia(activeIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        loadMedia(activeIndex + 1);
      }
    });
  }

  function updateClocks() {
    const tz = 'America/Mexico_City';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-MX', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    const dayStr = now.toLocaleDateString('es-MX', { timeZone: tz, weekday: 'long' });
    const day = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);

    document.querySelectorAll('.site-time').forEach(el => {
      el.innerHTML = `${timeStr}<span class="header-tz">${day} - México</span>`;
      el.setAttribute('datetime', timeStr);
    });

    document.querySelectorAll('.home-footer time').forEach(el => {
      el.innerHTML = `${timeStr}<br><span class="footer-tz">${day} - México</span>`;
    });
  }

  updateClocks();
  setInterval(updateClocks, 1000);

  // Custom cursor (only on pointer: fine devices)
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'x-cursor';
    cursor.innerHTML = `<span class="x-cursor__label"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2.5C4.5 2.5 2.3 4.1 1 7c1.3 2.9 3.5 4.5 6 4.5s4.7-1.6 6-4.5C11.7 4.1 9.5 2.5 7 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="7" cy="7" r="1.8" fill="currentColor"/></svg>Ver proyecto</span>`;
    document.body.appendChild(cursor);
    cursor.style.transform = 'translate(-999px, -999px)';

    let raf;

    document.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });
    });

    function updateCursorState(e) {
      const el = e.target.closest('a, button, [data-draggable]');
      const card = e.target.closest('.project-card');
      cursor.classList.toggle('is-link', !!el && !card);
      cursor.classList.toggle('is-project', !!card);
    }

    document.addEventListener('mouseover', updateCursorState);
    document.addEventListener('mouseout', e => {
      if (!e.relatedTarget || !e.relatedTarget.closest('a, button, [data-draggable], .project-card')) {
        cursor.classList.remove('is-link', 'is-project');
      }
    });
  }
});
