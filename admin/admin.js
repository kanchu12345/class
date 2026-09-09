/**
 * Suresh Senanayake Physics Classes — Admin Panel Controller
 * Pure Vanilla JavaScript:
 *  - GitHub REST API v3 Integration (Contents API)
 *  - UTF-8 Safe Unicode Base64 Encoding & Decoding
 *  - ImgBB API File Upload for Class Photos
 *  - Client-side Session Security (Token never committed)
 */

(() => {
  'use strict';

  // State
  let githubToken = '';
  let repoOwner = 'kanchu12345';
  let repoName = 'class';
  let repoBranch = 'main';
  let contentFilePath = 'data/content.json';
  let imgbbApiKey = '580db6f671331120289dba6d8ec108c2';

  let currentSha = null;
  let currentContent = null;
  let hasUnsavedChanges = false;
  let editingClassIndex = -1;

  // DOM Elements
  const authWrapper = document.getElementById('authWrapper');
  const adminContainer = document.getElementById('adminContainer');
  const floatingSaveBar = document.getElementById('floatingSaveBar');
  const adminToast = document.getElementById('adminToast');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const headerRepoInfo = document.getElementById('headerRepoInfo');

  // UTF-8 Safe Base64 Encoding and Decoding for Sinhala Script
  function unicodeBtoa(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function unicodeAtob(base64Str) {
    const cleanStr = base64Str.replace(/[\r\n\s]/g, '');
    const binary = atob(cleanStr);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  }

  // Toast Notification
  function showToast(title, message, type = 'info') {
    if (!adminToast) return;
    adminToast.className = `admin-toast ${type}`;
    adminToast.innerHTML = `
      <h4>${escapeHtml(title)}</h4>
      <p>${message}</p>
    `;
    adminToast.style.display = 'block';

    setTimeout(() => {
      adminToast.style.display = 'none';
    }, 6000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function markUnsaved(changed = true) {
    hasUnsavedChanges = changed;
    const statusDot = document.getElementById('saveStatusDot');
    const statusText = document.getElementById('saveStatusText');
    const saveBtn = document.getElementById('saveAllBtn');

    if (hasUnsavedChanges) {
      if (statusDot) statusDot.className = 'status-dot unsaved';
      if (statusText) statusText.textContent = 'Unsaved draft changes';
      if (saveBtn) saveBtn.classList.remove('btn-secondary');
      if (saveBtn) saveBtn.classList.add('btn-amber');
    } else {
      if (statusDot) statusDot.className = 'status-dot';
      if (statusText) statusText.textContent = 'All changes synced with GitHub';
    }
  }

  // --------------------------------------------------------------------------
  // 1. AUTHENTICATION & INITIALIZATION
  // --------------------------------------------------------------------------
  function checkExistingSession() {
    githubToken = sessionStorage.getItem('ss_gh_token') || localStorage.getItem('ss_gh_token') || '';
    repoOwner = localStorage.getItem('ss_repo_owner') || 'kanchu12345';
    repoName = localStorage.getItem('ss_repo_name') || 'class';
    repoBranch = localStorage.getItem('ss_repo_branch') || 'main';
    imgbbApiKey = localStorage.getItem('ss_imgbb_key') || '580db6f671331120289dba6d8ec108c2';

    // Populate login form if elements exist
    const ownerInp = document.getElementById('repoOwnerInput');
    const repoInp = document.getElementById('repoNameInput');
    const imgbbInp = document.getElementById('imgbbKeyInput');
    const settingsImgbb = document.getElementById('settingsImgbbKey');
    const tokenInp = document.getElementById('ghTokenInput');

    if (tokenInp && githubToken) tokenInp.value = githubToken;
    if (ownerInp) ownerInp.value = repoOwner;
    if (repoInp) repoInp.value = repoName;
    if (imgbbInp) imgbbInp.value = imgbbApiKey;
    if (settingsImgbb) settingsImgbb.value = imgbbApiKey;

    if (githubToken) {
      showDashboard();
      fetchContentFromGitHub();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    if (authWrapper) authWrapper.style.display = 'block';
    if (adminContainer) adminContainer.style.display = 'none';
    if (floatingSaveBar) floatingSaveBar.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (headerRepoInfo) headerRepoInfo.textContent = '';
  }

  function showDashboard() {
    if (authWrapper) authWrapper.style.display = 'none';
    if (adminContainer) adminContainer.style.display = 'block';
    if (floatingSaveBar) floatingSaveBar.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (headerRepoInfo) headerRepoInfo.textContent = `${repoOwner}/${repoName}`;
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const tokenInp = document.getElementById('ghTokenInput');
      const ownerInp = document.getElementById('repoOwnerInput');
      const repoInp = document.getElementById('repoNameInput');
      const imgbbInp = document.getElementById('imgbbKeyInput');
      const rememberCheckbox = document.getElementById('rememberTokenCheckbox');

      const token = tokenInp?.value.trim();
      const owner = ownerInp?.value.trim() || 'kanchu12345';
      const repo = repoInp?.value.trim() || 'class';
      const imgbb = imgbbInp?.value.trim() || '580db6f671331120289dba6d8ec108c2';

      if (!token) {
        alert('Please enter your GitHub Personal Access Token.');
        return;
      }

      githubToken = token;
      repoOwner = owner;
      repoName = repo;
      imgbbApiKey = imgbb;

      // Store in browser session & local storage if checked
      sessionStorage.setItem('ss_gh_token', token);
      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('ss_gh_token', token);
      } else {
        localStorage.removeItem('ss_gh_token');
      }
      localStorage.setItem('ss_repo_owner', owner);
      localStorage.setItem('ss_repo_name', repo);
      if (imgbb) localStorage.setItem('ss_imgbb_key', imgbb);

      showDashboard();
      fetchContentFromGitHub();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (hasUnsavedChanges && !confirm('You have unsaved changes. Logging out will discard them. Continue?')) {
        return;
      }
      sessionStorage.removeItem('ss_gh_token');
      localStorage.removeItem('ss_gh_token');
      githubToken = '';
      currentContent = null;
      currentSha = null;
      hasUnsavedChanges = false;
      showLogin();
      showToast('Logged Out', 'Your session token has been cleared from browser memory.', 'info');
    });
  }

  // --------------------------------------------------------------------------
  // 2. GITHUB REST API INTEGRATION
  // --------------------------------------------------------------------------
  async function fetchContentFromGitHub() {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.style.display = 'block';

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${contentFilePath}?ref=${repoBranch}`;

    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json'
        }
      });

      if (res.status === 200) {
        const data = await res.json();
        currentSha = data.sha;
        const jsonText = unicodeAtob(data.content);
        currentContent = JSON.parse(jsonText);
        populateFormsWithContent(currentContent);
        renderClassesList(currentContent.classes);
        markUnsaved(false);
        showToast('Connected', `Successfully loaded content from GitHub (${repoOwner}/${repoName}).`, 'success');
      } else if (res.status === 404) {
        // First-time setup: data/content.json doesn't exist yet on GitHub
        // Fetch local content.json as starting template
        const fallbackRes = await fetch('../data/content.json');
        if (fallbackRes.ok) {
          currentContent = await fallbackRes.json();
          currentSha = null; // file will be created on first save
          populateFormsWithContent(currentContent);
          renderClassesList(currentContent.classes);
          markUnsaved(true);
          showToast('Template Loaded', 'data/content.json is ready to be committed to your repository.', 'info');
        }
      } else if (res.status === 401 || res.status === 403) {
        throw new Error('Authentication failed. Please verify your token has "Contents: Read and write" permission for this repository.');
      } else {
        const err = await res.json();
        throw new Error(err.message || `GitHub API error: ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Connection Error', err.message, 'error');
      if (err.message.includes('Authentication failed')) {
        showLogin();
      }
    } finally {
      if (loader) loader.style.display = 'none';
    }
  }

  async function saveContentToGitHub() {
    if (!currentContent) return;
    const saveBtn = document.getElementById('saveAllBtn');
    const origText = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '⏳ Committing to GitHub...';
    }

    try {
      // Gather latest inputs from forms
      collectContentFromForms();

      const jsonString = JSON.stringify(currentContent, null, 2);
      const base64Content = unicodeBtoa(jsonString);

      const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${contentFilePath}`;
      const payload = {
        message: 'Update website content via Admin Panel [skip ci]',
        content: base64Content,
        branch: repoBranch
      };

      if (currentSha) {
        payload.sha = currentSha;
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Failed to commit (HTTP ${res.status})`);
      }

      const result = await res.json();
      currentSha = result.content.sha;
      markUnsaved(false);

      const commitUrl = `https://github.com/${repoOwner}/${repoName}/commit/${result.commit.sha}`;
      showToast(
        'Published Successfully! 🚀',
        `Changes committed (<a href="${commitUrl}" target="_blank" style="color:var(--admin-brand-blue);text-decoration:underline;">view commit</a>). GitHub Pages will redeploy your live site automatically in 1–2 minutes.`,
        'success'
      );
    } catch (err) {
      console.error('Save error:', err);
      showToast('Save Failed', err.message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origText;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. IMGBB API IMAGE UPLOADER
  // --------------------------------------------------------------------------
  async function uploadImageToImgBB(file) {
    const activeKey = imgbbApiKey || localStorage.getItem('ss_imgbb_key') || '580db6f671331120289dba6d8ec108c2';
    if (!activeKey) {
      alert('Please enter your ImgBB API Key in the Settings tab or on the upload prompt to enable automatic image hosting.');
      return null;
    }

    const formData = new FormData();
    formData.append('image', file);

    const uploadStatus = document.getElementById('imageUploadStatus');
    if (uploadStatus) uploadStatus.textContent = '⏳ Uploading to ImgBB...';

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${activeKey}`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'ImgBB upload failed');
      }

      const hostedUrl = data.data.display_url || data.data.url;
      if (uploadStatus) uploadStatus.textContent = '✅ Image uploaded successfully!';
      return hostedUrl;
    } catch (err) {
      console.error(err);
      alert(`ImgBB Error: ${err.message}`);
      if (uploadStatus) uploadStatus.textContent = '❌ Upload failed';
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // 4. TAB NAVIGATION
  // --------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
    });
  });

  // --------------------------------------------------------------------------
  // 5. CLASSES MANAGEMENT (CRUD)
  // --------------------------------------------------------------------------
  const classesListContainer = document.getElementById('classesListContainer');
  const classModal = document.getElementById('classModal');
  const classForm = document.getElementById('classForm');
  const addClassBtn = document.getElementById('addClassBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const classImageFile = document.getElementById('classImageFile');
  const classImageUrlInput = document.getElementById('classImageUrlInput');
  const classImagePreview = document.getElementById('classImagePreview');
  const previewImgTag = document.getElementById('previewImgTag');
  const removeImageBtn = document.getElementById('removeImageBtn');

  function renderClassesList(classes) {
    if (!classesListContainer) return;
    classesListContainer.innerHTML = '';

    const countBadge = document.getElementById('classesCountBadge');
    if (countBadge) countBadge.textContent = classes ? classes.length : 0;

    if (!classes || classes.length === 0) {
      classesListContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: #fff; border-radius: var(--radius-md); border: 1px dashed var(--admin-border);">
          <p style="color: var(--admin-text-muted); margin-bottom: 12px;">No classes added yet.</p>
          <button type="button" class="btn btn-primary" onclick="document.getElementById('addClassBtn').click()">+ Add First Class</button>
        </div>
      `;
      return;
    }

    classes.forEach((c, index) => {
      const card = document.createElement('div');
      card.className = 'admin-class-card';

      const thumbHtml = c.image ? `
        <img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.title_en)}" class="admin-class-img-thumb">
      ` : '';

      const badgeHtml = c.badge ? `<span class="badge-featured">${escapeHtml(c.badge)}</span>` : '';

      card.innerHTML = `
        ${thumbHtml}
        <div class="admin-class-meta">
          <span class="badge-tag">${escapeHtml(c.tag || 'Class')}</span>
          ${badgeHtml}
          <span style="font-size:0.75rem; color:var(--admin-text-muted);">${escapeHtml(c.medium_en || '')}</span>
        </div>
        <h4 class="admin-class-title">${escapeHtml(c.title_en || 'Untitled Class')}</h4>
        <div class="admin-class-title-si">${escapeHtml(c.title_si || '')}</div>
        <p class="admin-class-desc">${escapeHtml(c.desc_en || '')}</p>
        <div class="admin-class-schedule">
          🗓️ ${escapeHtml(c.schedule_en || c.schedule || 'Schedule TBD')}
        </div>
        <div class="admin-class-actions">
          <div style="display: flex; gap: 6px; width: 100%; margin-bottom: 6px;">
            <button type="button" class="btn btn-secondary btn-move-up" data-index="${index}" title="Move Up" style="flex: 1; padding: 5px 8px; font-size: 0.78rem;" ${index === 0 ? 'disabled style="flex:1; padding:5px 8px; font-size:0.78rem; opacity:0.35; cursor:not-allowed;"' : ''}>⬆️ Up</button>
            <button type="button" class="btn btn-secondary btn-move-down" data-index="${index}" title="Move Down" style="flex: 1; padding: 5px 8px; font-size: 0.78rem;" ${index === classes.length - 1 ? 'disabled style="flex:1; padding:5px 8px; font-size:0.78rem; opacity:0.35; cursor:not-allowed;"' : ''}>⬇️ Down</button>
          </div>
          <button type="button" class="btn btn-secondary btn-edit-class" data-index="${index}">✏️ Edit</button>
          <button type="button" class="btn btn-danger btn-delete-class" data-index="${index}">🗑️ Delete</button>
        </div>
      `;
      classesListContainer.appendChild(card);
    });

    // Attach Action Listeners
    classesListContainer.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (idx > 0 && currentContent && currentContent.classes) {
          const temp = currentContent.classes[idx];
          currentContent.classes[idx] = currentContent.classes[idx - 1];
          currentContent.classes[idx - 1] = temp;
          renderClassesList(currentContent.classes);
          markUnsaved(true);
          showToast('Order Updated', 'Class order rearranged. Click "Commit & Publish" to save.', 'info');
        }
      });
    });

    classesListContainer.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (currentContent && currentContent.classes && idx < currentContent.classes.length - 1) {
          const temp = currentContent.classes[idx];
          currentContent.classes[idx] = currentContent.classes[idx + 1];
          currentContent.classes[idx + 1] = temp;
          renderClassesList(currentContent.classes);
          markUnsaved(true);
          showToast('Order Updated', 'Class order rearranged. Click "Commit & Publish" to save.', 'info');
        }
      });
    });

    classesListContainer.querySelectorAll('.btn-edit-class').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        openClassModal(idx);
      });
    });

    classesListContainer.querySelectorAll('.btn-delete-class').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        deleteClass(idx);
      });
    });
  }

  function openClassModal(index = -1) {
    editingClassIndex = index;
    const modalTitle = document.getElementById('classModalTitle');

    if (index >= 0 && currentContent.classes[index]) {
      const c = currentContent.classes[index];
      if (modalTitle) modalTitle.textContent = 'Edit Class Entry';

      document.getElementById('c_title_en').value = c.title_en || '';
      document.getElementById('c_title_si').value = c.title_si || '';
      document.getElementById('c_medium_en').value = c.medium_en || 'Sinhala & English Medium';
      document.getElementById('c_medium_si').value = c.medium_si || 'සිංහල හා ඉංග්‍රීසි මාධ්‍ය';
      document.getElementById('c_tag').value = c.tag || 'A/L Course';
      document.getElementById('c_tagClass').value = c.tagClass || 'tag-al';
      document.getElementById('c_badge').value = c.badge || '';
      document.getElementById('c_schedule_en').value = c.schedule_en || c.schedule || '';
      document.getElementById('c_schedule_si').value = c.schedule_si || '';
      document.getElementById('c_venue').value = c.venue || 'Gampaha Institute';
      document.getElementById('c_desc_en').value = c.desc_en || '';
      document.getElementById('c_desc_si').value = c.desc_si || '';
      document.getElementById('classImageUrlInput').value = c.image || '';

      // Format features array as newline text
      const featLines = Array.isArray(c.features) ? c.features.map(f => typeof f === 'object' ? `${f.en} | ${f.si || f.en}` : f).join('\n') : '';
      document.getElementById('c_features').value = featLines;

      // Image preview
      if (c.image) {
        previewImgTag.src = c.image;
        classImagePreview.style.display = 'flex';
      } else {
        classImagePreview.style.display = 'none';
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'Add New Class Entry';
      classForm.reset();
      classImagePreview.style.display = 'none';
      document.getElementById('classImageUrlInput').value = '';
    }

    if (classModal) classModal.classList.add('open');
  }

  function closeClassModal() {
    if (classModal) classModal.classList.remove('open');
    editingClassIndex = -1;
  }

  function deleteClass(index) {
    if (!currentContent || !currentContent.classes) return;
    const c = currentContent.classes[index];
    const name = c ? c.title_en : 'this class';

    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      currentContent.classes.splice(index, 1);
      renderClassesList(currentContent.classes);
      markUnsaved(true);
      showToast('Class Deleted', `"${name}" removed from draft.`, 'info');
    }
  }

  // Handle Class Image Upload to ImgBB
  if (classImageFile) {
    classImageFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB. Please choose a smaller image.');
        return;
      }

      const hostedUrl = await uploadImageToImgBB(file);
      if (hostedUrl) {
        classImageUrlInput.value = hostedUrl;
        previewImgTag.src = hostedUrl;
        classImagePreview.style.display = 'flex';
      }
    });
  }

  if (classImageUrlInput) {
    classImageUrlInput.addEventListener('input', () => {
      const url = classImageUrlInput.value.trim();
      if (url) {
        previewImgTag.src = url;
        classImagePreview.style.display = 'flex';
      } else {
        classImagePreview.style.display = 'none';
      }
    });
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
      classImageUrlInput.value = '';
      if (classImageFile) classImageFile.value = '';
      classImagePreview.style.display = 'none';
    });
  }

  if (classForm) {
    classForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const titleEn = document.getElementById('c_title_en').value.trim();
      const titleSi = document.getElementById('c_title_si').value.trim();
      if (!titleEn) {
        alert('Please provide a class title in English.');
        return;
      }

      // Parse features lines
      const featText = document.getElementById('c_features').value.trim();
      const features = featText ? featText.split('\n').map(line => {
        const parts = line.split('|');
        if (parts.length > 1) {
          return { en: parts[0].trim(), si: parts[1].trim() };
        }
        return { en: line.trim(), si: line.trim() };
      }) : [];

      const classEntry = {
        id: editingClassIndex >= 0 ? currentContent.classes[editingClassIndex].id : `class-${Date.now()}`,
        tag: document.getElementById('c_tag').value.trim() || 'Course',
        tagClass: document.getElementById('c_tagClass').value.trim() || 'tag-al',
        badge: document.getElementById('c_badge').value.trim(),
        medium_en: document.getElementById('c_medium_en').value.trim(),
        medium_si: document.getElementById('c_medium_si').value.trim(),
        title_en: titleEn,
        title_si: titleSi || titleEn,
        desc_en: document.getElementById('c_desc_en').value.trim(),
        desc_si: document.getElementById('c_desc_si').value.trim() || document.getElementById('c_desc_en').value.trim(),
        features: features,
        venue: document.getElementById('c_venue').value.trim() || 'Gampaha Institute',
        schedule_en: document.getElementById('c_schedule_en').value.trim(),
        schedule_si: document.getElementById('c_schedule_si').value.trim() || document.getElementById('c_schedule_en').value.trim(),
        image: classImageUrlInput.value.trim()
      };

      if (!currentContent.classes) currentContent.classes = [];

      if (editingClassIndex >= 0) {
        currentContent.classes[editingClassIndex] = classEntry;
        showToast('Class Updated', `"${titleEn}" has been updated in draft.`, 'info');
      } else {
        currentContent.classes.push(classEntry);
        showToast('Class Added', `"${titleEn}" has been added to draft.`, 'info');
      }

      renderClassesList(currentContent.classes);
      markUnsaved(true);
      closeClassModal();
    });
  }

  if (addClassBtn) addClassBtn.addEventListener('click', () => openClassModal(-1));
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeClassModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeClassModal);

  // --------------------------------------------------------------------------
  // 6. SITE CONTENT FORM BINDING
  // --------------------------------------------------------------------------
  function populateFormsWithContent(data) {
    if (!data) return;

    // Hero
    if (data.hero) {
      setVal('h_badge_en', data.hero.badge_en);
      setVal('h_badge_si', data.hero.badge_si);
      setVal('h_headline_en', data.hero.headline_en);
      setVal('h_headline_si', data.hero.headline_si);
      setVal('h_subline_en', data.hero.subline_en);
      setVal('h_subline_si', data.hero.subline_si);
    }

    // About
    if (data.about) {
      setVal('a_kicker_en', data.about.kicker_en);
      setVal('a_kicker_si', data.about.kicker_si);
      setVal('a_title_en', data.about.title_en);
      setVal('a_title_si', data.about.title_si);
      setVal('a_subtitle_en', data.about.subtitle_en);
      setVal('a_subtitle_si', data.about.subtitle_si);
      setVal('a_teacher_degree_en', data.about.teacher_degree_en);
      setVal('a_teacher_degree_si', data.about.teacher_degree_si);
      setVal('a_p1_en', data.about.paragraph1_en);
      setVal('a_p1_si', data.about.paragraph1_si);
      setVal('a_p2_en', data.about.paragraph2_en);
      setVal('a_p2_si', data.about.paragraph2_si);
      setVal('a_phil_title_en', data.about.philosophy_title_en);
      setVal('a_phil_title_si', data.about.philosophy_title_si);
    }

    // Why Choose Us
    if (Array.isArray(data.why_choose_us)) {
      data.why_choose_us.forEach((w, i) => {
        const idx = i + 1;
        setVal(`why${idx}_title_en`, w.title_en);
        setVal(`why${idx}_title_si`, w.title_si);
        setVal(`why${idx}_desc_en`, w.desc_en);
        setVal(`why${idx}_desc_si`, w.desc_si);
      });
    }

    // Location
    if (data.location) {
      setVal('loc_name_en', data.location.institute_name_en);
      setVal('loc_name_si', data.location.institute_name_si);
      setVal('loc_town_en', data.location.town_en);
      setVal('loc_landmark_en', data.location.landmark_en);
      setVal('loc_facilities_en', data.location.facilities_en);
      setVal('loc_map_url', data.location.map_embed_url);
    }

    // Contact
    if (data.contact) {
      setVal('c_email', data.contact.email);
      setVal('c_phone', data.contact.phone);
      setVal('c_whatsapp', data.contact.whatsapp);
    }
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function collectContentFromForms() {
    if (!currentContent) currentContent = {};

    // Hero
    if (!currentContent.hero) currentContent.hero = {};
    currentContent.hero.badge_en = getVal('h_badge_en');
    currentContent.hero.badge_si = getVal('h_badge_si');
    currentContent.hero.headline_en = getVal('h_headline_en');
    currentContent.hero.headline_si = getVal('h_headline_si');
    currentContent.hero.subline_en = getVal('h_subline_en');
    currentContent.hero.subline_si = getVal('h_subline_si');

    // About
    if (!currentContent.about) currentContent.about = {};
    currentContent.about.kicker_en = getVal('a_kicker_en');
    currentContent.about.kicker_si = getVal('a_kicker_si');
    currentContent.about.title_en = getVal('a_title_en');
    currentContent.about.title_si = getVal('a_title_si');
    currentContent.about.subtitle_en = getVal('a_subtitle_en');
    currentContent.about.subtitle_si = getVal('a_subtitle_si');
    currentContent.about.teacher_degree_en = getVal('a_teacher_degree_en');
    currentContent.about.teacher_degree_si = getVal('a_teacher_degree_si');
    currentContent.about.paragraph1_en = getVal('a_p1_en');
    currentContent.about.paragraph1_si = getVal('a_p1_si');
    currentContent.about.paragraph2_en = getVal('a_p2_en');
    currentContent.about.paragraph2_si = getVal('a_p2_si');
    currentContent.about.philosophy_title_en = getVal('a_phil_title_en');
    currentContent.about.philosophy_title_si = getVal('a_phil_title_si');

    // Why Choose Us
    if (!currentContent.why_choose_us) currentContent.why_choose_us = [];
    for (let i = 1; i <= 4; i++) {
      const existing = currentContent.why_choose_us[i - 1] || { id: `why-${i}` };
      currentContent.why_choose_us[i - 1] = {
        id: existing.id || `why-${i}`,
        title_en: getVal(`why${i}_title_en`) || existing.title_en || '',
        title_si: getVal(`why${i}_title_si`) || existing.title_si || '',
        desc_en: getVal(`why${i}_desc_en`) || existing.desc_en || '',
        desc_si: getVal(`why${i}_desc_si`) || existing.desc_si || ''
      };
    }

    // Location
    if (!currentContent.location) currentContent.location = {};
    currentContent.location.institute_name_en = getVal('loc_name_en');
    currentContent.location.institute_name_si = getVal('loc_name_si');
    currentContent.location.town_en = getVal('loc_town_en');
    currentContent.location.landmark_en = getVal('loc_landmark_en');
    currentContent.location.facilities_en = getVal('loc_facilities_en');
    currentContent.location.map_embed_url = getVal('loc_map_url');

    // Contact
    if (!currentContent.contact) currentContent.contact = {};
    currentContent.contact.email = getVal('c_email');
    currentContent.contact.phone = getVal('c_phone');
    currentContent.contact.phone_raw = getVal('c_phone').replace(/\s+/g, '');
    currentContent.contact.whatsapp = getVal('c_whatsapp');
    currentContent.contact.whatsapp_raw = getVal('c_whatsapp').replace(/[^\d]/g, '');
  }

  // Listen to any input changes in site content tab to mark unsaved
  const siteContentForm = document.getElementById('siteContentForm');
  if (siteContentForm) {
    siteContentForm.addEventListener('input', () => {
      markUnsaved(true);
    });
  }

  // Settings tab save
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const key = document.getElementById('settingsImgbbKey')?.value.trim() || '';
      imgbbApiKey = key;
      localStorage.setItem('ss_imgbb_key', key);
      showToast('Settings Saved', 'ImgBB API key has been stored in your browser.', 'success');
    });
  }

  // Floating Save Bar Buttons
  const saveAllBtn = document.getElementById('saveAllBtn');
  const discardBtn = document.getElementById('discardChangesBtn');

  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', saveContentToGitHub);
  }

  if (discardBtn) {
    discardBtn.addEventListener('click', () => {
      if (confirm('Discard all unsaved draft changes and reload from GitHub?')) {
        fetchContentFromGitHub();
      }
    });
  }

  // Initialize
  checkExistingSession();

})();
