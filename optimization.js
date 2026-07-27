// ==========================================
// OPTIMIZATION MODULE v4.3
// Accessibility + Form Validation + Loading States + Performance
// ==========================================

// ===== 1. FORM VALIDATION & MASKING =====

const FormValidation = {
  // Input masking - CCCD (12 digits)
  maskCCCD: (input) => {
    let val = input.value.replace(/\D/g, '').slice(0, 12);
    input.value = val;
    input.dataset.valid = val.length === 12 ? 'true' : 'false';
    FormValidation.updateFieldStatus(input);
  },

  // Input masking - Phone (10 digits)
  maskPhone: (input) => {
    let val = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = val;
    input.dataset.valid = val.length === 10 ? 'true' : 'false';
    FormValidation.updateFieldStatus(input);
  },

  // Email validation
  validateEmail: (input) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = regex.test(input.value);
    input.dataset.valid = isValid ? 'true' : 'false';
    FormValidation.updateFieldStatus(input);
  },

  // Required field validation
  validateRequired: (input) => {
    const isValid = input.value.trim().length > 0;
    input.dataset.valid = isValid ? 'true' : 'false';
    FormValidation.updateFieldStatus(input);
  },

  // Update visual feedback
  updateFieldStatus: (input) => {
    const field = input.closest('.field');
    if (!field) return;

    const isValid = input.dataset.valid === 'true';
    const errorMsg = field.querySelector('.field-error');
    
    if (isValid) {
      input.classList.remove('field-error-input');
      input.classList.add('field-valid-input');
      if (errorMsg) errorMsg.style.display = 'none';
    } else if (input.value.trim()) {
      input.classList.remove('field-valid-input');
      input.classList.add('field-error-input');
      if (errorMsg) errorMsg.style.display = 'block';
    } else {
      input.classList.remove('field-valid-input', 'field-error-input');
      if (errorMsg) errorMsg.style.display = 'none';
    }
  },

  // Initialize all validations
  init: () => {
    document.addEventListener('input', (e) => {
      const input = e.target;
      const validate = input.dataset.validate;

      if (validate === 'cccd') FormValidation.maskCCCD(input);
      else if (validate === 'phone') FormValidation.maskPhone(input);
      else if (validate === 'email') FormValidation.validateEmail(input);
      else if (validate === 'required') FormValidation.validateRequired(input);
    });

    document.addEventListener('blur', (e) => {
      const input = e.target;
      if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
        FormValidation.updateFieldStatus(input);
      }
    }, true);
  }
};

// ===== 2. LOADING STATES & SKELETON LOADERS =====

const LoadingStates = {
  // Show skeleton loader
  showSkeleton: (element, count = 1) => {
    element.innerHTML = '';
    for (let i = 0; i < count; i++) {
      element.innerHTML += `
        <div class="skeleton-item">
          <div class="skeleton-line" style="width: 30%; margin-bottom: 8px;"></div>
          <div class="skeleton-line" style="width: 100%; margin-bottom: 8px;"></div>
          <div class="skeleton-line" style="width: 85%;"></div>
        </div>
      `;
    }
  },

  // Show loading spinner
  showSpinner: (element) => {
    element.innerHTML = `
      <div class="spinner-container">
        <div class="spinner"></div>
        <p class="spinner-text">Đang tải...</p>
      </div>
    `;
  },

  // Hide loading state
  hideSkeleton: (element) => {
    element.classList.remove('loading');
  }
};

// ===== 3. PERFORMANCE OPTIMIZATIONS =====

const Performance = {
  // Lazy load images
  initLazyLoading: () => {
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[loading="lazy"]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('loading');
            imageObserver.unobserve(img);
          }
        });
      });
      images.forEach(img => imageObserver.observe(img));
    }
  },

  // Debounce function for performance
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll events
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// ===== 4. ACCESSIBILITY ENHANCEMENTS =====

const A11y = {
  // Add ARIA labels to buttons
  initAriaLabels: () => {
    document.querySelectorAll('[data-aria-label]').forEach(el => {
      el.setAttribute('aria-label', el.dataset.ariaLabel);
    });
  },

  // Focus management
  manageFocus: (element) => {
    element.tabIndex = -1;
    element.focus();
  },

  // Announce to screen readers
  announce: (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => announcement.remove(), 3000);
  }
};

// ===== 5. INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
  FormValidation.init();
  A11y.initAriaLabels();
  Performance.initLazyLoading();
});

// Export for use
window.FormValidation = FormValidation;
window.LoadingStates = LoadingStates;
window.Performance = Performance;
window.A11y = A11y;
