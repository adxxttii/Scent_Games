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
      cart[existingIndex].quantity += 1;
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

  // Expose close function globally so the builders can trigger it
  window.closeBundleModal = closeBundleModal;

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
