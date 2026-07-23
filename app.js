/**
 * JESHURUN BUILDER'S & DEVELOPER'S - CLIENT SIDE APP LOGIC
 * Includes SPA View Router with Sweep Curtain Transition, Counter Up Animation, 
 * Text Animations, Interactive Capabilities Modal, WhatsApp contact redirect.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. SINGLE PAGE ROUTER WITH CURTAIN SWEEP TRANSITION
  // ==========================================================================
  const viewSections = document.querySelectorAll('.view-section');
  const transitionOverlay = document.getElementById('page-transition-overlay');
  let isNavigating = false;

  function router(targetHash) {
    let hash = targetHash || window.location.hash || '#home';
    let route = hash.replace('#', '');
    
    // Map of routes to view element IDs
    const routeMap = {
      'home': 'home-view',
      'about': 'about-view',
      'projects': 'projects-view',
      'services': 'services-view',
      'gallery': 'gallery-view',
      'contact': 'contact-view',
      'gallery-residential': 'gallery-residential-view',
      'gallery-commercial': 'gallery-commercial-view',
      'gallery-interior': 'gallery-interior-view',
      'gallery-progress': 'gallery-progress-view',
      'gallery-completed': 'gallery-completed-view'
    };

    const activeViewId = routeMap[route] || 'home-view';
    const activeViewEl = document.getElementById(activeViewId);
    
    if (!activeViewEl) return;

    // If curtain transition is available, perform sweep animation
    if (transitionOverlay && !isNavigating) {
      isNavigating = true;
      transitionOverlay.classList.add('active-transition');

      // Swap active section at midpoint (350ms)
      setTimeout(() => {
        viewSections.forEach(section => section.classList.remove('active'));
        activeViewEl.classList.add('active');
        updateNavActiveStates(route);
        window.scrollTo(0, 0);
        triggerViewLoadAnimations(activeViewId);
      }, 350);

      // Clean up classes after sweep completes (700ms)
      setTimeout(() => {
        transitionOverlay.classList.remove('active-transition');
        isNavigating = false;
      }, 700);
    } else {
      // Fallback if transition overlay is not found
      viewSections.forEach(section => section.classList.remove('active'));
      activeViewEl.classList.add('active');
      updateNavActiveStates(route);
      window.scrollTo(0, 0);
      triggerViewLoadAnimations(activeViewId);
    }
  }

  function updateNavActiveStates(route) {
    const links = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-links .mobile-nav-link, .mobile-bottom-nav .bottom-nav-item');
    links.forEach(link => {
      const dataView = link.getAttribute('data-view');
      const normalizedView = route.startsWith('gallery-') ? 'gallery' : route;
      if (dataView === normalizedView) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Intercept navigation links click to trigger custom router
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const targetView = href.replace('#', '');
        const validRoutes = { 
          'home': 1, 'about': 1, 'projects': 1, 'services': 1, 'gallery': 1, 'contact': 1,
          'gallery-residential': 1, 'gallery-commercial': 1, 'gallery-interior': 1,
          'gallery-progress': 1, 'gallery-completed': 1
        };
        
        if (targetView in validRoutes) {
          e.preventDefault();
          history.pushState(null, null, href);
          router(href);
        }
      }
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    router();
  });

  // Initialize router
  router();


  // ==========================================================================
  // 2. MOBILE MENU DRAWER
  // ==========================================================================
  const burgerToggle = document.querySelector('.mobile-menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-overlay-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-links .mobile-nav-link');

  if (burgerToggle && mobileOverlay) {
    burgerToggle.addEventListener('click', () => {
      burgerToggle.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
      
      const spans = burgerToggle.querySelectorAll('span');
      if (burgerToggle.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(6px, -7px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerToggle.classList.remove('active');
        mobileOverlay.classList.remove('active');
        const spans = burgerToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }


  // ==========================================================================
  // 3. HERO SLIDER CAROUSEL
  // ==========================================================================
  const heroSlides = document.querySelectorAll('.hero-slide');
  const slideDots = document.querySelectorAll('.slider-dots .dot');
  const prevArrow = document.querySelector('.prev-arrow');
  const nextArrow = document.querySelector('.next-arrow');
  let currentSlideIndex = 0;
  let slideInterval;

  function showSlide(index) {
    if (heroSlides.length === 0) return;
    heroSlides.forEach((slide, idx) => {
      slide.classList.remove('active');
      slideDots[idx].classList.remove('active');
    });

    currentSlideIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides[currentSlideIndex].classList.add('active');
    slideDots[currentSlideIndex].classList.add('active');
    
    const title = heroSlides[currentSlideIndex].querySelector('.hero-title');
    if (title && title.classList.contains('animated-text')) {
      animateLetters(title);
    }
  }

  function nextSlide() { showSlide(currentSlideIndex + 1); }
  function prevSlide() { showSlide(currentSlideIndex - 1); }

  function startSlideShow() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 6000);
  }

  if (heroSlides.length > 0) {
    if (nextArrow) nextArrow.addEventListener('click', () => { prevSlide(); startSlideShow(); });
    if (prevArrow) prevArrow.addEventListener('click', () => { nextSlide(); startSlideShow(); });

    slideDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        showSlide(index);
        startSlideShow();
      });
    });

    showSlide(0);
    startSlideShow();
  }


  // ==========================================================================
  // 4. STATS COUNTER TICKER
  // ==========================================================================
  function animateCounters(statsEl) {
    const counterNumbers = statsEl.querySelectorAll('.stat-number');
    counterNumbers.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const duration = 1500;
      let startTime = null;

      function updateCounter(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentValue = Math.floor(progress * target);
        
        counter.textContent = currentValue;
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      }
      requestAnimationFrame(updateCounter);
    });
  }

  const statsSections = document.querySelectorAll('.stats-section');
  statsSections.forEach(section => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    observer.observe(section);
  });


  // ==========================================================================
  // 5. LETTERS POPPING ANIMATION
  // ==========================================================================
  function animateLetters(headingElement) {
    if (!headingElement) return;
    if (headingElement.querySelector('.char-span')) return;
    
    const textContent = headingElement.textContent;
    headingElement.innerHTML = '';
    
    const words = textContent.split(' ');
    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      wordSpan.style.marginRight = '8px';
      
      const chars = word.split('');
      chars.forEach((char, charIdx) => {
        const charSpan = document.createElement('span');
        charSpan.classList.add('char-span');
        charSpan.textContent = char;
        charSpan.style.animationDelay = `${(wordIdx * 4 + charIdx) * 0.03}s`;
        wordSpan.appendChild(charSpan);
      });
      headingElement.appendChild(wordSpan);
    });
  }

  function triggerViewLoadAnimations(viewId) {
    const activeView = document.getElementById(viewId);
    if (!activeView) return;

    const mainTitle = activeView.querySelector('.section-title, .subpage-banner h1');
    if (mainTitle) {
      animateLetters(mainTitle);
    }
    
    // Check scroll trigger elements visibility immediately
    setTimeout(checkScrollTriggerElements, 50);
  }


  // ==========================================================================
  // 6. SPECIALIZED CAPABILITIES MODAL DATA SYSTEM
  // ==========================================================================
  const capabilityDatabase = {
    'pre-construction': {
      num: '01',
      title: 'Pre-Construction & Development',
      desc: 'Expert groundwork coordination before structural assembly starts, safeguarding land rights and financial projections.',
      points: [
        'Land Acquisition & Zoning: Identifying raw land, securing clean titles, and handling local zoning and landuse changes.',
        'Feasibility & Planning: Comprehensive market research, structural budgeting, risk analysis, and raw site surveys.',
        'Permitting & Approvals: Securing all building permits, NOCs, municipal documents, and environmental clearances.'
      ]
    },
    'architecture': {
      num: '02',
      title: 'Architecture & Design',
      desc: 'Formulating visually stunning blueprints and resilient layouts customized to spatial allocations.',
      points: [
        'Layout & Structural Planning: Creating architectural layouts, detailed 3D visualizations, elevation files, and seismic/geotechnical designs.',
        'Interior Design: Designing custom layouts, premium modular kitchens, false ceilings, and wood cabinetry setups.'
      ]
    },
    'civil-works': {
      num: '03',
      title: 'Site Preparation & Civil Works',
      desc: 'Heavy machinery clearing, layout configurations, concrete foundation, and superstructures construction.',
      points: [
        'Site Clearing: Land grading, mobilization, leveling, and clearing obstructions.',
        'Foundation & Superstructure: Excavating trenches, laying structural columns, concrete foundations, and building the core load-bearing columns framework.'
      ]
    },
    'mep': {
      num: '04',
      title: 'MEP (Mechanical, Electrical, Plumbing)',
      desc: 'Installing essential service networks and utilities utilizing superior quality fittings.',
      points: [
        'Utility Installation: Robust water supply lines, drainage pipes, and waste management systems.',
        'Electrical Works: Secure wiring grids, fixture installations, and backup generator setups.',
        'HVAC Works: Centralized air conditioning and ventilation grids.'
      ]
    },
    'finishing': {
      num: '05',
      title: 'Finishing & Landscaping',
      desc: 'Aesthetic additions and final polishes that elevate commercial structures and villa spaces.',
      points: [
        'Exterior Façade: Stone cladding, plastering, painting, and texture finishes.',
        'Interior Finishing: Premium flooring (marble, vitrified tiles), painting, and structural glasswork.',
        'Landscaping: Garden layout design, outdoor pathway lighting, and walkway construction.'
      ]
    },
    'project-management': {
      num: '06',
      title: 'Project Management',
      desc: 'Diligent timeline tracking and material quality supervisions during all building cycles.',
      points: [
        'Quality Control: Regular site supervision, raw material concrete testing, and construction standard checks.',
        'Safety Management: Enforcing absolute compliance with building and safety codes.'
      ]
    },
    'post-construction': {
      num: '07',
      title: 'Post-Construction Services',
      desc: 'Handover protocols and administrative clearances, ensuring a complete peace-of-mind package.',
      points: [
        'Handover & Snag Rectification: Final inspections, deep cleaning, and defect repairs.',
        'Documentation: Handing over warranties, structural floor plans, NOCs, and occupancy certificates.'
      ]
    }
  };

  const capModal = document.getElementById('capability-modal');
  const capClose = document.getElementById('cap-close');
  const capTitle = document.getElementById('cap-modal-title');
  const capNum = document.getElementById('cap-modal-num');
  const capDesc = document.getElementById('cap-modal-desc');
  const capPointsList = document.getElementById('cap-points-list');
  const capModalCtaBtn = document.getElementById('cap-modal-cta-btn');

  function openCapabilityModal(capId) {
    const data = capabilityDatabase[capId];
    if (!data || !capModal) return;

    capTitle.textContent = data.title;
    capNum.textContent = data.num;
    capDesc.textContent = data.desc;
    
    // Clear list
    capPointsList.innerHTML = '';
    data.points.forEach(pointText => {
      const li = document.createElement('li');
      li.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${pointText}</span>`;
      capPointsList.appendChild(li);
    });

    capModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (capModal && capClose) {
    // Click cards to trigger
    document.body.addEventListener('click', (e) => {
      const card = e.target.closest('.capability-card');
      if (card) {
        const capId = card.getAttribute('data-capability');
        if (capId) openCapabilityModal(capId);
      }
    });

    capClose.addEventListener('click', () => {
      capModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    capModal.addEventListener('click', (e) => {
      if (e.target === capModal) {
        capModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    capModalCtaBtn.addEventListener('click', () => {
      capModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }


  // ==========================================================================
  // 7. PORTFOLIO & RECENT WORK PROJECTS MODALS
  // ==========================================================================
  const projectDatabase = {
    'luxury-villa': {
      title: 'Luxury Villa Project',
      meta: 'Jubilee Hills, Hyderabad | Completed',
      client: 'Arun & Family Co.',
      category: 'Residential Construction',
      size: '12,500 Sq Ft',
      desc: 'An architectural masterpiece combining state-of-the-art concrete structures, automated smart glass layouts, and an eco-sustainable infinity pool design. This premium luxury villa incorporates curated green garden space and custom solar systems, crafted exactly to details matching premium residential parameters.',
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
      ]
    },
    'premium-apartment': {
      title: 'Premium Apartment Complex',
      meta: 'Somajiguda, Hyderabad | In Progress',
      client: 'Jeshurun Properties Group',
      category: 'Property Development',
      size: '185,000 Sq Ft',
      desc: 'A futuristic residential high-rise complex containing 45 luxurious apartments, double-height lobby lounges, and basement parkings. Constructed with high-strength structural slabs, premium interior finish work, and strict compliance to safety standards.',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80'
      ]
    },
    'commercial-complex': {
      title: 'Commercial Complex / HQ',
      meta: 'Ameerpet, Hyderabad | Upcoming',
      client: 'Techspace Solutions Pvt. Ltd.',
      category: 'Commercial Construction',
      size: '95,000 Sq Ft',
      desc: 'Designed as a tech-enabled corporate headquarters featuring a double glass curtain facade, centralized heating ventilation systems, and open layouts. This energy-efficient building is scheduled for structural concrete works starting next quarter.',
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
      ]
    },
    'modern-residence': {
      title: 'Modern Residence Block',
      meta: 'Gachibowli, Hyderabad | Completed',
      client: 'V. K. Rao Ltd.',
      category: 'Residential Construction',
      size: '6,200 Sq Ft',
      desc: 'A premium triplex house completed within 14 months. Features raw stone exterior panels, customized wood ceilings, thermal panels, and complete smart house automation.',
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      ]
    },
    'corporate-hq': {
      title: 'Corporate Headquarters Lobby',
      meta: 'HITEC City, Hyderabad | Completed',
      client: 'NexGen FinTech',
      category: 'Commercial Construction',
      size: '22,000 Sq Ft',
      desc: 'Complete interior design and fit-out architectural works. Handled wall panels, HVAC grids, acoustic ceilings, and structural partition layouts.',
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
      ]
    },
    'luxury-penthouses': {
      title: 'Luxury Penthouses Block',
      meta: 'Begumpet, Hyderabad | In Progress',
      client: 'Grand View Ventures',
      category: 'Residential Construction',
      size: '30,000 Sq Ft',
      desc: 'Top three floor structural engineering custom designs. Includes luxury skydecks, structural roof glazing, private gardens, and heavy loading slab designs.',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
      ]
    }
  };

  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');
  const slidesTrack = document.getElementById('lightbox-slides-track');
  const prevLBtn = document.getElementById('lightbox-prev-btn');
  const nextLBtn = document.getElementById('lightbox-next-btn');

  const titlePane = document.getElementById('lightbox-project-title');
  const metaPane = document.getElementById('lightbox-project-meta');
  const descPane = document.getElementById('lightbox-project-desc');
  const clientPane = document.getElementById('lbl-client');
  const categoryPane = document.getElementById('lbl-category');
  const sizePane = document.getElementById('lbl-size');
  const modalCTABtn = document.getElementById('lightbox-cta-btn');

  let activeModalImgIndex = 0;
  let modalImagesList = [];

  function openProjectLightbox(projectId) {
    const data = projectDatabase[projectId];
    if (!data || !lightboxModal) return;

    slidesTrack.innerHTML = '';
    activeModalImgIndex = 0;
    modalImagesList = data.images;

    data.images.forEach(imgUrl => {
      const slide = document.createElement('div');
      slide.style.minWidth = '100%';
      slide.style.height = '100%';
      
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = data.title;
      img.classList.add('lightbox-slide-img');
      
      slide.appendChild(img);
      slidesTrack.appendChild(slide);
    });

    titlePane.textContent = data.title;
    metaPane.textContent = data.meta;
    descPane.textContent = data.desc;
    clientPane.textContent = data.client;
    categoryPane.textContent = data.category;
    sizePane.textContent = data.size;

    updateModalSlider();
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateModalSlider() {
    if (slidesTrack) {
      slidesTrack.style.transform = `translateX(-${activeModalImgIndex * 100}%)`;
    }
  }

  if (lightboxModal && lightboxClose) {
    document.body.addEventListener('click', (e) => {
      const projectCard = e.target.closest('.project-card');
      if (projectCard) {
        const prjId = projectCard.getAttribute('data-project');
        if (prjId) openProjectLightbox(prjId);
      }
    });

    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    nextLBtn.addEventListener('click', () => {
      if (modalImagesList.length > 0) {
        activeModalImgIndex = (activeModalImgIndex + 1) % modalImagesList.length;
        updateModalSlider();
      }
    });

    prevLBtn.addEventListener('click', () => {
      if (modalImagesList.length > 0) {
        activeModalImgIndex = (activeModalImgIndex - 1 + modalImagesList.length) % modalImagesList.length;
        updateModalSlider();
      }
    });

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    modalCTABtn.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }


  // ==========================================================================
  // 8. DEDICATED GALLERY SUBPAGE REDIRECTS (PHASE 3)
  // ==========================================================================
  function setupGalleryRedirectFilters() {
    const filterButtons = document.querySelectorAll('.gallery-filters-row .filter-btn');
    
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filterVal = e.target.getAttribute('data-filter');
        
        // Skip projects view filters
        const parentFilterRow = e.target.closest('.gallery-filters-row');
        if (parentFilterRow && parentFilterRow.id === 'projects-view-filters') {
          return; // projects filter handles standard css filter block
        }

        if (filterVal && filterVal.startsWith('gallery-')) {
          e.preventDefault();
          history.pushState(null, null, `#${filterVal}`);
          router(`#${filterVal}`);
        } else if (filterVal === 'all') {
          e.preventDefault();
          history.pushState(null, null, '#gallery');
          router('#gallery');
        }
      });
    });
  }

  setupGalleryRedirectFilters();

  // Helper projects page normal CSS filter handler
  function setupProjectsFilterSystem() {
    const filterRow = document.getElementById('projects-view-filters');
    if (!filterRow) return;

    const filterButtons = filterRow.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filterValue = e.target.getAttribute('data-filter');
        const items = document.querySelectorAll('.projects-grid .project-card');

        items.forEach(item => {
          const itemCategory = item.getAttribute('data-category');
          if (filterValue === 'all' || itemCategory === filterValue) {
            item.style.display = 'block';
            item.style.animation = 'viewFadeIn 0.3s ease forwards';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  setupProjectsFilterSystem();


  // ==========================================================================
  // 9. WHATSAPP ENQUIRY ROUTING (+91 93921 68888)
  // ==========================================================================
  const contactForms = document.querySelectorAll('.contact-enquiry-form');

  contactForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('.text-input-name').value.trim();
      const phone = form.querySelector('.text-input-phone').value.trim();
      const email = form.querySelector('.text-input-email').value.trim();
      const projectType = form.querySelector('.select-project-type').value;
      const message = form.querySelector('.text-textarea-msg').value.trim();
      
      const subjectInput = form.querySelector('.text-input-subject');
      const subject = subjectInput ? subjectInput.value.trim() : 'Project Inquiry';

      if (!name || !phone || !email || !projectType || !message) {
        alert('Please fill out all required fields.');
        return;
      }

      const formattedMessage = `Hello Jeshurun Builder's, I want to submit an enquiry:
----------------------------------------
👤 *Name*: ${name}
📞 *Phone*: ${phone}
📧 *Email*: ${email}
🏗️ *Service Required*: ${projectType}
📌 *Subject*: ${subject}
💬 *Message*: ${message}`;

      const encodedText = encodeURIComponent(formattedMessage);
      const whatsappURL = `https://wa.me/919392168888?text=${encodedText}`;

      window.open(whatsappURL, '_blank');
      form.reset();
    });
  });


  // ==========================================================================
  // 10. GOOGLE MAPS RED MARK ROUTING (https://maps.app.goo.gl/3NbPbWttGBSjQ692A)
  // ==========================================================================
  const mapTriggers = document.querySelectorAll('#home-map-trigger, #subpage-map-trigger');
  mapTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // Allow user to click iframe controls naturally. If they click surrounding parent layout, redirect.
      if (e.target.tagName !== 'IFRAME') {
        window.open('https://maps.app.goo.gl/3NbPbWttGBSjQ692A', '_blank');
      }
    });
  });


  // ==========================================================================
  // 11. SCROLL TO TOP & WIDGET ACTIONS
  // ==========================================================================
  const scrollTopBtn = document.getElementById('scroll-to-top-btn');

  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  // ==========================================================================
  // 12. SCROLL TRIGGER OBSERVERS
  // ==========================================================================
  const scrollElements = document.querySelectorAll('.scroll-trigger');

  function checkScrollTriggerElements() {
    scrollElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top <= windowHeight * 0.85) {
        el.classList.add('appear');
      }
    });
  }

  window.addEventListener('scroll', checkScrollTriggerElements);
  checkScrollTriggerElements();


  // ==========================================================================
  // 13. TESTIMONIAL SLIDER CAROUSEL
  // ==========================================================================
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const prevTestiBtn = document.querySelector('.prev-testi-btn');
  const nextTestiBtn = document.querySelector('.next-testi-btn');
  let currentTestiIdx = 0;

  function showTestimonial(idx) {
    if (testimonialSlides.length === 0) return;
    testimonialSlides.forEach(slide => slide.classList.remove('active'));
    currentTestiIdx = (idx + testimonialSlides.length) % testimonialSlides.length;
    testimonialSlides[currentTestiIdx].classList.add('active');
  }

  if (testimonialSlides.length > 0) {
    if (nextTestiBtn) nextTestiBtn.addEventListener('click', () => showTestimonial(currentTestiIdx + 1));
    if (prevTestiBtn) prevTestiBtn.addEventListener('click', () => showTestimonial(currentTestiIdx - 1));
    setInterval(() => showTestimonial(currentTestiIdx + 1), 8000);
  }

  // Handle clicking items inside gallery grids to open lightbox categories
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const cat = item.getAttribute('data-category');
      const projectMap = {
        'gallery-residential': 'luxury-villa',
        'gallery-commercial': 'commercial-complex',
        'gallery-interior': 'corporate-hq',
        'gallery-progress': 'luxury-penthouses',
        'gallery-completed': 'modern-residence'
      };
      const prjId = projectMap[cat] || 'luxury-villa';
      openProjectLightbox(prjId);
    });
  });

});
