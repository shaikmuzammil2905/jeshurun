/**
 * JESHURUN BUILDER'S & DEVELOPER'S - CLIENT SIDE APP LOGIC
 * Includes SPA View Router, Slide Carsouels, Counter Up Animation, 
 * Text animations, WhatsApp contact links, and Lightbox modal systems.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. SINGLE PAGE ROUTER (DYNAMIC SUBPAGE SWITCHER)
  // ==========================================================================
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-links .mobile-nav-link, .mobile-bottom-nav .bottom-nav-item, .footer-links-col a, .btn-readmore, .readmore-link, .btn-explore, .btn-contact');
  const viewSections = document.querySelectorAll('.view-section');

  function router() {
    let hash = window.location.hash || '#home';
    
    // Clear out prefix symbols if any
    let route = hash.replace('#', '');
    
    // Map of routes to view element IDs
    const routeMap = {
      'home': 'home-view',
      'about': 'about-view',
      'projects': 'projects-view',
      'services': 'services-view',
      'gallery': 'gallery-view',
      'contact': 'contact-view'
    };

    const activeViewId = routeMap[route] || 'home-view';
    
    // Smooth transition
    viewSections.forEach(section => {
      section.classList.remove('active');
    });

    const activeViewEl = document.getElementById(activeViewId);
    if (activeViewEl) {
      activeViewEl.classList.add('active');
      
      // Trigger animations for the active view
      triggerViewLoadAnimations(activeViewId);
    }

    // Update active state in navigation bars
    updateNavActiveStates(route);

    // Scroll back to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function updateNavActiveStates(route) {
    // Desktop & Mobile burger links
    const links = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-links .mobile-nav-link, .mobile-bottom-nav .bottom-nav-item');
    links.forEach(link => {
      const dataView = link.getAttribute('data-view');
      if (dataView === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Bind links that navigate to views (prevent default if using virtual path clicks)
  document.body.addEventListener('click', (e) => {
    // Intercept clicks on links that target a route hash
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        // Let hashchange trigger the router, standard href routing
        const targetView = href.replace('#', '');
        if (targetView in { 'home': 1, 'about': 1, 'projects': 1, 'services': 1, 'gallery': 1, 'contact': 1 }) {
          // Normal hash update
        }
      }
    }
  });

  // Listen for hash changes
  window.addEventListener('hashchange', router);
  
  // Initialize router on first load
  router();


  // ==========================================================================
  // 2. MOBILE MENU COLLAPSED OVERLAY DRAWER
  // ==========================================================================
  const burgerToggle = document.querySelector('.mobile-menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-overlay-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-links .mobile-nav-link');

  if (burgerToggle && mobileOverlay) {
    burgerToggle.addEventListener('click', () => {
      burgerToggle.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
      
      // Animate burger bars
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

    // Close menu drawer when any link is clicked
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
  // 3. HERO SLIDER BANNER CAROUSEL
  // ==========================================================================
  const heroSlides = document.querySelectorAll('.hero-slide');
  const slideDots = document.querySelectorAll('.slider-dots .dot');
  const prevArrow = document.querySelector('.prev-arrow');
  const nextArrow = document.querySelector('.next-arrow');
  let currentSlideIndex = 0;
  let slideInterval;

  function showSlide(index) {
    heroSlides.forEach((slide, idx) => {
      slide.classList.remove('active');
      slideDots[idx].classList.remove('active');
    });

    currentSlideIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides[currentSlideIndex].classList.add('active');
    slideDots[currentSlideIndex].classList.add('active');
    
    // Trigger animated text inside active slide
    const title = heroSlides[currentSlideIndex].querySelector('.hero-title');
    if (title && title.classList.contains('animated-text')) {
      animateLetters(title);
    }
  }

  function nextSlide() {
    showSlide(currentSlideIndex + 1);
  }

  function prevSlide() {
    showSlide(currentSlideIndex - 1);
  }

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
  // 4. STATS COUNTER TICKER ANIMATION
  // ==========================================================================
  function animateCounters(statsEl) {
    const counterNumbers = statsEl.querySelectorAll('.stat-number');
    counterNumbers.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const duration = 1500; // ms
      let startTime = null;

      function updateCounter(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentValue = Math.floor(progress * target);
        
        counter.textContent = currentValue;
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target; // Safeguard final frame
        }
      }
      requestAnimationFrame(updateCounter);
    });
  }

  // Observer to trigger counter when stats become visible
  const statsObservers = [];
  const statsSections = document.querySelectorAll('.stats-section');
  
  statsSections.forEach(section => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters(entry.target);
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, { threshold: 0.25 });
    
    observer.observe(section);
    statsObservers.push(observer);
  });


  // ==========================================================================
  // 5. LETTERS & TEXT TYPING / POPPING ANIMATION
  // ==========================================================================
  function animateLetters(headingElement) {
    if (!headingElement) return;
    
    // Prevent double execution on same text
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
        // Stagger transitions slightly
        charSpan.style.animationDelay = `${(wordIdx * 4 + charIdx) * 0.03}s`;
        wordSpan.appendChild(charSpan);
      });
      
      headingElement.appendChild(wordSpan);
    });
  }

  function triggerViewLoadAnimations(viewId) {
    const activeView = document.getElementById(viewId);
    if (!activeView) return;

    // Trigger Title letter split animations inside loaded view
    const mainTitle = activeView.querySelector('.section-title, .subpage-banner h1');
    if (mainTitle) {
      animateLetters(mainTitle);
    }

    // Trigger scroll-trigger visibility checking immediately for standard layouts
    setTimeout(checkScrollTriggerElements, 100);
  }


  // ==========================================================================
  // 6. PORTFOLIO & RECENT WORK PROJECTS MODALS (LIGHTBOX DATA)
  // ==========================================================================
  
  // Project mock data database
  const projectDatabase = {
    'luxury-villa': {
      title: 'Luxury Villa Project',
      meta: 'Jubilee Hills, Hyderabad | Completed',
      client: 'Arun & Family Co.',
      category: 'Residential Development',
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
      category: 'Multi-family Residential',
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
      category: 'Commercial Business Complex',
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
      category: 'Residential Luxury Block',
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
      category: 'Commercial Interiors',
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
      category: 'Residential Highrise',
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
    if (!data) return;

    // Reset slider track
    slidesTrack.innerHTML = '';
    activeModalImgIndex = 0;
    modalImagesList = data.images;

    // Populate images
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

    // Populate details
    titlePane.textContent = data.title;
    metaPane.textContent = data.meta;
    descPane.textContent = data.desc;
    clientPane.textContent = data.client;
    categoryPane.textContent = data.category;
    sizePane.textContent = data.size;

    updateModalSlider();

    // Toggle display
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  }

  function updateModalSlider() {
    slidesTrack.style.transform = `translateX(-${activeModalImgIndex * 100}%)`;
  }

  if (lightboxModal && lightboxClose) {
    // Event delegation for opening cards
    document.body.addEventListener('click', (e) => {
      const projectCard = e.target.closest('.project-card');
      if (projectCard) {
        const prjId = projectCard.getAttribute('data-project');
        if (prjId) {
          openProjectLightbox(prjId);
        }
      }
    });

    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = ''; // Unlock scrolling
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

    // Close lightbox on wrapper background click
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Link CTA inside modal closes modal and jumps to contact hash
    modalCTABtn.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }


  // ==========================================================================
  // 7. GALLERY & PROJECTS SHOWCASE CATEGORY FILTER SYSTEM
  // ==========================================================================
  function setupFilterSystem(filterContainerId, gridContainerSelector, itemSelector) {
    const filterRow = document.getElementById(filterContainerId);
    if (!filterRow) return;

    const filterButtons = filterRow.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll(gridContainerSelector + ' ' + itemSelector);

    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Clear active classes
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filterValue = e.target.getAttribute('data-filter');

        items.forEach(item => {
          // Check categories match
          const itemCategory = item.getAttribute('data-category');
          if (filterValue === 'all' || itemCategory === filterValue) {
            item.style.display = 'block';
            item.style.animation = 'viewFadeIn 0.4s ease forwards';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // Home Gallery filter
  setupFilterSystem('home-gallery-filters', '.gallery-grid', '.gallery-item');
  // Subpage Gallery filter
  setupFilterSystem('gallery-view-filters', '#gallery-view-grid', '.gallery-item');
  // Subpage Projects filter
  setupFilterSystem('projects-view-filters', '.projects-grid', '.project-card');


  // ==========================================================================
  // 8. CONTACT FORM MESSAGE ROUTING TO WHATSAPP (+91 93921 68888)
  // ==========================================================================
  const contactForms = document.querySelectorAll('.contact-enquiry-form');

  contactForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Read form data
      const name = form.querySelector('.text-input-name').value.trim();
      const phone = form.querySelector('.text-input-phone').value.trim();
      const email = form.querySelector('.text-input-email').value.trim();
      const projectType = form.querySelector('.select-project-type').value;
      const message = form.querySelector('.text-textarea-msg').value.trim();
      
      const subjectInput = form.querySelector('.text-input-subject');
      const subject = subjectInput ? subjectInput.value.trim() : 'Project Inquiry';

      // Check validation
      if (!name || !phone || !email || !projectType || !message) {
        alert('Please fill out all required fields.');
        return;
      }

      // Format custom message
      const formattedMessage = `Hello Jeshurun Builder's, I want to submit an enquiry:
----------------------------------------
👤 *Name*: ${name}
📞 *Phone*: ${phone}
📧 *Email*: ${email}
🏗️ *Project Type*: ${projectType}
📌 *Subject*: ${subject}
💬 *Message*: ${message}`;

      // URL encode
      const encodedText = encodeURIComponent(formattedMessage);
      
      // WhatsApp API Link construction
      const whatsappURL = `https://wa.me/919392168888?text=${encodedText}`;

      // Open in a new tab
      window.open(whatsappURL, '_blank');
      
      // Clear inputs
      form.reset();
    });
  });


  // ==========================================================================
  // 9. GOOGLE MAPS LINK INTEGRATION (https://maps.app.goo.gl/3NbPbWttGBSjQ692A)
  // ==========================================================================
  const mapTriggers = document.querySelectorAll('#home-map-trigger, #subpage-map-trigger');
  
  mapTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const mapLink = 'https://maps.app.goo.gl/3NbPbWttGBSjQ692A';
      window.open(mapLink, '_blank');
    });
  });


  // ==========================================================================
  // 10. SCROLL TO TOP & FLOATING WIDGET ACTIONS
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
  // 11. SCROLL REVEAL STICKY OBSERVERS
  // ==========================================================================
  const scrollElements = document.querySelectorAll('.scroll-trigger');

  function checkScrollTriggerElements() {
    scrollElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Element is visible in viewport
      if (rect.top <= windowHeight * 0.85) {
        el.classList.add('appear');
      }
    });
  }

  window.addEventListener('scroll', checkScrollTriggerElements);
  // Initial check
  checkScrollTriggerElements();

  // Testimonial automatic/manual slider carousel logic
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const prevTestiBtn = document.querySelector('.prev-testi-btn');
  const nextTestiBtn = document.querySelector('.next-testi-btn');
  let currentTestiIdx = 0;

  function showTestimonial(idx) {
    testimonialSlides.forEach(slide => slide.classList.remove('active'));
    currentTestiIdx = (idx + testimonialSlides.length) % testimonialSlides.length;
    testimonialSlides[currentTestiIdx].classList.add('active');
  }

  if (testimonialSlides.length > 0) {
    if (nextTestiBtn) {
      nextTestiBtn.addEventListener('click', () => {
        showTestimonial(currentTestiIdx + 1);
      });
    }
    if (prevTestiBtn) {
      prevTestiBtn.addEventListener('click', () => {
        showTestimonial(currentTestiIdx - 1);
      });
    }
    
    // Auto cycle testimonials
    setInterval(() => {
      showTestimonial(currentTestiIdx + 1);
    }, 8000);
  }

  // Handle clicking details from gallery snaps to open projects
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      // Map item category to a corresponding mock database project for preview
      const cat = item.getAttribute('data-category');
      const projectMap = {
        'residential': 'luxury-villa',
        'commercial': 'commercial-complex',
        'interior': 'corporate-hq',
        'progress': 'luxury-penthouses',
        'completed': 'modern-residence'
      };
      
      const prjId = projectMap[cat] || 'luxury-villa';
      openProjectLightbox(prjId);
    });
  });

});
