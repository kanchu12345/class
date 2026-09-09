/**
 * Suresh Senanayake Physics Classes — Interactive JavaScript
 * Features:
 *  1. Bilingual Language Switcher (English / Sinhala) with localStorage memory
 *  2. Responsive Mobile Drawer Navigation
 *  3. Header Scroll Shadow & ScrollSpy Active Links
 *  4. Client-side Inquiry Form (mailto & WhatsApp generator)
 *  5. Dynamic Copyright Year
 */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. DYNAMIC COPYRIGHT YEAR
  // --------------------------------------------------------------------------
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------------------
  // 2. BILINGUAL LANGUAGE SWITCHER (EN <-> SI)
  // --------------------------------------------------------------------------
  const langToggleBtn = document.getElementById('langToggleBtn');
  const enOpt = langToggleBtn ? langToggleBtn.querySelector('.lang-en') : null;
  const siOpt = langToggleBtn ? langToggleBtn.querySelector('.lang-si') : null;
  
  // Check stored preference or default to English ('en')
  let currentLang = localStorage.getItem('suresh_physics_lang') || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('suresh_physics_lang', lang);

    // Toggle body typography class
    if (lang === 'si') {
      document.body.classList.add('lang-sinhala');
      document.documentElement.lang = 'si';
      if (enOpt) enOpt.classList.remove('active');
      if (siOpt) siOpt.classList.add('active');
    } else {
      document.body.classList.remove('lang-sinhala');
      document.documentElement.lang = 'en';
      if (enOpt) enOpt.classList.add('active');
      if (siOpt) siOpt.classList.remove('active');
    }

    // Update all elements with data-en & data-si attributes
    const translatableElements = document.querySelectorAll('[data-en][data-si]');
    translatableElements.forEach(el => {
      const translation = el.getAttribute(`data-${lang}`);
      if (translation) {
        // If element has text child nodes or is a button/span/p/h
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translation;
        } else {
          el.innerHTML = translation;
        }
      }
    });
  }

  // Initialize language on load
  applyLanguage(currentLang);

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const nextLang = currentLang === 'en' ? 'si' : 'en';
      applyLanguage(nextLang);
    });
  }

  // --------------------------------------------------------------------------
  // 3. MOBILE MENU TOGGLE
  // --------------------------------------------------------------------------
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const siteNav = document.getElementById('siteNav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileMenuToggle && siteNav) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
      siteNav.classList.toggle('open');
    });

    // Close mobile menu when a nav link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. HEADER SCROLL SHADOW & SCROLL-SPY ACTIVE LINKS
  // --------------------------------------------------------------------------
  const siteHeader = document.getElementById('siteHeader');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Header shadow
    if (window.scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // Scroll spy for navigation highlighting
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. INQUIRY FORM (EMAIL MAILTO + WHATSAPP GENERATION)
  // --------------------------------------------------------------------------
  const inquiryForm = document.getElementById('inquiryForm');
  const sendViaWhatsAppBtn = document.getElementById('sendViaWhatsAppBtn');
  const formSuccessMessage = document.getElementById('formSuccessMessage');

  function getFormData() {
    const name = document.getElementById('studentName')?.value.trim() || '';
    const phone = document.getElementById('contactNumber')?.value.trim() || '';
    const medium = document.getElementById('classMedium')?.value || '';
    const course = document.getElementById('courseType')?.value || '';
    const message = document.getElementById('userMessage')?.value.trim() || '';

    return { name, phone, medium, course, message };
  }

  function validateBasic(data) {
    if (!data.name) {
      alert(currentLang === 'si' ? 'කරුණාකර සිසුවාගේ නම ඇතුළත් කරන්න.' : 'Please enter your name.');
      document.getElementById('studentName')?.focus();
      return false;
    }
    if (!data.phone) {
      alert(currentLang === 'si' ? 'කරුණාකර දුරකථන අංකය ඇතුළත් කරන්න.' : 'Please enter your phone number.');
      document.getElementById('contactNumber')?.focus();
      return false;
    }
    if (!data.medium) {
      alert(currentLang === 'si' ? 'කරුණාකර මාධ්‍යය තෝරන්න.' : 'Please select your preferred medium.');
      document.getElementById('classMedium')?.focus();
      return false;
    }
    if (!data.course) {
      alert(currentLang === 'si' ? 'කරුණාකර පන්තිය තෝරන්න.' : 'Please select the class category.');
      document.getElementById('courseType')?.focus();
      return false;
    }
    return true;
  }

  // Handle Email Submission (mailto:)
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getFormData();
      if (!validateBasic(data)) return;

      const recipient = 'suresh.senanayake@gmail.com';
      const subject = encodeURIComponent(`Physics Class Inquiry - ${data.name} (${data.course})`);
      const body = encodeURIComponent(
        `Dear Mr. Suresh Senanayake,\n\n` +
        `I would like to inquire regarding your physics classes in Gampaha:\n\n` +
        `• Student/Parent Name: ${data.name}\n` +
        `• Contact Phone/WhatsApp: ${data.phone}\n` +
        `• Medium: ${data.medium}\n` +
        `• Class of Interest: ${data.course}\n` +
        `• Questions / Notes: ${data.message || 'N/A'}\n\n` +
        `Looking forward to your guidance.\nThank you.`
      );

      // Open user's default email client with pre-filled content
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

      // Display friendly UI feedback
      if (formSuccessMessage) {
        formSuccessMessage.style.display = 'block';
      }
    });
  }

  // Handle WhatsApp Quick Submission
  if (sendViaWhatsAppBtn) {
    sendViaWhatsAppBtn.addEventListener('click', () => {
      const data = getFormData();
      if (!validateBasic(data)) return;

      const waNumber = '94779170297';
      const text = encodeURIComponent(
        `Hello Mr. Suresh Senanayake,\n` +
        `I would like to inquire about your Physics Classes in Gampaha:\n\n` +
        `👤 Name: ${data.name}\n` +
        `📞 Phone: ${data.phone}\n` +
        `📚 Medium: ${data.medium}\n` +
        `🎯 Class: ${data.course}\n` +
        `💬 Note: ${data.message || 'Please let me know the class timetable and venue details.'}`
      );

      const waUrl = `https://wa.me/${waNumber}?text=${text}`;
      window.open(waUrl, '_blank');

      if (formSuccessMessage) {
        formSuccessMessage.style.display = 'block';
      }
    });
  }

});
