/**
 * JESHURUN BUILDER'S & DEVELOPER'S - CLIENT SIDE APP LOGIC
 * Includes SPA View Router with Sweep Curtain Transition, Counter Up Animation, 
 * Text Animations, Interactive Capabilities Modal, WhatsApp contact redirect.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. SINGLE PAGE ROUTER WITH CURTAIN SWEEP TRANSITION
  // ==========================================================================
  // Initialize Supabase Client
  const { createClient } = window.supabase;
  const supabase = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);

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
      'brochure': 'brochure-view',
      'gallery': 'gallery-view',
      'contact': 'contact-view',
      'gallery-residential': 'gallery-residential-view',
      'gallery-commercial': 'gallery-commercial-view',
      'gallery-interior': 'gallery-interior-view',
      'gallery-progress': 'gallery-progress-view',
      'gallery-completed': 'gallery-completed-view',
      'admin': 'admin-view'
    };

    const activeViewId = routeMap[route] || 'home-view';
    const activeViewEl = document.getElementById(activeViewId);
    
    if (!activeViewEl) return;

    // Check permissions for gated routes
    if (route === 'brochure') {
      const isLoggedIn = localStorage.getItem('jeshurun_user');
      const authContainer = document.getElementById('brochure-auth-container');
      const brochureContainer = document.getElementById('brochure-container');
      if (isLoggedIn) {
        if (authContainer) authContainer.style.display = 'none';
        if (brochureContainer) brochureContainer.style.display = 'block';
      } else {
        if (authContainer) authContainer.style.display = 'flex';
        if (brochureContainer) brochureContainer.style.display = 'none';
      }
    } else if (route === 'admin') {
      const isAdmin = localStorage.getItem('jeshurun_admin');
      const adminAuth = document.getElementById('admin-auth-container');
      const adminDashboard = document.getElementById('admin-dashboard-container');
      if (isAdmin) {
        if (adminAuth) adminAuth.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'block';
        loadAdminDashboardData();
      } else {
        if (adminAuth) adminAuth.style.display = 'flex';
        if (adminDashboard) adminDashboard.style.display = 'none';
      }
    }

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
          'home': 1, 'about': 1, 'projects': 1, 'services': 1, 'brochure': 1, 'gallery': 1, 'contact': 1,
          'gallery-residential': 1, 'gallery-commercial': 1, 'gallery-interior': 1,
          'gallery-progress': 1, 'gallery-completed': 1, 'admin': 1
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
        window.open('https://maps.app.goo.gl/dpBjjL83bfsHhqVQ6', '_blank');
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

  // ==========================================================================
  // 14. BROCHURE SLIDER LOGIC
  // ==========================================================================
  let currentBrochureSlide = 0;
  const brochureSlides = document.querySelectorAll('.brochure-slide');
  const brochureDots = document.querySelectorAll('.brochure-dot');
  const prevBrochureBtn = document.querySelector('.brochure-prev');
  const nextBrochureBtn = document.querySelector('.brochure-next');

  function showBrochureSlide(idx) {
    if (brochureSlides.length === 0) return;

    brochureSlides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (brochureDots[i]) brochureDots[i].classList.remove('active');
    });

    currentBrochureSlide = (idx + brochureSlides.length) % brochureSlides.length;
    brochureSlides[currentBrochureSlide].classList.add('active');
    if (brochureDots[currentBrochureSlide]) brochureDots[currentBrochureSlide].classList.add('active');

    const activeSlide = brochureSlides[currentBrochureSlide];
    activeSlide.scrollTop = 0;
  }

  if (brochureSlides.length > 0) {
    if (nextBrochureBtn) {
      nextBrochureBtn.addEventListener('click', () => {
        showBrochureSlide(currentBrochureSlide + 1);
      });
    }
    if (prevBrochureBtn) {
      prevBrochureBtn.addEventListener('click', () => {
        showBrochureSlide(currentBrochureSlide - 1);
      });
    }
    brochureDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showBrochureSlide(i);
      });
    });

    document.addEventListener('keydown', (e) => {
      const brochureView = document.getElementById('brochure-view');
      if (brochureView && brochureView.classList.contains('active')) {
        if (e.key === 'ArrowRight') {
          showBrochureSlide(currentBrochureSlide + 1);
        } else if (e.key === 'ArrowLeft') {
          showBrochureSlide(currentBrochureSlide - 1);
        }
      }
    });

    showBrochureSlide(0);
  }


  // ==========================================================================
  // 15. SUPABASE DATA LAYER & SEEDER
  // ==========================================================================

  const DEFAULT_GALLERY = [
    { category: 'gallery-residential', img_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80', alt: 'Luxury Villa Exterior' },
    { category: 'gallery-commercial', img_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80', alt: 'Glass Facade Corporate Headquarters' },
    { category: 'gallery-interior', img_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80', alt: 'Modern Living Room Interior' },
    { category: 'gallery-progress', img_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80', alt: 'Foundation Concrete Pouring' },
    { category: 'gallery-completed', img_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', alt: 'Completed Residential Block' },
    { category: 'gallery-residential', img_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80', alt: 'High-end Contemporary Villa' }
  ];

  const DEFAULT_TEAM = [
    { name: 'G. PRASAD', role: 'MD / Founder', img_url: 'image copy 25.png', display_order: 1 },
    { name: 'Sunil kumar pournal', role: 'Director', img_url: 'image copy 41.png', display_order: 2 },
    { name: 'Sudhaker kedem', role: 'Manager', img_url: 'image copy 42.png', display_order: 3 },
    { name: 'N. RAJU', role: 'Architect', img_url: 'image copy 44.png', display_order: 4 },
    { name: 'Hameed uddin khan', role: 'Engineer', img_url: 'image copy 43.png', display_order: 5 },
    { name: 'Sai Ganesh', role: 'Supervisor', img_url: 'image copy 45.png', display_order: 6 }
  ];

  const DEFAULT_BROCHURE_SLIDES = [
    { title: 'Cover', type: 'image', img_url: 'image copy 22.png', specs: null, display_order: 1 },
    { title: 'Intro', type: 'image', img_url: 'image copy 23.png', specs: null, display_order: 2 },
    { title: 'Management Team Page 1', type: 'image', img_url: 'image copy 70.png', specs: null, display_order: 3 },
    { title: 'Management Team Page 2', type: 'image', img_url: 'image copy 71.png', specs: null, display_order: 4 },
    { title: 'JDA Introduction', type: 'specs', img_url: null, specs: [
      { title: 'Agreement Concept', items: ['A Joint Development Agreement (JDA) divides land value and construction costs to give both parties equal returns.', 'The catalogue details area sharing (splitting the built-up flats/villas), baseline specifications, and developer timeline in exchange for land.'] },
      { title: 'The Division of Space', items: ['Residential Apartments: Developer designs multi-story/gated community. Flats are divided equally (e.g. builder takes floors 1 & 2, owner takes 3 & 4) with Undivided Share of Land (UDS).', 'Parking & Common Amenities: Basement/stilt parking slots distributed equally.', 'Terrace Rights: Split equally.'] },
      { title: 'Initial Soil & Site Preparation', items: ['Earth excavation.', 'Soil investigation & testing by an NABL-certified lab.', 'Site survey before marking: levels studied, reference coordinates and grids marked.', 'Pillar and column marking based on soil conditions and foundation plan.'] }
    ], display_order: 5 },
    { title: 'Core Specifications & Civil Works', type: 'specs', img_url: null, specs: [
      { title: 'RCC Structure', items: ['RCC (Reinforced cement concrete) design integrates steel reinforcement for footings, beams, columns, and slabs as per design.', 'RCC staircase with 6" thickness soffit slab.', 'JSW steel rods used as per structural design.', 'Ultra tech 53 grade cement for slabs, columns, beams; Birla 43 grade for brickwork/plastering.', `Ceiling height 10'5" (slab to slab top).`, `Plinth beam max 2' height from natural ground level.`, 'Sunken slabs for toilets.'] },
      { title: 'Super Structure & Plastering', items: ['Red mud bricks in cement mortar for wall support (external walls 9", internal walls 4.5" with concrete bed).', 'Install chicken mesh (200-300mm wide) over joints before plastering.', 'Double-coat external plastering 18mm thick; internal plastering 12mm thick.'] }
    ], display_order: 6 },
    { title: 'Doors, Windows & Flooring', type: 'specs', img_url: null, specs: [
      { title: 'Doors & Frames', items: ['Main door frame BT teak section (5"x7") with teak veneer shutter (36mm or 42mm).', 'Godrej locks, hinges 5" long, 12" brass doorset.', `Main door size 5' width, 7' height.`, 'Internal door frames MT section (4"x3") with laminate-finished flush shutters (32mm).', 'WPC frames and doors (30mm) for washrooms.', `Bedroom doors 3' width, 6'5" height. Washroom doors 3' width, 6'5" height.`] },
      { title: 'Windows & Flooring', items: ['Windows UPVC Vaka, Domal or equivalent with sliding 3-track design and SS mosquito mesh.', 'Ventilators UPVC frame with glass louvres (16"x20") fixed at beam bottom.', 'All internal flooring vitrified tiles (Kajaria/Johnson). Staircase with lapatra black/brown granite. Parking with rough granite.'] }
    ], display_order: 7 },
    { title: 'Kitchen, Toilet & Plumbing Lines', type: 'specs', img_url: null, specs: [
      { title: 'Kitchen & Toilet Setup', items: ['Elephant black granite platform with sink & tap.', 'Ceramic tile cladding up to 2 feet height over kitchen platform.', 'Ashirvad CPVC water supply pipes; Sudhakar PVC drainage pipes.', `Toilet flooring with anti-skid ceramic tiles (1'x1').`, `Wall ceramic tiles up to lintel level (1'x2').`, 'Dr. Fixit/Fosroc waterproofing in washrooms, utility and terrace.'] },
      { title: 'Drainage & Sanitaryware', items: ['Sanitaryware: Hindware, Parryware or Cera.', 'EWC wall mounted with PVC cistern. Health faucet, wash basin with countertop.', 'Bib cock with nozzle for washing machine. Angle cocks for geyser, kitchen, etc.'] }
    ], display_order: 8 },
    { title: 'Finishes, Electrical & Services', type: 'specs', img_url: null, specs: [
      { title: 'Railing, Painting & Polish', items: ['Glass railing 10mm to 12mm toughened glass with SS 304 supports.', 'MS sliding gate with panel locks. MS safety grills for windows.', 'Interior: 2 coats putty, 1 coat primer, 2 coats Premium Emulsion.', 'Exterior: Weather-proof exterior paints.', 'Water supply: Borewell and municipal water sump tank (10000L).'] },
      { title: 'Electrical & Lift Operations', items: ['Concealed conduit copper wiring (PolyCab/Finolex, Sudhakar pipes).', 'Modular switches (GM, Legrand or Anchor Roma). DB with MCB of Legrand.', 'AC points in bedrooms & hall; geyser points in toilets.', 'Lift planning and installation solutions compliant with industry standards.'] }
    ], display_order: 9 },
    { title: 'Closing', type: 'image', img_url: 'image copy 26.png', specs: null, display_order: 10 }
  ];

  async function seedDatabaseIfEmpty() {
    try {
      // Seed gallery
      const { data: galData } = await supabase.from('gallery').select('id').limit(1);
      if (!galData || galData.length === 0) {
        await supabase.from('gallery').insert(DEFAULT_GALLERY);
      }

      // Seed team
      const { data: teamData } = await supabase.from('team').select('id').limit(1);
      if (!teamData || teamData.length === 0) {
        await supabase.from('team').insert(DEFAULT_TEAM);
      }

      // Seed brochure slides
      const { data: slideData } = await supabase.from('brochure_slides').select('id').limit(1);
      if (!slideData || slideData.length === 0) {
        await supabase.from('brochure_slides').insert(DEFAULT_BROCHURE_SLIDES);
      }
    } catch (e) {
      console.warn("Seeding database failed or skipped:", e);
    }
  }

  async function renderDynamicContent() {
    try {
      // 1. Fetch & Render Team Members
      let teamMembers = null;
      try {
        const { data } = await supabase.from('team').select('*').order('display_order', { ascending: true });
        teamMembers = data;
      } catch (err) {
        console.warn("Failed to fetch team from Supabase, using defaults:", err);
      }
      if (!teamMembers || teamMembers.length === 0) {
        teamMembers = DEFAULT_TEAM;
      }

      // Render main team section
      const mainTeamGrid = document.querySelector('#about-view .team-grid');
      if (mainTeamGrid) {
        mainTeamGrid.innerHTML = teamMembers.map(member => `
          <div class="team-card">
            <div class="team-img-h">
              <img src="${member.img_url}" alt="${member.name}">
            </div>
            <div class="team-body">
              <h4>${member.name}</h4>
              <p>${member.role}</p>
            </div>
          </div>
        `).join('');
      }

      // Render brochure slide #3 (Management Team slide)
      const brochureTeamGrid = document.querySelector('.brochure-team-grid');
      if (brochureTeamGrid) {
        brochureTeamGrid.innerHTML = teamMembers.map(member => `
          <div class="brochure-team-card">
            <div class="brochure-team-img-wrapper">
              <img src="${member.img_url}" alt="${member.name}">
            </div>
            <div class="brochure-team-body">
              <p><strong>${member.role.toUpperCase()}</strong></p>
              <h4>${member.name}</h4>
            </div>
          </div>
        `).join('');
      }

      // 2. Fetch & Render Gallery
      let galleryItems = null;
      try {
        const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        galleryItems = data;
      } catch (err) {
        console.warn("Failed to fetch gallery from Supabase, using defaults:", err);
      }
      if (!galleryItems || galleryItems.length === 0) {
        galleryItems = DEFAULT_GALLERY;
      }

      const getCategoryLabel = (cat) => {
        const labels = {
          'gallery-residential': 'Residential',
          'gallery-commercial': 'Commercial',
          'gallery-interior': 'Interior',
          'gallery-progress': 'Construction Progress',
          'gallery-completed': 'Completed'
        };
        return labels[cat] || 'Project';
      };

      const renderGrid = (gridEl, items) => {
        if (!gridEl) return;
        gridEl.innerHTML = items.map(item => `
          <div class="gallery-item" data-category="${item.category}">
            <img src="${item.img_url}" alt="${item.alt}">
            <div class="gallery-item-hover"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
          </div>
        `).join('');
      };

      // Render home page projects preview
      const homeGrid = document.querySelector('#home-view .gallery-grid');
      if (homeGrid) renderGrid(homeGrid, galleryItems.slice(0, 6));

      // Render main gallery view grid
      const mainGrid = document.getElementById('gallery-view-grid');
      if (mainGrid) renderGrid(mainGrid, galleryItems);

      // Render categories specific pages
      const categories = ['gallery-residential', 'gallery-commercial', 'gallery-interior', 'gallery-progress', 'gallery-completed'];
      const viewGrids = document.querySelectorAll('.view-section .gallery-grid');
      viewGrids.forEach(grid => {
        if (grid.id === 'gallery-view-grid') return;
        // Check parent section route
        const parentSection = grid.closest('.view-section');
        if (parentSection) {
          const secId = parentSection.id; // e.g. gallery-residential-view
          const cat = secId.replace('-view', ''); // e.g. gallery-residential
          if (categories.includes(cat)) {
            const filtered = galleryItems.filter(item => item.category === cat);
            renderGrid(grid, filtered);
          }
        }
      });

      // 3. Fetch & Render Brochure Slides
      let slides = null;
      try {
        const { data } = await supabase.from('brochure_slides').select('*').order('display_order', { ascending: true });
        slides = data;
      } catch (err) {
        console.warn("Failed to fetch brochure slides from Supabase, using defaults:", err);
      }
      if (!slides || slides.length === 0) {
        slides = DEFAULT_BROCHURE_SLIDES;
      }

      const sliderWrapper = document.querySelector('.brochure-slider-wrapper');
      const dotsContainer = document.querySelector('.brochure-dots-container');
      
      if (sliderWrapper && dotsContainer) {
        sliderWrapper.innerHTML = '';
        dotsContainer.innerHTML = '';

        slides.forEach((slide, idx) => {
          let slideHtml = '';
          const isActive = idx === 0 ? 'active' : '';

          if (slide.type === 'image') {
            slideHtml = `
              <div class="brochure-slide ${isActive}">
                <img src="${slide.img_url}" alt="${slide.title}" class="brochure-img-fit animated-fit-in">
              </div>
            `;
          } else if (slide.title === 'Management Team') {
            slideHtml = `
              <div class="brochure-slide brochure-team-slide ${isActive}">
                <h2 class="brochure-team-title">${slide.title}</h2>
                <div class="brochure-team-grid">
                  <!-- Rendered dynamically above -->
                </div>
              </div>
            `;
          } else {
            // Parse specifications
            let specsData = [];
            try {
              specsData = typeof slide.specs === 'string' ? JSON.parse(slide.specs) : slide.specs;
            } catch (e) {
              specsData = slide.specs || [];
            }

            const specCols = specsData.map(col => `
              <div class="brochure-spec-box">
                <h3>${col.title}</h3>
                <ul class="brochure-spec-list">
                  ${col.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            `).join('');

            slideHtml = `
              <div class="brochure-slide brochure-spec-slide ${isActive}">
                <div class="brochure-spec-header">
                  <h2>${slide.title}</h2>
                  <p>Specifications Overview</p>
                </div>
                <div class="brochure-spec-grid">
                  ${specCols}
                </div>
              </div>
            `;
          }

          sliderWrapper.insertAdjacentHTML('beforeend', slideHtml);
          dotsContainer.insertAdjacentHTML('beforeend', `
            <span class="brochure-dot ${isActive}" data-index="${idx}"></span>
          `);
        });

        // Re-bind click event handlers for the newly rendered slides
        rebindBrochureSliderEvents();
      }
    } catch (e) {
      console.error("Error rendering dynamic website data:", e);
    }
  }

  function rebindBrochureSliderEvents() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.brochure-slide');
    const dots = document.querySelectorAll('.brochure-dot');
    const prevBtn = document.querySelector('.brochure-prev');
    const nextBtn = document.querySelector('.brochure-next');

    function showSlide(idx) {
      if (slides.length === 0) return;
      slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (dots[i]) dots[i].classList.remove('active');
      });
      currentSlide = (idx + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    if (slides.length > 0) {
      if (nextBtn) {
        nextBtn.onclick = () => showSlide(currentSlide + 1);
      }
      if (prevBtn) {
        prevBtn.onclick = () => showSlide(currentSlide - 1);
      }
      dots.forEach((dot, i) => {
        dot.onclick = () => showSlide(i);
      });
      showSlide(0);
    }
  }

  // Handle clicking gallery items for lightbox (Delegation)
  document.body.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (item) {
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
    }
  });


  // ==========================================================================
  // 16. BROCHURE VISITOR SIGNUP / LEAD CAPTURE
  // ==========================================================================

  const brochureAuthForm = document.getElementById('brochure-auth-form');
  if (brochureAuthForm) {
    brochureAuthForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = brochureAuthForm.querySelector('button[type="submit"]');
      const name = document.getElementById('lead-name').value.trim();
      const email = document.getElementById('lead-email').value.trim();
      const phone = document.getElementById('lead-phone').value.trim();

      btn.disabled = true;
      btn.innerHTML = 'PROCESSING... <i class="fa-solid fa-spinner fa-spin"></i>';

      try {
        // Save lead in Supabase (non-blocking fallback)
        try {
          const { error } = await supabase
            .from('leads')
            .insert([{ name, email, phone }]);
          if (error) console.warn("Supabase lead insert warning:", error);
        } catch (dbErr) {
          console.warn("Supabase lead insert failed, skipped:", dbErr);
        }

        // Save session locally
        localStorage.setItem('jeshurun_user', JSON.stringify({ name, email, phone }));

        // Send WhatsApp prefilled lead text in a new tab (gracefully handle popup blockers)
        try {
          const msg = `Hello Jeshurun Builders, I have registered to download your brochure. Name: ${name}, Email: ${email}, Phone: ${phone}`;
          const waUrl = `https://wa.me/919392168888?text=${encodeURIComponent(msg)}`;
          const win = window.open(waUrl, '_blank');
          if (!win) {
            console.warn("WhatsApp popup was blocked by the browser.");
          }
        } catch (popupErr) {
          console.warn("Failed to open WhatsApp tab:", popupErr);
        }

        // Unlock brochure panel
        const authContainer = document.getElementById('brochure-auth-container');
        const brochureContainer = document.getElementById('brochure-container');
        if (authContainer) authContainer.style.display = 'none';
        if (brochureContainer) {
          brochureContainer.style.display = 'block';
          rebindBrochureSliderEvents();
        }
      } catch (err) {
        console.error("Lead saving failed:", err);
        alert("An error occurred during registration. Please try again.");
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'ACCESS BROCHURE <i class="fa-solid fa-unlock-keyhole"></i>';
      }
    });
  }


  // ==========================================================================
  // 17. ADMIN DASHBOARD OPERATIONS (CRUD & UPLOADS)
  // ==========================================================================

  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLogoutBtn = document.getElementById('btn-admin-logout');

  // Handle Admin Authentication
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const pass = document.getElementById('admin-password').value.trim();
      const errorMsg = document.getElementById('admin-auth-error');

      if (email === 'admin@jeshurun.com' && pass === 'Admin@123') {
        localStorage.setItem('jeshurun_admin', 'true');
        errorMsg.style.display = 'none';
        document.getElementById('admin-auth-container').style.display = 'none';
        document.getElementById('admin-dashboard-container').style.display = 'block';
        loadAdminDashboardData();
      } else {
        errorMsg.style.display = 'block';
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('jeshurun_admin');
      document.getElementById('admin-dashboard-container').style.display = 'none';
      document.getElementById('admin-auth-container').style.display = 'flex';
      window.location.hash = '#home';
    });
  }

  // Tab Switch logic in Admin View
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabPanels = document.querySelectorAll('.admin-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(btn.getAttribute('data-tab'));
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  async function loadAdminDashboardData() {
    loadLeads();
    loadGalleryItems();
    loadTeamMembers();
    loadBrochureSlides();
  }

  // --- LEADS SECTION ---
  async function loadLeads() {
    const tbody = document.getElementById('leads-table-body');
    if (!tbody) return;

    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-red">Failed to load leads.</td></tr>`;
      return;
    }

    if (!leads || leads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No leads found.</td></tr>`;
      return;
    }

    tbody.innerHTML = leads.map(lead => {
      const date = new Date(lead.created_at).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      return `
        <tr>
          <td>${date}</td>
          <td><strong>${lead.name}</strong></td>
          <td>${lead.email}</td>
          <td>${lead.phone}</td>
          <td>
            <a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(lead.name)},%20thanks%20for%20registering%20with%20Jeshurun%20Builders." 
               target="_blank" class="btn-icon btn-chat-wa">
               <i class="fa-brands fa-whatsapp"></i> Chat
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- GALLERY MANAGEMENT ---
  async function loadGalleryItems() {
    const tbody = document.getElementById('gallery-table-body');
    if (!tbody) return;

    const { data: items, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (error) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-red">Failed to load gallery.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td><img src="${item.img_url}" width="60" height="40" style="object-fit: cover; border-radius: 4px;"></td>
        <td><span class="gallery-tag">${item.category}</span></td>
        <td>${item.alt}</td>
        <td>
          <button class="btn-icon btn-edit" onclick="editGalleryItem(${item.id}, '${item.category}', '${encodeURIComponent(item.alt)}', '${item.img_url}')"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="btn-icon btn-delete" onclick="deleteGalleryItem(${item.id})"><i class="fa-solid fa-trash"></i> Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // --- TEAM MANAGEMENT ---
  async function loadTeamMembers() {
    const tbody = document.getElementById('team-table-body');
    if (!tbody) return;

    const { data: members, error } = await supabase.from('team').select('*').order('display_order', { ascending: true });
    if (error) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-red">Failed to load team.</td></tr>`;
      return;
    }

    tbody.innerHTML = members.map(m => `
      <tr>
        <td><img src="${m.img_url}" width="40" height="45" style="object-fit: cover; border-radius: 50%;"></td>
        <td><strong>${m.name}</strong></td>
        <td>${m.role}</td>
        <td>${m.display_order}</td>
        <td>
          <button class="btn-icon btn-edit" onclick="editTeamMember(${m.id}, '${encodeURIComponent(m.name)}', '${encodeURIComponent(m.role)}', '${m.img_url}', ${m.display_order})"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="btn-icon btn-delete" onclick="deleteTeamMember(${m.id})"><i class="fa-solid fa-trash"></i> Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // --- BROCHURE MANAGEMENT ---
  async function loadBrochureSlides() {
    const tbody = document.getElementById('brochure-table-body');
    if (!tbody) return;

    const { data: slides, error } = await supabase.from('brochure_slides').select('*').order('display_order', { ascending: true });
    if (error) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-red">Failed to load brochure slides.</td></tr>`;
      return;
    }

    tbody.innerHTML = slides.map(slide => `
      <tr>
        <td>
          ${slide.type === 'image' 
            ? `<img src="${slide.img_url}" width="60" height="40">` 
            : `<span class="gallery-tag" style="background:#0b1a30;color:#fff;">SPECS SHEET</span>`
          }
        </td>
        <td><strong>${slide.title}</strong></td>
        <td>${slide.display_order}</td>
        <td>
          <button class="btn-icon btn-edit" onclick="editBrochureSlide(${slide.id}, '${encodeURIComponent(slide.title)}', '${slide.type}', '${slide.img_url || ''}', '${encodeURIComponent(JSON.stringify(slide.specs || []))}', ${slide.display_order})"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="btn-icon btn-delete" onclick="deleteBrochureSlide(${slide.id})"><i class="fa-solid fa-trash"></i> Delete</button>
        </td>
      </tr>
    `).join('');
  }


  // ==========================================================================
  // 18. MODAL FORMS HANDLERS & IMAGE CLOUDINARY UPLOADS
  // ==========================================================================

  // Cloudinary Upload Utility
  async function uploadToCloudinary(file, statusEl, urlInput) {
    statusEl.innerHTML = 'Uploading... <i class="fa-solid fa-spinner fa-spin"></i>';
    statusEl.style.color = 'var(--accent-cyan)';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', window.ENV.CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${window.ENV.CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      urlInput.value = data.secure_url;
      statusEl.innerHTML = 'Upload success! <i class="fa-solid fa-circle-check"></i>';
      statusEl.style.color = '#2e7d32';
    } catch (e) {
      console.error(e);
      statusEl.innerHTML = 'Upload failed! <i class="fa-solid fa-circle-xmark"></i>';
      statusEl.style.color = 'var(--primary-red)';
      alert("Failed to upload image to Cloudinary. Please type or paste a direct URL instead.");
    }
  }

  // --- GALLERY MODAL EVENTS ---
  const galleryFileInput = document.getElementById('gallery-file-input');
  if (galleryFileInput) {
    galleryFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        document.getElementById('gallery-upload-status').textContent = file.name;
        uploadToCloudinary(file, document.getElementById('gallery-upload-status'), document.getElementById('gallery-item-url'));
      }
    });
  }

  document.getElementById('btn-add-gallery-item').addEventListener('click', () => {
    document.getElementById('gallery-modal-title').textContent = "Add Gallery Item";
    document.getElementById('gallery-item-id').value = "";
    document.getElementById('form-admin-gallery').reset();
    document.getElementById('gallery-upload-status').textContent = "No file chosen";
    document.getElementById('modal-admin-gallery').style.display = 'flex';
  });

  document.getElementById('btn-cancel-gallery').addEventListener('click', () => {
    document.getElementById('modal-admin-gallery').style.display = 'none';
  });

  window.editGalleryItem = (id, category, altEncoded, img_url) => {
    document.getElementById('gallery-modal-title').textContent = "Edit Gallery Item";
    document.getElementById('gallery-item-id').value = id;
    document.getElementById('gallery-item-category').value = category;
    document.getElementById('gallery-item-alt').value = decodeURIComponent(altEncoded);
    document.getElementById('gallery-item-url').value = img_url;
    document.getElementById('gallery-upload-status').textContent = "No file chosen (keep current image)";
    document.getElementById('modal-admin-gallery').style.display = 'flex';
  };

  window.deleteGalleryItem = async (id) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      await supabase.from('gallery').delete().eq('id', id);
      loadGalleryItems();
      renderDynamicContent();
    }
  };

  document.getElementById('form-admin-gallery').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('gallery-item-id').value;
    const category = document.getElementById('gallery-item-category').value;
    const alt = document.getElementById('gallery-item-alt').value.trim();
    const img_url = document.getElementById('gallery-item-url').value.trim();

    const payload = { category, alt, img_url };

    if (id) {
      await supabase.from('gallery').update(payload).eq('id', id);
    } else {
      await supabase.from('gallery').insert([payload]);
    }

    document.getElementById('modal-admin-gallery').style.display = 'none';
    loadGalleryItems();
    renderDynamicContent();
  });


  // --- TEAM MODAL EVENTS ---
  const teamFileInput = document.getElementById('team-file-input');
  if (teamFileInput) {
    teamFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        document.getElementById('team-upload-status').textContent = file.name;
        uploadToCloudinary(file, document.getElementById('team-upload-status'), document.getElementById('team-member-url'));
      }
    });
  }

  document.getElementById('btn-add-team-item').addEventListener('click', () => {
    document.getElementById('team-modal-title').textContent = "Add Team Member";
    document.getElementById('team-member-id').value = "";
    document.getElementById('form-admin-team').reset();
    document.getElementById('team-upload-status').textContent = "No file chosen";
    document.getElementById('modal-admin-team').style.display = 'flex';
  });

  document.getElementById('btn-cancel-team').addEventListener('click', () => {
    document.getElementById('modal-admin-team').style.display = 'none';
  });

  window.editTeamMember = (id, nameEnc, roleEnc, img_url, order) => {
    document.getElementById('team-modal-title').textContent = "Edit Team Member";
    document.getElementById('team-member-id').value = id;
    document.getElementById('team-member-name').value = decodeURIComponent(nameEnc);
    document.getElementById('team-member-role').value = decodeURIComponent(roleEnc);
    document.getElementById('team-member-url').value = img_url;
    document.getElementById('team-member-order').value = order;
    document.getElementById('team-upload-status').textContent = "No file chosen (keep current photo)";
    document.getElementById('modal-admin-team').style.display = 'flex';
  };

  window.deleteTeamMember = async (id) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      await supabase.from('team').delete().eq('id', id);
      loadTeamMembers();
      renderDynamicContent();
    }
  };

  document.getElementById('form-admin-team').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('team-member-id').value;
    const name = document.getElementById('team-member-name').value.trim();
    const role = document.getElementById('team-member-role').value.trim();
    const img_url = document.getElementById('team-member-url').value.trim();
    const display_order = parseInt(document.getElementById('team-member-order').value, 10) || 0;

    const payload = { name, role, img_url, display_order };

    if (id) {
      await supabase.from('team').update(payload).eq('id', id);
    } else {
      await supabase.from('team').insert([payload]);
    }

    document.getElementById('modal-admin-team').style.display = 'none';
    loadTeamMembers();
    renderDynamicContent();
  });


  // --- BROCHURE SLIDE MODAL EVENTS ---
  const brochureFileInput = document.getElementById('brochure-file-input');
  if (brochureFileInput) {
    brochureFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        document.getElementById('brochure-upload-status').textContent = file.name;
        uploadToCloudinary(file, document.getElementById('brochure-upload-status'), document.getElementById('brochure-slide-url'));
      }
    });
  }

  const slideTypeSelect = document.getElementById('brochure-slide-type');
  if (slideTypeSelect) {
    slideTypeSelect.addEventListener('change', () => {
      const type = slideTypeSelect.value;
      if (type === 'image') {
        document.getElementById('group-brochure-image').style.display = 'block';
        document.getElementById('group-brochure-url').style.display = 'block';
        document.getElementById('group-brochure-specs').style.display = 'none';
      } else {
        document.getElementById('group-brochure-image').style.display = 'none';
        document.getElementById('group-brochure-url').style.display = 'none';
        document.getElementById('group-brochure-specs').style.display = 'block';
      }
    });
  }

  document.getElementById('btn-add-brochure-item').addEventListener('click', () => {
    document.getElementById('brochure-modal-title').textContent = "Add Brochure Slide";
    document.getElementById('brochure-slide-id').value = "";
    document.getElementById('form-admin-brochure').reset();
    document.getElementById('brochure-upload-status').textContent = "No file chosen";
    document.getElementById('group-brochure-image').style.display = 'block';
    document.getElementById('group-brochure-url').style.display = 'block';
    document.getElementById('group-brochure-specs').style.display = 'none';
    document.getElementById('modal-admin-brochure').style.display = 'flex';
  });

  document.getElementById('btn-cancel-brochure').addEventListener('click', () => {
    document.getElementById('modal-admin-brochure').style.display = 'none';
  });

  window.editBrochureSlide = (id, titleEnc, type, img_url, specsEnc, order) => {
    document.getElementById('brochure-modal-title').textContent = "Edit Brochure Slide";
    document.getElementById('brochure-slide-id').value = id;
    document.getElementById('brochure-slide-title').value = decodeURIComponent(titleEnc);
    document.getElementById('brochure-slide-type').value = type;
    document.getElementById('brochure-slide-url').value = img_url;
    document.getElementById('brochure-slide-order').value = order;
    
    // Parse specs JSON
    let parsedSpecs = "";
    try {
      const decoded = decodeURIComponent(specsEnc);
      parsedSpecs = JSON.stringify(JSON.parse(decoded), null, 2);
    } catch (e) {
      parsedSpecs = "[]";
    }
    document.getElementById('brochure-slide-specs').value = parsedSpecs;

    // Toggle fields based on type
    if (type === 'image') {
      document.getElementById('group-brochure-image').style.display = 'block';
      document.getElementById('group-brochure-url').style.display = 'block';
      document.getElementById('group-brochure-specs').style.display = 'none';
      document.getElementById('brochure-upload-status').textContent = "No file chosen (keep current image)";
    } else {
      document.getElementById('group-brochure-image').style.display = 'none';
      document.getElementById('group-brochure-url').style.display = 'none';
      document.getElementById('group-brochure-specs').style.display = 'block';
    }

    document.getElementById('modal-admin-brochure').style.display = 'flex';
  };

  window.deleteBrochureSlide = async (id) => {
    if (confirm("Are you sure you want to delete this brochure slide?")) {
      await supabase.from('brochure_slides').delete().eq('id', id);
      loadBrochureSlides();
      renderDynamicContent();
    }
  };

  document.getElementById('form-admin-brochure').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('brochure-slide-id').value;
    const title = document.getElementById('brochure-slide-title').value.trim();
    const type = document.getElementById('brochure-slide-type').value;
    const img_url = type === 'image' ? document.getElementById('brochure-slide-url').value.trim() : null;
    const display_order = parseInt(document.getElementById('brochure-slide-order').value, 10) || 0;

    let specs = null;
    if (type === 'specs') {
      const rawSpecs = document.getElementById('brochure-slide-specs').value.trim();
      try {
        specs = JSON.parse(rawSpecs);
      } catch (err) {
        alert("Invalid JSON format for specifications. Please double check the schema syntax.");
        return;
      }
    }

    const payload = { title, type, img_url, specs, display_order };

    if (id) {
      await supabase.from('brochure_slides').update(payload).eq('id', id);
    } else {
      await supabase.from('brochure_slides').insert([payload]);
    }

    document.getElementById('modal-admin-brochure').style.display = 'none';
    loadBrochureSlides();
    renderDynamicContent();
  });


  // ==========================================================================
  // 19. INITIAL SEED & INITIAL RENDER
  // ==========================================================================
  
  (async function() {
    await seedDatabaseIfEmpty();
    await renderDynamicContent();
  })();

});
