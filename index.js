document.addEventListener('DOMContentLoaded', () => {

  /* ── MOBILE MENU TOGGLE ──────────────────────────────────────────────── */
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      const isExpanded = mainNav.classList.contains('active');
      menuToggle.innerHTML = isExpanded ? '✕' : '☰';
    });
  }

  /* ── HERO SLIDESHOW ───────────────────────────────────────────────────── */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  const heroPrevBtn = document.getElementById('hero-prev-btn');
  const heroNextBtn = document.getElementById('hero-next-btn');

  let currentHeroSlide = 0;
  let slideIntervalId = null;
  const slideDuration = 10000; // 10 seconds

  function showHeroSlide(index) {
    if (heroSlides.length === 0) return;

    // Handle overflow boundaries
    if (index >= heroSlides.length) {
      currentHeroSlide = 0;
    } else if (index < 0) {
      currentHeroSlide = heroSlides.length - 1;
    } else {
      currentHeroSlide = index;
    }

    // Toggle active slides and play/pause videos
    heroSlides.forEach((slide, i) => {
      const isActive = i === currentHeroSlide;
      slide.classList.toggle('active', isActive);

      const video = slide.querySelector('video');
      if (video) {
        if (isActive) {
          // Play the current slide's video
          video.play().catch(err => console.log('Video autoplay blocked or interrupted:', err));
        } else {
          // Pause and reset other videos
          video.pause();
          video.currentTime = 0;
        }
      }
    });

    // Update active dot indicators
    heroDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentHeroSlide);
    });
  }

  function nextHeroSlide() {
    showHeroSlide(currentHeroSlide + 1);
  }

  function prevHeroSlide() {
    showHeroSlide(currentHeroSlide - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    if (heroSlides.length > 1) {
      slideIntervalId = setInterval(nextHeroSlide, slideDuration);
    }
  }

  function stopAutoplay() {
    if (slideIntervalId) {
      clearInterval(slideIntervalId);
      slideIntervalId = null;
    }
  }

  // Hook next/prev navigation arrow buttons
  if (heroPrevBtn) {
    heroPrevBtn.addEventListener('click', () => {
      prevHeroSlide();
      startAutoplay(); // Reset autoplay timer on manual click
    });
  }

  if (heroNextBtn) {
    heroNextBtn.addEventListener('click', () => {
      nextHeroSlide();
      startAutoplay(); // Reset autoplay timer on manual click
    });
  }

  // Hook dot indicator clicks
  heroDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.dataset.slide, 10);
      if (!isNaN(slideIndex)) {
        showHeroSlide(slideIndex);
        startAutoplay(); // Reset autoplay timer on manual click
      }
    });
  });

  // Initialize Hero Slideshow
  if (heroSlides.length > 0) {
    showHeroSlide(0);
    startAutoplay();
  }

  /* ── CART STATE MANAGEMENT ────────────────────────────────────────────── */
  let cart = JSON.parse(localStorage.getItem('scent_cart')) || [];

  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartOpenBtn = document.getElementById('cart-open-btn');
  const cartCloseBtn = document.getElementById('cart-drawer-close');
  const cartBadge = document.getElementById('cart-badge');
  const cartDrawerBody = document.getElementById('cart-drawer-body');
  const cartSubtotalElement = document.getElementById('cart-subtotal');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  function saveCart() {
    localStorage.setItem('scent_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function toggleCart() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.toggle('active');
      cartDrawerOverlay.classList.toggle('active');
    }
  }

  if (cartOpenBtn) cartOpenBtn.addEventListener('click', toggleCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', toggleCart);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', toggleCart);

  function addToCart(item) {
    // Check if item already exists (for bundles, they are unique based on selection)
    const existingIndex = cart.findIndex(c => c.id === item.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += (item.quantity || 1);
    } else {
      cart.push(item);
    }
    saveCart();
    // Open cart drawer immediately to show additions
    if (cartDrawer && !cartDrawer.classList.contains('active')) {
      toggleCart();
    }
  }

  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
  }

  function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        removeFromCart(id);
      } else {
        saveCart();
      }
    }
  }

  function updateCartUI() {
    // Update badges
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) {
      cartBadge.textContent = totalCount;
      cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    if (!cartDrawerBody) return;

    if (cart.length === 0) {
      cartDrawerBody.innerHTML = `
        <div class="cart-empty-message">
          <div class="cart-empty-icon">🛒</div>
          <p>Your cart is currently empty.</p>
          <button class="cart-continue-btn" id="cart-continue-btn">Continue Shopping</button>
        </div>
      `;
      const contBtn = document.getElementById('cart-continue-btn');
      if (contBtn) contBtn.addEventListener('click', toggleCart);
      if (cartSubtotalElement) cartSubtotalElement.textContent = '₹0';
      if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
      let subtotal = 0;
      let itemsHTML = '<div class="cart-items-list">';

      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        itemsHTML += `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-img">
              <img src="${item.img}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
              <div>
                <h4 class="cart-item-title">${item.title}</h4>
                ${item.contents ? `<p class="cart-item-bundle-contents">${item.contents.join(', ')}</p>` : ''}
                <button class="cart-item-remove-btn" data-id="${item.id}">Remove</button>
              </div>
              <div class="cart-item-row">
                <div class="quantity-selector">
                  <button class="qty-btn dec-qty" data-id="${item.id}">−</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn inc-qty" data-id="${item.id}">+</button>
                </div>
                <span class="cart-item-price">₹${itemTotal}</span>
              </div>
            </div>
          </div>
        `;
      });

      itemsHTML += '</div>';
      cartDrawerBody.innerHTML = itemsHTML;

      if (cartSubtotalElement) cartSubtotalElement.textContent = `₹${subtotal}`;
      if (checkoutBtn) checkoutBtn.disabled = false;

      // Attach Event Listeners to cart controls
      document.querySelectorAll('.dec-qty').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1));
      });
      document.querySelectorAll('.inc-qty').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1));
      });
      document.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
      });
    }

    // Toggle Pincode Checker container visibility based on cart status
    const pincodeCheckerEl = document.getElementById('cart-pincode-checker');
    if (pincodeCheckerEl) {
      if (cart.length > 0) {
        pincodeCheckerEl.style.display = 'block';
      } else {
        pincodeCheckerEl.style.display = 'none';
        // Clear result
        const pinInput = document.getElementById('cart-pincode-input');
        const pinResult = document.getElementById('cart-pincode-result');
        if (pinInput) pinInput.value = '';
        if (pinResult) {
          pinResult.innerHTML = '';
          pinResult.className = 'pincode-result-box';
          pinResult.style.display = 'none';
        }
      }
    }
  }

  // GoKwik Checkout Integration
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      checkoutBtn.textContent = 'Processing...';
      checkoutBtn.disabled = true;
      setTimeout(() => {
        alert('GoKwik Checkout triggered!\nTotal amount: ' + cartSubtotalElement.textContent + '\nProceeding to payment gateway simulation...');
        checkoutBtn.textContent = 'Check Out';
        checkoutBtn.disabled = false;
        cart = [];
        saveCart();
        toggleCart();
      }, 1500);
    });
  }

  // Initial cart draw
  updateCartUI();

  /* ── DUAL BUNDLE BUILDER LOGIC ───────────────────────────────────────── */
  const builders = {
    'her': {
      selected: [],
      max: 3,
      price: 1999,
      prefix: 'her'
    },
    'him': {
      selected: [],
      max: 3,
      price: 1999,
      prefix: 'him'
    }
  };

  function initBundleBuilder(type) {
    const builder = builders[type];
    const products = document.querySelectorAll(`.sg-bundle__prod[data-type="${type}"]`);
    const slots = document.querySelectorAll(`.sg-bundle__slot[data-type="${type}"]`);
    const countLabel = document.getElementById(`sg-count-${type}`);
    const ctaButton = document.getElementById(`sg-cta-${type}`);

    products.forEach(p => {
      p.addEventListener('click', () => {
        const title = p.dataset.productTitle;
        const img = p.dataset.productImg;
        const id = p.dataset.productId;

        // Toggle selection
        const index = builder.selected.findIndex(item => item.id === id);
        if (index > -1) {
          // Remove from selection
          removeProductFromBuilder(type, id);
        } else {
          // Add to selection if not full
          if (builder.selected.length < builder.max) {
            addProductToBuilder(type, { id, title, img, element: p });
          } else {
            alert('Your bundle is full! Remove an item first.');
          }
        }
      });
    });

    // Slots close buttons listeners
    slots.forEach(slot => {
      const closeBtn = slot.querySelector('.sg-bundle__slot-remove');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = slot.dataset.productId;
          if (id) {
            removeProductFromBuilder(type, id);
          }
        });
      }
    });

    // CTA Add to Cart listener
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
        if (builder.selected.length === builder.max) {
          const titles = builder.selected.map(item => item.title.replace(' Extrait De Parfum', ''));
          const bundleItem = {
            id: `bundle-${type}-${Date.now()}`,
            title: `Custom Bundle for ${type === 'her' ? 'Her' : 'Him'} (3 Picks)`,
            contents: titles,
            price: builder.price,
            quantity: 1,
            // Use image of first product in bundle
            img: builder.selected[0].img
          };

          addToCart(bundleItem);

          // Clear bundle builder selection
          clearBuilderSelection(type);

          // Close modal if open
          if (window.closeBundleModal) {
            window.closeBundleModal();
          }
        }
      });
    }
  }

  function addProductToBuilder(type, product) {
    const builder = builders[type];
    builder.selected.push(product);
    product.element.classList.add('sg-selected');

    updateBuilderUI(type);
  }

  function removeProductFromBuilder(type, id) {
    const builder = builders[type];
    const index = builder.selected.findIndex(item => item.id === id);
    if (index > -1) {
      const product = builder.selected[index];
      product.element.classList.remove('sg-selected');
      builder.selected.splice(index, 1);
    }

    updateBuilderUI(type);
  }

  function clearBuilderSelection(type) {
    const builder = builders[type];
    builder.selected.forEach(product => {
      product.element.classList.remove('sg-selected');
    });
    builder.selected = [];
    updateBuilderUI(type);
  }

  function updateBuilderUI(type) {
    const builder = builders[type];
    const slots = document.querySelectorAll(`.sg-bundle__slot[data-type="${type}"]`);
    const countLabel = document.getElementById(`sg-count-${type}`);
    const ctaButton = document.getElementById(`sg-cta-${type}`);

    // Update slots
    slots.forEach((slot, i) => {
      const slotImg = slot.querySelector('.sg-bundle__slot-img');
      const slotPlaceholder = slot.querySelector('.sg-bundle__slot-placeholder');

      if (i < builder.selected.length) {
        const item = builder.selected[i];
        slot.classList.add('sg-filled');
        slot.dataset.productId = item.id;

        if (slotImg) {
          slotImg.src = item.img;
          slotImg.alt = item.title;
        }
        if (slotPlaceholder) slotPlaceholder.classList.add('hidden');
      } else {
        slot.classList.remove('sg-filled');
        slot.removeAttribute('data-product-id');

        if (slotImg) {
          slotImg.src = '';
          slotImg.alt = '';
        }
        if (slotPlaceholder) slotPlaceholder.classList.remove('hidden');
      }
    });

    // Update counts label
    if (countLabel) {
      countLabel.textContent = `${builder.selected.length} of ${builder.max} selected`;
    }

    // Update CTA button state
    if (ctaButton) {
      const remaining = builder.max - builder.selected.length;
      if (remaining > 0) {
        ctaButton.disabled = true;
        ctaButton.textContent = `Pick ${remaining} more to build your bundle`;
      } else {
        ctaButton.disabled = false;
        ctaButton.textContent = 'Add Bundle to Cart';
      }
    }
  }

  // Initialize both builders
  initBundleBuilder('her');
  initBundleBuilder('him');

  /* ── IMMERSIVE INSTAGRAM STORIES LOGIC ────────────────────────────────── */
  const storyAvatars = document.querySelectorAll('.story-avatar-btn');
  const storiesModal = document.getElementById('stories-modal');
  const storyVideo = document.getElementById('story-video');
  const storyAuthorImg = document.getElementById('story-author-img');
  const storyAuthorName = document.getElementById('story-author-name');
  const storyCloseBtn = document.getElementById('story-close-btn');
  const playPauseBtn = document.getElementById('story-play-pause-btn');
  const muteBtn = document.getElementById('story-mute-btn');

  const navLeft = document.getElementById('story-nav-prev');
  const navRight = document.getElementById('story-nav-next');

  let currentStoryIndex = 0;
  let progressAnimationInterval;
  let progressFillTime = 0;
  let storyDuration = 8000; // 8 seconds default fallback (if video meta fails)
  let isStoryPaused = false;
  let isStoryMuted = false;

  const storiesData = [
    {
      name: 'Abhishek',
      avatar: 'https://scentgames.in/cdn/shop/files/Screenshot_2026-02-17_at_6.07.13_PM.png?v=1771331852&width=200',
      video: 'https://scentgames.in/cdn/shop/videos/c/vp/f2b6f738bdf242a68b3a5298a4f7bc6a/f2b6f738bdf242a68b3a5298a4f7bc6a.HD-1080p-2.5Mbps-75662242.mp4?v=0',
      poster: 'https://scentgames.in/cdn/shop/files/preview_images/99792974fab644d1ad2e7b1a126a02ce.thumbnail.0000000000_1000x.jpg?v=1771331844'
    },
    {
      name: 'Roshni',
      avatar: 'https://scentgames.in/cdn/shop/files/Screenshot_2026-02-17_at_6.24.22_PM.png?v=1771332893&width=200',
      video: 'https://scentgames.in/cdn/shop/videos/c/vp/d9a0873b85034c33a8265b461848c887/d9a0873b85034c33a8265b461848c887.HD-1080p-3.3Mbps-75662255.mp4?v=0',
      poster: 'https://scentgames.in/cdn/shop/files/preview_images/dc4e200b94d94f218ab5b97f7c0c55ea.thumbnail.0000000000_1000x.jpg?v=1771333720'
    },
    {
      name: 'Khushi',
      avatar: 'https://scentgames.in/cdn/shop/files/Screenshot_2026-02-17_at_6.36.51_PM.png?v=1771333641&width=200',
      video: 'https://scentgames.in/cdn/shop/videos/c/vp/f2b6f738bdf242a68b3a5298a4f7bc6a/f2b6f738bdf242a68b3a5298a4f7bc6a.HD-1080p-2.5Mbps-75662242.mp4?v=0',
      poster: 'https://scentgames.in/cdn/shop/files/preview_images/3f18368fe014427790b62109c14c577d.thumbnail.0000000000_1000x.jpg?v=1771332960'
    },
    {
      name: 'Vishal',
      avatar: 'https://scentgames.in/cdn/shop/files/Screenshot_2026-02-17_at_6.59.59_PM.png?v=1771335257&width=200',
      video: 'https://scentgames.in/cdn/shop/videos/c/vp/d9a0873b85034c33a8265b461848c887/d9a0873b85034c33a8265b461848c887.HD-1080p-3.3Mbps-75662255.mp4?v=0',
      poster: 'https://scentgames.in/cdn/shop/files/preview_images/f6b61fa96c954ae7904593e41c368afc.thumbnail.0000000000_1000x.jpg?v=1771335353'
    }
  ];

  function openStory(index) {
    currentStoryIndex = index;
    isStoryPaused = false;

    if (storiesModal) storiesModal.classList.add('active');

    // Create progress bar ticks
    renderProgressBars();

    // Load and play
    loadStoryContent(currentStoryIndex);
  }

  function closeStoryModal() {
    if (storiesModal) storiesModal.classList.remove('active');
    if (storyVideo) {
      storyVideo.pause();
      storyVideo.src = '';
    }
    clearInterval(progressAnimationInterval);
  }

  if (storyCloseBtn) storyCloseBtn.addEventListener('click', closeStoryModal);

  function renderProgressBars() {
    const container = document.getElementById('story-progress-container');
    if (!container) return;

    container.innerHTML = '';
    storiesData.forEach((_, i) => {
      const bar = document.createElement('div');
      bar.className = 'story-progress-bar';

      const fill = document.createElement('div');
      fill.className = 'story-progress-fill';
      fill.id = `story-fill-${i}`;

      if (i < currentStoryIndex) {
        fill.style.width = '100%';
      } else {
        fill.style.width = '0%';
      }

      bar.appendChild(fill);
      container.appendChild(bar);
    });
  }

  function loadStoryContent(index) {
    const story = storiesData[index];
    if (!storyVideo || !story) return;

    // Load author profile
    if (storyAuthorImg) storyAuthorImg.src = story.avatar;
    if (storyAuthorName) storyAuthorName.textContent = story.name;

    // Load media
    storyVideo.src = story.video;
    storyVideo.load();
    storyVideo.play()
      .then(() => {
        isStoryPaused = false;
        if (playPauseBtn) playPauseBtn.textContent = '⏸';
      })
      .catch((e) => {
        console.warn('Playback failed, waiting for interaction:', e);
      });

    storyVideo.muted = isStoryMuted;
    if (muteBtn) muteBtn.textContent = isStoryMuted ? '🔇' : '🔊';

    // Wait for video loaded metadata to align timeline
    storyVideo.onloadedmetadata = () => {
      storyDuration = (storyVideo.duration * 1000) || 8000;
      startStoryTimeline(index);
    };

    // Backup trigger if metadata fails to fire
    setTimeout(() => {
      if (progressFillTime === 0) {
        startStoryTimeline(index);
      }
    }, 500);
  }

  function startStoryTimeline(index) {
    clearInterval(progressAnimationInterval);
    progressFillTime = 0;

    const fillEl = document.getElementById(`story-fill-${index}`);
    if (!fillEl) return;

    const intervalMs = 100;

    progressAnimationInterval = setInterval(() => {
      if (!isStoryPaused) {
        progressFillTime += intervalMs;
        const percent = Math.min((progressFillTime / storyDuration) * 100, 100);
        fillEl.style.width = `${percent}%`;

        if (progressFillTime >= storyDuration) {
          clearInterval(progressAnimationInterval);
          nextStory();
        }
      }
    }, intervalMs);
  }

  function nextStory() {
    if (currentStoryIndex < storiesData.length - 1) {
      currentStoryIndex++;
      renderProgressBars();
      loadStoryContent(currentStoryIndex);
    } else {
      closeStoryModal();
    }
  }

  function prevStory() {
    if (currentStoryIndex > 0) {
      currentStoryIndex--;
      renderProgressBars();
      loadStoryContent(currentStoryIndex);
    } else {
      // Replay first story
      renderProgressBars();
      loadStoryContent(0);
    }
  }

  // Bind navigations zones
  if (navLeft) navLeft.addEventListener('click', prevStory);
  if (navRight) navRight.addEventListener('click', nextStory);

  // Bind avatars to click trigger
  storyAvatars.forEach((avatar, i) => {
    avatar.addEventListener('click', () => openStory(i));
  });

  // Controls
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (!storyVideo) return;

      if (isStoryPaused) {
        storyVideo.play();
        isStoryPaused = false;
        playPauseBtn.textContent = '⏸';
      } else {
        storyVideo.pause();
        isStoryPaused = true;
        playPauseBtn.textContent = '▶';
      }
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      if (!storyVideo) return;
      isStoryMuted = !isStoryMuted;
      storyVideo.muted = isStoryMuted;
      muteBtn.textContent = isStoryMuted ? '🔇' : '🔊';
    });
  }

  /* ── SCROLL TO TOP LOGIC ──────────────────────────────────────────────── */
  const scrollTopBtn = document.getElementById('scroll-top-btn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('active');
    } else {
      scrollTopBtn.classList.remove('active');
    }
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ── FLOATING QUIZ BUTTON LOGIC & MODAL TRIGGER ───────────────────────── */
  const quizModal = document.getElementById('scent-finder');
  const floatingQuizBtn = document.getElementById('floating-quiz-btn');
  const quizModalCloseBtn = document.getElementById('quiz-modal-close');
  const quizNavLink = document.querySelector('a[href="#scent-finder"]');

  function openQuizModal() {
    if (!quizModal) return;
    
    // Close mobile menu if active
    if (mainNav && mainNav.classList.contains('active')) {
      mainNav.classList.remove('active');
      if (menuToggle) menuToggle.innerHTML = '☰';
    }
    
    quizModal.style.display = 'flex';
    requestAnimationFrame(() => {
      quizModal.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeQuizModal() {
    if (!quizModal) return;
    quizModal.classList.remove('active');
    setTimeout(() => {
      quizModal.style.display = 'none';
    }, 350);
    document.body.style.overflow = '';
  }

  if (floatingQuizBtn) {
    floatingQuizBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openQuizModal();
    });
  }

  if (quizNavLink) {
    quizNavLink.addEventListener('click', (e) => {
      e.preventDefault();
      openQuizModal();
    });
  }

  if (quizModalCloseBtn) {
    quizModalCloseBtn.addEventListener('click', closeQuizModal);
  }

  if (quizModal) {
    quizModal.addEventListener('click', (e) => {
      if (e.target === quizModal || e.target.classList.contains('container')) {
        closeQuizModal();
      }
    });
  }

  // Escape key support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuizModal();
    }
  });

  /* ── CRAZY DEALS CAROUSEL LOGIC ───────────────────────────────────────── */
  const dealsPrevBtn = document.querySelector('.deals-nav-btn--prev');
  const dealsNextBtn = document.querySelector('.deals-nav-btn--next');
  const dealsCarousel = document.querySelector('.deals-carousel');
  const dealsCards = document.querySelectorAll('.deals-card');

  if (dealsCarousel) {
    const getScrollDistance = () => {
      const card = dealsCarousel.querySelector('.deals-card');
      if (card) {
        return card.offsetWidth + 8; // card width + gap
      }
      return 308;
    };

    if (dealsPrevBtn) {
      dealsPrevBtn.addEventListener('click', () => {
        dealsCarousel.scrollBy({ left: -getScrollDistance(), behavior: 'smooth' });
      });
    }

    if (dealsNextBtn) {
      dealsNextBtn.addEventListener('click', () => {
        dealsCarousel.scrollBy({ left: getScrollDistance(), behavior: 'smooth' });
      });
    }

    // Scroll tracking to scale center card
    function updateActiveCard() {
      const carouselRect = dealsCarousel.getBoundingClientRect();
      const carouselCenter = carouselRect.left + carouselRect.width / 2;

      let closestCard = null;
      let minDistance = Infinity;

      dealsCards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(carouselCenter - cardCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestCard = card;
        }
      });

      dealsCards.forEach(card => {
        if (card === closestCard) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }

    dealsCarousel.addEventListener('scroll', updateActiveCard);
    window.addEventListener('resize', updateActiveCard);
    // Initial call
    setTimeout(updateActiveCard, 100);
  }

  /* ── BUNDLE BUILDER MODAL LOGIC ───────────────────────────────────────── */
  const bundleModal = document.getElementById('bundle-modal');
  const bundleModalOverlay = document.getElementById('bundle-modal-overlay');
  const bundleModalClose = document.getElementById('bundle-modal-close');
  const tabBtnHim = document.getElementById('tab-btn-him');
  const tabBtnHer = document.getElementById('tab-btn-her');

  function openBundleModal(type) {
    if (!bundleModal || !bundleModalOverlay) return;

    // Set active tab layout
    if (type === 'her') {
      bundleModal.classList.remove('show-him');
      bundleModal.classList.add('show-her');
      if (tabBtnHim) tabBtnHim.classList.remove('active');
      if (tabBtnHer) tabBtnHer.classList.add('active');
    } else {
      bundleModal.classList.remove('show-her');
      bundleModal.classList.add('show-him');
      if (tabBtnHer) tabBtnHer.classList.remove('active');
      if (tabBtnHim) tabBtnHim.classList.add('active');
    }

    bundleModal.classList.add('active');
    bundleModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeBundleModal() {
    if (!bundleModal || !bundleModalOverlay) return;
    bundleModal.classList.remove('active');
    bundleModalOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
  }

  // Hook deals card clicks to open the modal
  dealsCards.forEach(card => {
    const dealType = card.dataset.dealType;
    if (dealType) {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        openBundleModal(dealType);
      });
    }
  });

  // Modal close listeners
  if (bundleModalClose) {
    bundleModalClose.addEventListener('click', closeBundleModal);
  }
  if (bundleModalOverlay) {
    bundleModalOverlay.addEventListener('click', closeBundleModal);
  }

  // Tabs toggle inside modal
  if (tabBtnHim) {
    tabBtnHim.addEventListener('click', () => {
      bundleModal.classList.remove('show-her');
      bundleModal.classList.add('show-him');
      tabBtnHer.classList.remove('active');
      tabBtnHim.classList.add('active');
    });
  }
  if (tabBtnHer) {
    tabBtnHer.addEventListener('click', () => {
      bundleModal.classList.remove('show-him');
      bundleModal.classList.add('show-her');
      tabBtnHim.classList.remove('active');
      tabBtnHer.classList.add('active');
    });
  }

  // Hook featured products add-to-cart buttons
  const productAddBtns = document.querySelectorAll('.product-card__add-btn');
  productAddBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      const price = parseInt(btn.dataset.price);
      const img = btn.dataset.img;

      const item = {
        id: id,
        title: title,
        price: price,
        quantity: 1,
        img: img
      };

      addToCart(item);
    });
  });

  // Expose modal functions globally so the category builder can trigger it
  window.closeBundleModal = closeBundleModal;
  window.openBundleModal = openBundleModal;

  /* ── VIEW ALL PRODUCTS TOGGLE LOGIC ────────────────────────────────────── */
  const viewAllBtn = document.getElementById('view-all-products-btn');
  const bestSellersGrid = document.querySelector('#featured-products .products-grid');

  if (viewAllBtn && bestSellersGrid) {
    viewAllBtn.addEventListener('click', () => {
      const isShowingAll = bestSellersGrid.classList.toggle('show-all');
      
      if (isShowingAll) {
        viewAllBtn.textContent = 'SHOW LESS';
      } else {
        viewAllBtn.textContent = 'VIEW ALL PRODUCTS';
        const bestSellersSection = document.getElementById('featured-products');
        if (bestSellersSection) {
          bestSellersSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  /* ── SCENT FINDER QUIZ LOGIC ─────────────────────────────────────────── */
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizProgressFill = document.getElementById('quiz-progress-fill');
  const quizStepCount = document.getElementById('quiz-step-count');
  const quizStepPercent = document.getElementById('quiz-step-percent');
  const quizResult = document.getElementById('quiz-result');
  const prevBtns = document.querySelectorAll('.quiz-nav-btn--prev');
  const quizRetakeBtn = document.getElementById('quiz-retake-btn');
  const quizAddBtn = document.getElementById('quiz-match-add-btn');

  let currentStep = 1;
  const quizAnswers = {
    gender: '',
    vibe: '',
    occasion: '',
    intensity: ''
  };

  const quizProducts = [
    {
      id: 'single-blue-drip',
      title: 'Blue Drip Extrait De Parfum',
      notes: 'Fresh · Aquatic · Vanilla',
      desc: 'Masterfully crafted for modern versatility. A fresh splash of aquatic notes layered on a warm vanilla backdrop. Perfect for clean, everyday elegance.',
      price: '₹849',
      originalPrice: '₹1,499',
      img: 'https://scentgames.in/cdn/shop/files/34_400x400_crop_center.jpg?v=1777812440'
    },
    {
      id: 'single-lush-muse',
      title: 'Lush Muse Extrait De Parfum',
      notes: 'Fresh · Floral · Woody',
      desc: 'Elegant and alluring. Crisp green and fresh aquatic vibes meeting soft floral fields and dry woody base tones. Stays sophisticated throughout the day.',
      price: '₹899',
      originalPrice: '₹1,499',
      img: 'https://scentgames.in/cdn/shop/files/55_400x400_crop_center.jpg?v=1777812439'
    },
    {
      id: 'single-rouge-fantasy',
      title: 'Rouge Fantasy Extrait De Parfum',
      notes: 'Spicy · Floral · Warm Rosy',
      desc: 'An intense, magical statement. Saffron and warm spices dance with fresh jasmine and rich, comforting resin. The ultimate choice for deep, night-out attraction.',
      price: '₹849',
      originalPrice: '₹1,499',
      img: 'https://scentgames.in/cdn/shop/files/48_400x400_crop_center.jpg?v=1777812073'
    },
    {
      id: 'single-rich-af',
      title: 'Rich AF Extrait De Parfum',
      notes: 'Citrus · Fresh Aqua · Oakmoss',
      desc: 'Bold, masculine, and unapologetic. Zesty citrus energy combining with clean ocean notes and a strong, earthy oakmoss base. Designed to leave a lasting impression.',
      price: '₹849',
      originalPrice: '₹1,499',
      img: 'https://scentgames.in/cdn/shop/files/69_400x400_crop_center.jpg?v=1777812440'
    },
    {
      id: 'single-vanillicious',
      title: 'Vanillicious Extrait De Parfum',
      notes: 'Sweet Vanilla · Amber · Spicy Oud',
      desc: 'Comforting yet bold and mysterious. Rich caramelized vanilla matching with dark amber notes and a hint of exotic, spicy oud. A deep gourmand attraction.',
      price: '₹849',
      originalPrice: '₹1,499',
      img: 'https://scentgames.in/cdn/shop/files/62_400x400_crop_center.jpg?v=1777812438'
    },
    {
      id: 'single-what-if',
      title: 'What If Extrait De Parfum',
      notes: 'Earthy Sandalwood · Cedar · Dark Amber',
      desc: 'Deep, mysterious woodcraft. Creamy sandalwood paired with dry cedarwood and a warm amber glow. A sophisticated, long-lasting aroma for night events.',
      price: '₹849',
      originalPrice: '₹1,499',
      img: 'https://scentgames.in/cdn/shop/files/41_400x400_crop_center.jpg?v=1777812439'
    },
    {
      id: 'single-solid-perfume',
      title: 'Solid Perfume Collection',
      notes: 'Warm Beeswax · Subdued Musk · Citrus',
      desc: 'An intimate, travel-friendly solid balm. Concentrated fragrance oil in a skin-nourishing wax base. Designed to project close to the skin for personal comfort.',
      price: '₹499',
      originalPrice: '₹999',
      img: 'https://scentgames.in/cdn/shop/files/2_86bc3cbd-1ece-49d7-a30e-6081ee94cf53.jpg?v=1773328886&width=1500'
    }
  ];

  function showStep(step) {
    quizSteps.forEach(el => {
      const stepNum = parseInt(el.dataset.step, 10);
      if (stepNum === step) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    if (quizResult) quizResult.style.display = 'none';

    // Update progress bar
    if (quizProgressFill && quizStepCount && quizStepPercent) {
      const totalSteps = 4;
      const pct = Math.round((step / totalSteps) * 100);
      quizProgressFill.style.width = `${pct}%`;
      quizStepCount.textContent = `Step ${step} of ${totalSteps}`;
      quizStepPercent.textContent = `${pct}% Complete`;
    }
  }

  function handleOptionClick(step, value) {
    if (step === 1) quizAnswers.gender = value;
    if (step === 2) quizAnswers.vibe = value;
    if (step === 3) quizAnswers.occasion = value;
    if (step === 4) {
      quizAnswers.intensity = value;
      calculateMatch();
      return;
    }

    currentStep = step + 1;
    showStep(currentStep);
  }

  function calculateMatch() {
    let matchedProduct = null;

    // Matchmaking Logic
    if (quizAnswers.intensity === 'subtle') {
      matchedProduct = quizProducts.find(p => p.id === 'single-solid-perfume');
    } else if (quizAnswers.gender === 'him') {
      if (quizAnswers.vibe === 'fresh') {
        matchedProduct = quizProducts.find(p => p.id === 'single-rich-af');
      } else {
        matchedProduct = quizProducts.find(p => p.id === 'single-what-if');
      }
    } else if (quizAnswers.gender === 'her') {
      if (quizAnswers.vibe === 'fresh' || quizAnswers.vibe === 'woody') {
        matchedProduct = quizProducts.find(p => p.id === 'single-lush-muse');
      } else {
        matchedProduct = quizProducts.find(p => p.id === 'single-vanillicious');
      }
    } else { // unisex / everyone
      if (quizAnswers.vibe === 'fresh') {
        matchedProduct = quizProducts.find(p => p.id === 'single-blue-drip');
      } else {
        matchedProduct = quizProducts.find(p => p.id === 'single-rouge-fantasy');
      }
    }

    // Default fallback if logic has gaps
    if (!matchedProduct) {
      matchedProduct = quizProducts[0];
    }

    // Populate recommendation
    const imgEl = document.getElementById('quiz-match-img');
    const titleEl = document.getElementById('quiz-match-title');
    const notesEl = document.getElementById('quiz-match-notes');
    const descEl = document.getElementById('quiz-match-desc');
    const priceEl = document.getElementById('quiz-match-price');
    const origPriceEl = document.getElementById('quiz-match-original');

    if (imgEl) imgEl.src = matchedProduct.img;
    if (titleEl) titleEl.textContent = matchedProduct.title;
    if (notesEl) notesEl.textContent = `Notes: ${matchedProduct.notes}`;
    if (descEl) descEl.textContent = matchedProduct.desc;
    if (priceEl) priceEl.textContent = matchedProduct.price;
    if (origPriceEl) origPriceEl.textContent = matchedProduct.originalPrice;

    // Attach dataset to add-to-bag button
    if (quizAddBtn) {
      quizAddBtn.dataset.id = matchedProduct.id;
      quizAddBtn.dataset.title = matchedProduct.title;
      quizAddBtn.dataset.price = matchedProduct.price.replace('₹', '');
      quizAddBtn.dataset.img = matchedProduct.img;
    }

    // Show result page
    quizSteps.forEach(el => el.classList.remove('active'));
    if (quizResult) quizResult.style.display = 'block';

    // Update progress indicator to 100%
    if (quizProgressFill && quizStepCount && quizStepPercent) {
      quizProgressFill.style.width = '100%';
      quizStepCount.textContent = 'Recommendation Ready!';
      quizStepPercent.textContent = '100% Complete';
    }
  }

  // Hook Choice Option clicks
  quizSteps.forEach(stepEl => {
    const stepNum = parseInt(stepEl.dataset.step, 10);
    const options = stepEl.querySelectorAll('.quiz-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const value = opt.dataset.value;
        handleOptionClick(stepNum, value);
      });
    });
  });

  // Hook Back Buttons
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // Hook Retake Quiz Button
  if (quizRetakeBtn) {
    quizRetakeBtn.addEventListener('click', () => {
      currentStep = 1;
      quizAnswers.gender = '';
      quizAnswers.vibe = '';
      quizAnswers.occasion = '';
      quizAnswers.intensity = '';
      showStep(1);
    });
  }

  // Hook Quiz Add to Cart Button
  if (quizAddBtn) {
    quizAddBtn.addEventListener('click', () => {
      const id = quizAddBtn.dataset.id;
      const title = quizAddBtn.dataset.title;
      const price = parseInt(quizAddBtn.dataset.price, 10);
      const img = quizAddBtn.dataset.img;

      if (id && title && price && img) {
        const item = {
          id: id,
          title: title,
          price: price,
          quantity: 1,
          img: img
        };
        addToCart(item);
      }
    });
  }
  window.addToCart = addToCart;
  window.toggleCart = toggleCart;

  /* ── SHIPPING DELIVERY CALCULATOR ALGORITHM ───────────────────────────── */

  // Helper to format dates consistently (e.g. "Tue, Jun 16")
  function formatEstimatedDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  }

  // Get shipping dispatch date and delivery dates based on min/max business days
  function calculateDeliveryDates(minBizDays, maxBizDays) {
    const now = new Date();
    let shipDate = new Date(now);
    
    // Check for cutoff of 2 PM (14:00)
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 is Sunday, 6 is Saturday
    
    let isDispatchedToday = false;
    
    if (currentDay === 0) {
      // Sunday: Dispatched on Monday
      shipDate.setDate(now.getDate() + 1);
    } else {
      if (currentHour < 14) {
        // Before 2 PM: Dispatched today
        isDispatchedToday = true;
      } else {
        // After 2 PM: Dispatched tomorrow (or Monday if tomorrow is Sunday)
        if (currentDay === 6) {
          // Saturday after 2 PM -> Monday
          shipDate.setDate(now.getDate() + 2);
        } else {
          shipDate.setDate(now.getDate() + 1);
        }
      }
    }
    
    // Helper to add N business days (skipping Sundays)
    function addBusinessDays(startDate, n) {
      let resultDate = new Date(startDate);
      let added = 0;
      while (added < n) {
        resultDate.setDate(resultDate.getDate() + 1);
        if (resultDate.getDay() !== 0) { // Skip Sunday
          added++;
        }
      }
      return resultDate;
    }
    
    const minDelivery = addBusinessDays(shipDate, minBizDays);
    const maxDelivery = addBusinessDays(shipDate, maxBizDays);
    
    let dispatchText = 'Ships tomorrow';
    if (isDispatchedToday) {
      dispatchText = 'Ships today';
    } else if (currentDay === 6 || currentDay === 0) {
      dispatchText = 'Ships Monday';
    }

    return {
      dispatchText: dispatchText,
      minDateStr: formatEstimatedDate(minDelivery),
      maxDateStr: formatEstimatedDate(maxDelivery)
    };
  }

  // Map 6-digit Pincode to Distance tier & business days
  function getDistanceDetails(pincode) {
    if (!/^\d{6}$/.test(pincode)) {
      return null;
    }
    
    if (pincode.startsWith('208')) {
      return {
        tier: 'Local Zone (< 50 km from Kanpur)',
        minDays: 1,
        maxDays: 2,
        badgeClass: 'local-badge',
        approxDist: 'approx. 10–25 km'
      };
    } else if (pincode.startsWith('1') || pincode.startsWith('2') || pincode.startsWith('8')) {
      return {
        tier: 'Short-Distance Zone (50 - 600 km)',
        minDays: 2,
        maxDays: 3,
        badgeClass: 'near-badge',
        approxDist: 'approx. 150–500 km'
      };
    } else if (pincode.startsWith('3') || pincode.startsWith('4')) {
      return {
        tier: 'Medium-Distance Zone (600 - 1200 km)',
        minDays: 3,
        maxDays: 5,
        badgeClass: 'medium-badge',
        approxDist: 'approx. 800–1100 km'
      };
    } else {
      return {
        tier: 'Long-Distance Zone (> 1200 km)',
        minDays: 5,
        maxDays: 7,
        badgeClass: 'far-badge',
        approxDist: 'approx. 1300–1800 km'
      };
    }
  }

  // Initialize static/default elements on load
  function initDefaultDeliveryEstimates() {
    // Standard national estimate is 3-7 business days
    const standardEst = calculateDeliveryDates(3, 7);
    
    // Update bundle builder modals
    const perksHer = document.getElementById('sg-bundle__perks-her');
    const perksHim = document.getElementById('sg-bundle__perks-him');
    const displayRangeStr = `${standardEst.minDateStr} – ${standardEst.maxDateStr}`;
    
    if (perksHer) {
      perksHer.innerHTML = `Free delivery · Est. Delivery: <strong>${displayRangeStr}</strong>`;
    }
    if (perksHim) {
      perksHim.innerHTML = `Free delivery · Est. Delivery: <strong>${displayRangeStr}</strong>`;
    }
    
    // Update Shipping Policy Modal
    const policyEst = document.getElementById('policy-delivery-est');
    if (policyEst) {
      policyEst.innerHTML = `<span style="font-weight: normal; color: var(--color-text-muted);">(Estimated delivery for an order placed now: <strong>${displayRangeStr}</strong>)</span>`;
    }
  }

  // Bind the Pincode checker event listeners
  function initPincodeChecker() {
    const pinBtn = document.getElementById('cart-pincode-btn');
    const pinInput = document.getElementById('cart-pincode-input');
    const pinResult = document.getElementById('cart-pincode-result');
    
    if (!pinBtn || !pinInput || !pinResult) return;
    
    pinBtn.addEventListener('click', performPincodeCheck);
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performPincodeCheck();
      }
    });
    
    function performPincodeCheck() {
      const pincode = pinInput.value.trim();
      
      if (!/^\d{6}$/.test(pincode)) {
        pinResult.className = 'pincode-result-box error';
        pinResult.innerHTML = '⚠️ Please enter a valid 6-digit Indian pincode.';
        pinResult.style.display = 'block';
        return;
      }
      
      const details = getDistanceDetails(pincode);
      if (!details) {
        pinResult.className = 'pincode-result-box error';
        pinResult.innerHTML = '⚠️ Pincode zone classification failed. Try again.';
        pinResult.style.display = 'block';
        return;
      }
      
      const est = calculateDeliveryDates(details.minDays, details.maxDays);
      
      pinResult.className = 'pincode-result-box success';
      pinResult.innerHTML = `
        <div>📅 Est. Delivery: <strong>${est.minDateStr} – ${est.maxDateStr}</strong></div>
      `;
      pinResult.style.display = 'block';
    }
  }

  // Run on load
  initDefaultDeliveryEstimates();
  initPincodeChecker();

});

/* ── SHIPPING POLICY MODAL ───────────────────────────────────────────── */
function openShippingModal(e) {
  if (e) e.preventDefault();
  const overlay = document.getElementById('shipping-modal-overlay');
  const modal = document.getElementById('shipping-modal');
  if (!overlay || !modal) return;
  overlay.style.display = 'block';
  modal.style.display = 'block';
  // Trigger transition on next frame
  requestAnimationFrame(() => {
    overlay.classList.add('active');
    modal.classList.add('active');
  });
  document.body.style.overflow = 'hidden';
}

function closeShippingModal() {
  const overlay = document.getElementById('shipping-modal-overlay');
  const modal = document.getElementById('shipping-modal');
  if (!overlay || !modal) return;
  overlay.classList.remove('active');
  modal.classList.remove('active');
  setTimeout(() => {
    overlay.style.display = 'none';
    modal.style.display = 'none';
  }, 300);
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeShippingModal();
});
