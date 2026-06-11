document.addEventListener('DOMContentLoaded', () => {

  /* ── MEDIA GALLERY INTERACTIVE SWITCHING ────────────────────────────── */
  const thumbnailButtons = document.querySelectorAll('.thumbnail-btn');
  const mainImage = document.getElementById('gallery-main-img');
  const mainVideo = document.getElementById('gallery-main-video');
  const previewContainer = document.getElementById('gallery-preview-container');

  if (thumbnailButtons.length > 0 && mainImage && mainVideo) {
    thumbnailButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active class on thumbnails
        thumbnailButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mediaType = btn.dataset.mediaType;
        const src = btn.dataset.src;

        if (mediaType === 'image') {
          // Hide video, show image
          mainVideo.pause();
          mainVideo.style.display = 'none';
          mainVideo.src = '';
          
          mainImage.src = src;
          mainImage.style.display = 'block';
        } else if (mediaType === 'video') {
          // Hide image, show video
          mainImage.style.display = 'none';
          
          mainVideo.src = src;
          mainVideo.style.display = 'block';
          mainVideo.load();
          mainVideo.play().catch(err => {
            console.log('Video play failed or interrupted:', err);
          });
        }
      });
    });
  }

  /* ── QUANTITY SELECTORS HARMONIZATION ───────────────────────────────── */
  const mainQtyValue = document.getElementById('qty-value');
  const mainQtyDec = document.getElementById('qty-dec');
  const mainQtyInc = document.getElementById('qty-inc');

  const stickyQtyValue = document.getElementById('sticky-qty-value');
  const stickyQtyDec = document.getElementById('sticky-qty-dec');
  const stickyQtyInc = document.getElementById('sticky-qty-inc');

  let currentQty = 1;

  function updateQuantities(newQty) {
    if (newQty < 1) newQty = 1;
    currentQty = newQty;
    
    if (mainQtyValue) mainQtyValue.textContent = currentQty;
    if (stickyQtyValue) stickyQtyValue.textContent = currentQty;
  }

  if (mainQtyDec) {
    mainQtyDec.addEventListener('click', () => {
      updateQuantities(currentQty - 1);
    });
  }
  if (mainQtyInc) {
    mainQtyInc.addEventListener('click', () => {
      updateQuantities(currentQty + 1);
    });
  }

  if (stickyQtyDec) {
    stickyQtyDec.addEventListener('click', () => {
      updateQuantities(currentQty - 1);
    });
  }
  if (stickyQtyInc) {
    stickyQtyInc.addEventListener('click', () => {
      updateQuantities(currentQty + 1);
    });
  }

  /* ── DELIVERY PINCODE CHECKER ───────────────────────────────────────── */
  const pincodeInput = document.getElementById('pincode-input');
  const pincodeBtn = document.getElementById('pincode-btn');
  const pincodeMessage = document.getElementById('pincode-message');

  if (pincodeBtn && pincodeInput && pincodeMessage) {
    pincodeBtn.addEventListener('click', () => {
      const pin = pincodeInput.value.trim();
      
      // Basic 6 digit validation
      if (/^\d{6}$/.test(pin)) {
        pincodeMessage.className = 'pincode-feedback success';
        
        // Custom delivery date logic (4 days from today)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 4);
        
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const formattedDate = deliveryDate.toLocaleDateString('en-US', options);

        pincodeMessage.innerHTML = `
          <span class="material-symbols-outlined" style="font-size: 1.4rem; vertical-align: middle; margin-right: 4px;">check_circle</span>
          Delivery available! Guaranteed delivery by <strong>${formattedDate}</strong>.
        `;
      } else {
        pincodeMessage.className = 'pincode-feedback error';
        pincodeMessage.innerHTML = `
          <span class="material-symbols-outlined" style="font-size: 1.4rem; vertical-align: middle; margin-right: 4px;">error</span>
          Please enter a valid 6-digit postal code.
        `;
      }
    });

    // Accept Enter key in pincode input
    pincodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        pincodeBtn.click();
      }
    });
  }

  /* ── ACCORDIONS INTERACTION ─────────────────────────────────────────── */
  const accordionItems = document.querySelectorAll('.product-accordion-item');

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Toggle active status
        if (isActive) {
          item.classList.remove('active');
          trigger.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });

      // Initial active state set max-height
      if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    }
  });

  /* ── FAQ INTERACTIVE ACCORDIONS ─────────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const answer = item.querySelector('.faq-answer');

    if (trigger && answer) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  /* ── STICKY BOTTOM BUY BAR VISIBILITY ───────────────────────────────── */
  const stickyBottomBar = document.getElementById('sticky-bottom-bar');
  const mainCtaBtn = document.getElementById('main-add-to-bag');

  if (stickyBottomBar && mainCtaBtn) {
    window.addEventListener('scroll', () => {
      const triggerPoint = mainCtaBtn.getBoundingClientRect().bottom + window.scrollY;
      
      if (window.scrollY > triggerPoint) {
        stickyBottomBar.classList.add('active');
      } else {
        stickyBottomBar.classList.remove('active');
      }
    });
  }

  /* ── ADD TO BAG ACTION BINDING ──────────────────────────────────────── */
  const mainAddBtn = document.getElementById('main-add-to-bag');
  const stickyAddBtn = document.getElementById('sticky-add-to-bag');

  function triggerAddToBag(e) {
    if (typeof window.addToCart !== 'function') {
      console.error('addToCart is not exposed on window');
      alert('Error adding item to cart. Please try again.');
      return;
    }

    const btn = e.currentTarget;
    const id = btn.dataset.id;
    const title = btn.dataset.title;
    const price = parseInt(btn.dataset.price, 10);
    const img = btn.dataset.img;

    const item = {
      id: id,
      title: title,
      price: price,
      quantity: currentQty,
      img: img
    };

    window.addToCart(item);
  }

  if (mainAddBtn) {
    mainAddBtn.addEventListener('click', triggerAddToBag);
  }

  if (stickyAddBtn) {
    stickyAddBtn.addEventListener('click', triggerAddToBag);
  }

});
