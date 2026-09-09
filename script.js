/**
 * Suresh Senanayake Physics Classes — Interactive JavaScript
 * Features:
 *  1. Dynamic Content Hydration from data/content.json (Static CMS)
 *  2. Bilingual Language Switcher (English / Sinhala) with localStorage memory
 *  3. Responsive Mobile Drawer Navigation
 *  4. Header Scroll Shadow & ScrollSpy Active Links
 *  5. Client-side Inquiry Form (mailto & WhatsApp generator)
 *  6. Dynamic Copyright Year
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
      if (translation !== null && translation !== undefined) {
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
  // 3. DYNAMIC CONTENT HYDRATION FROM data/content.json (Static CMS)
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderDynamicClasses(classesList, container) {
    if (!container || !Array.isArray(classesList) || classesList.length === 0) return;
    container.innerHTML = '';

    classesList.forEach(c => {
      const isFeatured = c.badge && c.badge.trim() !== '';
      const card = document.createElement('article');
      card.className = `class-card ${isFeatured ? 'featured-card' : ''}`;

      let badgeHtml = '';
      if (c.badge && c.badge.trim() !== '') {
        badgeHtml = `<div class="class-card-badge" data-en="${escapeHtml(c.badge)}" data-si="${escapeHtml(c.badge)}">${escapeHtml(c.badge)}</div>`;
      }

      let imageHtml = '';
      if (c.image && c.image.trim() !== '') {
        imageHtml = `
          <div class="class-card-image-wrap">
            <img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.title_en || 'Class Image')}" class="class-card-img" loading="lazy">
          </div>
        `;
      }

      let featuresHtml = '';
      if (Array.isArray(c.features) && c.features.length > 0) {
        featuresHtml = c.features.map(f => {
          const en = typeof f === 'object' ? (f.en || '') : f;
          const si = typeof f === 'object' ? (f.si || f.en || '') : f;
          return `<li data-en="${escapeHtml(en)}" data-si="${escapeHtml(si)}">${escapeHtml(currentLang === 'si' ? si : en)}</li>`;
        }).join('');
      }

      const scheduleEn = c.schedule_en || c.schedule || '';
      const scheduleSi = c.schedule_si || scheduleEn;

      card.innerHTML = `
        ${badgeHtml}
        ${imageHtml}
        <div class="class-card-header">
          <span class="class-tag ${escapeHtml(c.tagClass || 'tag-al')}">${escapeHtml(c.tag || 'Course')}</span>
          <span class="class-medium-tag" data-en="${escapeHtml(c.medium_en || '')}" data-si="${escapeHtml(c.medium_si || c.medium_en || '')}">
            ${escapeHtml(currentLang === 'si' ? (c.medium_si || c.medium_en || '') : (c.medium_en || ''))}
          </span>
        </div>
        <h3 class="class-title" data-en="${escapeHtml(c.title_en || '')}" data-si="${escapeHtml(c.title_si || c.title_en || '')}">
          ${escapeHtml(currentLang === 'si' ? (c.title_si || c.title_en || '') : (c.title_en || ''))}
        </h3>
        <p class="class-desc" data-en="${escapeHtml(c.desc_en || '')}" data-si="${escapeHtml(c.desc_si || c.desc_en || '')}">
          ${escapeHtml(currentLang === 'si' ? (c.desc_si || c.desc_en || '') : (c.desc_en || ''))}
        </p>
        ${featuresHtml ? `<ul class="class-features">${featuresHtml}</ul>` : ''}
        ${scheduleEn ? `
        <div class="class-schedule-bar">
          <span>🗓️</span>
          <span data-en="${escapeHtml(scheduleEn)}" data-si="${escapeHtml(scheduleSi)}">
            ${escapeHtml(currentLang === 'si' ? scheduleSi : scheduleEn)}
          </span>
        </div>` : ''}
        <div class="class-footer">
          <span class="class-loc"><strong data-en="Venue:" data-si="ස්ථානය:">${currentLang === 'si' ? 'ස්ථානය:' : 'Venue:'}</strong> ${escapeHtml(c.venue || 'Gampaha Institute')}</span>
          <a href="#contact" class="class-enroll-btn" data-en="Inquire Batch Times →" data-si="වේලාවන් විමසන්න →">
            ${currentLang === 'si' ? 'වේලාවන් විමසන්න →' : 'Inquire Batch Times →'}
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  async function loadDynamicContent() {
    try {
      // Fetch with cache-busting timestamp so admin updates reflect immediately
      const res = await fetch(`data/content.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();

      // Update Hero Section
      if (data.hero) {
        const badge = document.querySelector('.hero-badge span:last-child');
        if (badge && data.hero.badge_en) {
          badge.setAttribute('data-en', data.hero.badge_en);
          badge.setAttribute('data-si', data.hero.badge_si || data.hero.badge_en);
        }
        const headline = document.querySelector('.hero-headline');
        if (headline && data.hero.headline_en) {
          headline.setAttribute('data-en', data.hero.headline_en);
          headline.setAttribute('data-si', data.hero.headline_si || data.hero.headline_en);
        }
        const subline = document.querySelector('.hero-subline');
        if (subline && data.hero.subline_en) {
          subline.setAttribute('data-en', data.hero.subline_en);
          subline.setAttribute('data-si', data.hero.subline_si || data.hero.subline_en);
        }
      }

      // Update About Section
      if (data.about) {
        const title = document.querySelector('.about-section .section-title');
        if (title && data.about.title_en) {
          title.setAttribute('data-en', data.about.title_en);
          title.setAttribute('data-si', data.about.title_si || data.about.title_en);
        }
        const subtitle = document.querySelector('.about-section .section-subtitle');
        if (subtitle && data.about.subtitle_en) {
          subtitle.setAttribute('data-en', data.about.subtitle_en);
          subtitle.setAttribute('data-si', data.about.subtitle_si || data.about.subtitle_en);
        }
        const teacherTitle = document.querySelector('.teacher-title');
        if (teacherTitle && data.about.teacher_degree_en) {
          teacherTitle.setAttribute('data-en', data.about.teacher_degree_en);
          teacherTitle.setAttribute('data-si', data.about.teacher_degree_si || data.about.teacher_degree_en);
        }
      }

      // Update Classes List Dynamically
      if (Array.isArray(data.classes) && data.classes.length > 0) {
        const classesGrid = document.querySelector('.classes-grid');
        if (classesGrid) {
          renderDynamicClasses(data.classes, classesGrid);
        }
      }

      // Update Location Map Iframe & Information
      if (data.location) {
        if (data.location.map_embed_url) {
          const mapIframe = document.querySelector('.map-iframe');
          if (mapIframe && mapIframe.src !== data.location.map_embed_url) {
            mapIframe.src = data.location.map_embed_url;
          }
        }
        if (data.location.institute_name_en) {
          const instName = document.querySelector('.institute-name');
          if (instName) {
            instName.setAttribute('data-en', data.location.institute_name_en);
            instName.setAttribute('data-si', data.location.institute_name_si || data.location.institute_name_en);
          }
        }
      }

      // Update Contact details
      if (data.contact) {
        const emailLink = document.querySelector('a[href^="mailto:"]');
        if (emailLink && data.contact.email) {
          emailLink.href = `mailto:${data.contact.email}`;
          const emailVal = emailLink.querySelector('.channel-val');
          if (emailVal) emailVal.textContent = data.contact.email;
        }
        const phoneLink = document.querySelector('a[href^="tel:"]');
        if (phoneLink && data.contact.phone) {
          phoneLink.href = `tel:${data.contact.phone_raw || data.contact.phone.replace(/\s+/g, '')}`;
          const phoneVal = phoneLink.querySelector('.channel-val');
          if (phoneVal) phoneVal.textContent = data.contact.phone;
        }
      }

      // Re-apply language to newly updated DOM elements
      applyLanguage(currentLang);
    } catch (err) {
      console.info('Public site operating in resilient static fallback mode.');
    }
  }

  // Hydrate content from JSON
  loadDynamicContent();

  // --------------------------------------------------------------------------
  // 4. MOBILE MENU TOGGLE
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
  // 5. HEADER SCROLL SHADOW & SCROLL-SPY ACTIVE LINKS
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
  // 6. INQUIRY FORM (EMAIL MAILTO + WHATSAPP GENERATION)
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
