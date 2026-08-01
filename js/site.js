document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.body.classList.add('js-loaded'));
  const menuButton = document.querySelector('.menu-button');
  const siteHeader = document.querySelector('.site-header');

  if (siteHeader && !siteHeader.querySelector('.desktop-nav')) {
    const desktopNav = document.createElement('nav');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = [
      { href: 'index.html', label: 'Inicio', pages: ['index.html', ''] },
      { href: 'otros.html', label: 'Playground', pages: ['otros.html'] },
      { href: 'sobre-mi.html', label: 'Sobre mí', pages: ['sobre-mi.html'] },
      { href: 'work.html', label: 'Archivo', pages: ['work.html'] }
    ];

    desktopNav.className = 'desktop-nav';
    desktopNav.setAttribute('aria-label', 'Navegación principal');
    desktopNav.innerHTML = links.map((link) => {
      const activeClass = link.pages.includes(currentPage) ? ' class="active"' : '';
      return `<a href="${link.href}"${activeClass}>${link.label}</a>`;
    }).join('');

    if (menuButton) {
      siteHeader.insertBefore(desktopNav, menuButton);
    } else {
      siteHeader.appendChild(desktopNav);
    }
  }

  if (menuButton) {
    const overlay = document.createElement('nav');
    overlay.className = 'fullscreen-menu';
    overlay.setAttribute('aria-label', 'Menu principal');
    overlay.innerHTML = `
      <a href="index.html">Inicio</a>
      <a href="otros.html">Playground</a>
      <a href="sobre-mi.html">Sobre mí</a>
      <a href="work.html">Archivo</a>
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

  if (window.HOME_FEATURED_CATEGORIES) {
    document.querySelectorAll('.featured-group-heading').forEach((heading) => {
      const title = heading.querySelector('h2')?.textContent.trim();
      const link = heading.querySelector('.section-link');
      const slug = title && window.HOME_FEATURED_CATEGORIES[title];

      if (link && slug) {
        link.href = `work.html?category=${slug}`;
      }
    });
  }

  const revealSections = document.querySelectorAll(
    '.home-index .experience-section, .home-index .featured-group, .home-index .playground-callout, .home-index .services-section, .home-index .brands-section'
  );

  if (revealSections.length) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12
      });

      revealSections.forEach((section) => revealObserver.observe(section));
    } else {
      revealSections.forEach((section) => section.classList.add('is-visible'));
    }
  }

  const filterButtons = document.querySelectorAll('[data-filter-value]');
  const workItems = document.querySelectorAll('[data-categories]');
  const archiveGrid = document.querySelector('.archive-grid');
  const archiveFilterMenus = document.querySelectorAll('.archive-filter-menu[data-filter-group]');
  const archiveFilterToggles = document.querySelectorAll('[data-filter-toggle]');
  const archiveFilterClearButtons = document.querySelectorAll('[data-filter-clear]');
  const archiveClearAllButton = document.querySelector('[data-clear-all-filters]');
  const archiveViewButtons = document.querySelectorAll('[data-archive-view]');
  const filterLabels = {
    all: 'Todos',
    'ux-ui': 'UX/UI',
    'product-design': 'Product Design',
    'web-design': 'Diseño web',
    'art-direction': 'Dirección de arte',
    branding: 'Identidad visual',
    'social-media': 'Redes sociales',
    fintech: 'Fintech',
    hospitality: 'Hospitality',
    retail: 'Retail',
    bienestar: 'Bienestar',
    tecnologia: 'Tecnología',
    industrial: 'Industrial',
    servicios: 'Servicios',
    eventos: 'Eventos'
  };
  const workEntries = Array.from(workItems).map((item) => ({
    item,
    categories: new Set((item.dataset.categories || '').split(' ').filter(Boolean)),
    sector: item.dataset.sector || 'all'
  }));
  const activeArchiveFilters = {
    category: 'all',
    sector: 'all'
  };
  let filterFrame;

  if (archiveGrid) {
    const savedArchiveView = localStorage.getItem('archive-view') || 'columns';
    const setArchiveView = (view) => {
      const nextView = view === 'grid' ? 'grid' : 'columns';

      archiveGrid.classList.toggle('archive-grid--grid', nextView === 'grid');
      archiveGrid.classList.toggle('archive-grid--columns', nextView === 'columns');
      localStorage.setItem('archive-view', nextView);

      archiveViewButtons.forEach((button) => {
        const isActive = button.dataset.archiveView === nextView;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    };

    setArchiveView(savedArchiveView);

    archiveViewButtons.forEach((button) => {
      button.addEventListener('click', () => setArchiveView(button.dataset.archiveView));
    });
  }

  const closeArchiveFilters = () => {
    archiveFilterMenus.forEach((menu) => menu.classList.remove('is-open'));
    archiveFilterToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
  };

  archiveFilterToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const menu = toggle.closest('.archive-filter-menu');
      const wasOpen = menu?.classList.contains('is-open');

      closeArchiveFilters();

      if (!wasOpen && menu) {
        menu.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  if (archiveFilterMenus.length) {
    document.addEventListener('click', (event) => {
      if (event.target.closest('.archive-filter-menu')) {
        return;
      }
      closeArchiveFilters();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }
      closeArchiveFilters();
    });
  }

  const matchesArchiveFilters = (entry, overrideGroup, overrideValue) => {
    const categoryFilter = overrideGroup === 'category' ? overrideValue : activeArchiveFilters.category;
    const sectorFilter = overrideGroup === 'sector' ? overrideValue : activeArchiveFilters.sector;
    const categoryMatch = categoryFilter === 'all' || entry.categories.has(categoryFilter);
    const sectorMatch = sectorFilter === 'all' || entry.sector === sectorFilter;

    return categoryMatch && sectorMatch;
  };

  const updateFilterCounts = () => {
    filterButtons.forEach((button) => {
      const menu = button.closest('.archive-filter-menu');
      const group = menu?.dataset.filterGroup;
      const filter = button.dataset.filterValue;
      const baseLabel = button.dataset.baseLabel || button.textContent.trim().replace(/\s+\(\d+\)$/, '');
      const count = workEntries.filter((entry) => matchesArchiveFilters(entry, group, filter)).length;
      let counter = button.querySelector('.filter-count');

      button.dataset.baseLabel = baseLabel;
      if (!counter) {
        counter = document.createElement('span');
        counter.className = 'filter-count';
        counter.setAttribute('aria-hidden', 'true');
        button.appendChild(counter);
      }

      counter.textContent = `(${count})`;
      button.setAttribute('aria-label', `${baseLabel} (${count})`);
      button.disabled = count === 0 && filter !== 'all';
      button.classList.toggle('is-available', count > 0);
      button.classList.toggle('is-unavailable', count === 0 && filter !== 'all');
    });
  };

  const updateFilterClearButtons = () => {
    const hasActiveFilters = Object.values(activeArchiveFilters).some((value) => value !== 'all');

    archiveFilterClearButtons.forEach((clearButton) => {
      const group = clearButton.dataset.filterClear;
      clearButton.hidden = !group || activeArchiveFilters[group] === 'all';
    });

    if (archiveClearAllButton) {
      archiveClearAllButton.hidden = !hasActiveFilters;
    }
  };

  const applyArchiveFilters = () => {
    if (archiveGrid) {
      const activeFilters = Object.values(activeArchiveFilters).filter((value) => value !== 'all');
      archiveGrid.dataset.activeFilter = activeFilters.length ? activeFilters.join('-') : 'all';
    }

    document.body.classList.add('is-filtering');
    cancelAnimationFrame(filterFrame);

    workEntries.forEach((entry) => {
      const shouldShow = matchesArchiveFilters(entry);

      entry.item.hidden = !shouldShow;
      entry.item.classList.toggle('filtered-out', !shouldShow);
    });

    updateFilterCounts();
    updateFilterClearButtons();

    filterFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => document.body.classList.remove('is-filtering'));
    });
  };

  updateFilterCounts();

  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');

    button.addEventListener('click', () => {
      const menu = button.closest('.archive-filter-menu');
      const group = menu?.dataset.filterGroup;
      const filter = button.dataset.filterValue;

      if (!group) {
        return;
      }

      activeArchiveFilters[group] = filter;
      if (menu) {
        const label = menu.querySelector('[data-filter-label]');
        const defaultLabel = label?.dataset.defaultLabel || '';

        if (label) {
          label.textContent = filter === 'all'
            ? defaultLabel
            : `${defaultLabel}: ${filterLabels[filter] || button.getAttribute('aria-label')?.replace(/\s+\(\d+\)$/, '') || filter}`;
        }
      }

      menu?.querySelectorAll('[data-filter-value]').forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      closeArchiveFilters();
      applyArchiveFilters();
    });
  });

  if (archiveGrid) {
    const requestedCategory = new URLSearchParams(window.location.search).get('category');
    const requestedCategoryButton = requestedCategory
      ? Array.from(filterButtons).find((button) => {
        const menu = button.closest('.archive-filter-menu');
        return menu?.dataset.filterGroup === 'category' && button.dataset.filterValue === requestedCategory;
      })
      : null;

    requestedCategoryButton?.click();
  }

  const clearArchiveFilter = (group) => {

    if (!group) {
      return;
    }

    activeArchiveFilters[group] = 'all';

    const menu = document.querySelector(`.archive-filter-menu[data-filter-group="${group}"]`);
    const label = menu?.querySelector('[data-filter-label]');
    const defaultLabel = label?.dataset.defaultLabel || '';

    if (label) {
      label.textContent = defaultLabel;
    }

    menu?.querySelectorAll('[data-filter-value]').forEach((item) => {
      const isActive = item.dataset.filterValue === 'all';
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });

    applyArchiveFilters();
  };

  const resetArchiveFilterGroup = (group) => {
    const menu = document.querySelector(`.archive-filter-menu[data-filter-group="${group}"]`);
    const label = menu?.querySelector('[data-filter-label]');
    const defaultLabel = label?.dataset.defaultLabel || '';

    activeArchiveFilters[group] = 'all';

    if (label) {
      label.textContent = defaultLabel;
    }

    menu?.querySelectorAll('[data-filter-value]').forEach((item) => {
      const isActive = item.dataset.filterValue === 'all';
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  };

  archiveFilterClearButtons.forEach((clearButton) => {
    const handleClear = (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearArchiveFilter(clearButton.dataset.filterClear);
    };

    clearButton.addEventListener('click', handleClear);
    clearButton.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      handleClear(event);
    });
  });

  archiveClearAllButton?.addEventListener('click', () => {
    Object.keys(activeArchiveFilters).forEach(resetArchiveFilterGroup);
    closeArchiveFilters();
    applyArchiveFilters();
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
        video.loop = true;
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
    const timeStr = now.toLocaleTimeString('en-US', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    }).replace(/\s/g, ' ');
    const timezoneLabel = 'CDMX · GMT-6';

    document.querySelectorAll('.site-time').forEach(el => {
      el.innerHTML = `${timeStr}<span class="header-tz">${timezoneLabel}</span>`;
      el.setAttribute('datetime', timeStr);
    });

    document.querySelectorAll('.home-footer time').forEach(el => {
      el.innerHTML = `${timeStr}<span class="footer-tz">${timezoneLabel}</span>`;
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
      const aboutPhoto = e.target.closest('.about-photo-placeholder[data-cursor-label]');
      const label = cursor.querySelector('.x-cursor__label');
      if (label && aboutPhoto) {
        label.textContent = aboutPhoto.dataset.cursorLabel;
      } else if (label && card) {
        label.innerHTML = card.dataset.cursorLabel || `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2.5C4.5 2.5 2.3 4.1 1 7c1.3 2.9 3.5 4.5 6 4.5s4.7-1.6 6-4.5C11.7 4.1 9.5 2.5 7 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="7" cy="7" r="1.8" fill="currentColor"/></svg>Ver proyecto`;
      }
      cursor.classList.toggle('is-link', !!el && !card);
      cursor.classList.toggle('is-project', !!card || !!aboutPhoto);
    }

    document.addEventListener('mouseover', updateCursorState);
    document.addEventListener('mouseout', e => {
      if (!e.relatedTarget || !e.relatedTarget.closest('a, button, [data-draggable], .project-card, .about-photo-placeholder[data-cursor-label]')) {
        cursor.classList.remove('is-link', 'is-project');
      }
    });
  }
});
