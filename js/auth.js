/**
 * CrimeIntel AI - Law Enforcement & Citizen Authentication System
 */

import {
  DATA,
  loadData,
  findUserByEmail,
  findUserByPhone,
  findUserAccount,
  registerNewUser,
  addAccountToActiveSessions,
  persist
} from './data.js';

let authInitialized = false;

// Phone SVG Icon
const PHONE_ICON_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
`;

// Mail SVG Icon
const MAIL_ICON_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
`;

export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 16) return false;
  return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{5,18}$/.test(trimmed);
}

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function showAuthError(msg) {
  const errorBox = document.getElementById('auth-error-msg');
  const successBox = document.getElementById('auth-success-msg');
  if (successBox) {
    successBox.style.display = 'none';
    successBox.textContent = '';
  }
  if (errorBox) {
    errorBox.textContent = msg;
    errorBox.style.display = 'flex';
    errorBox.classList.remove('shake-anim');
    void errorBox.offsetWidth;
    errorBox.classList.add('shake-anim');
  }
}

export function showAuthSuccess(msg) {
  const errorBox = document.getElementById('auth-error-msg');
  const successBox = document.getElementById('auth-success-msg');
  if (errorBox) {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }
  if (successBox) {
    successBox.textContent = msg;
    successBox.style.display = 'flex';
    successBox.classList.remove('pulse-anim');
    void successBox.offsetWidth;
    successBox.classList.add('pulse-anim');
  }
}

export function clearAuthMessages() {
  const errorBox = document.getElementById('auth-error-msg');
  const successBox = document.getElementById('auth-success-msg');
  if (errorBox) {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }
  if (successBox) {
    successBox.style.display = 'none';
    successBox.textContent = '';
  }
}

export function resetLoginForm() {
  clearAuthMessages();
  const identInput = document.getElementById('login-identifier');
  const pwdInput = document.getElementById('login-password');
  const roleSelect = document.getElementById('login-role');
  const submitBtn = document.getElementById('login-submit-btn');

  if (identInput) identInput.value = '';
  if (pwdInput) pwdInput.value = '';
  if (roleSelect) {
    roleSelect.value = 'Police Officer';
    updateLoginRoleUI('Police Officer');
  }
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>SIGN IN</span>';
  }
}

export function resetRegisterForm() {
  clearAuthMessages();
  const regRole = document.getElementById('reg-role');
  const nameInput = document.getElementById('reg-fullname');
  const phoneInput = document.getElementById('reg-phone');
  const emailInput = document.getElementById('reg-email');
  const pwdInput = document.getElementById('reg-password');
  const confPwdInput = document.getElementById('reg-confirm-password');
  const deptInput = document.getElementById('reg-police-dept');
  const badgeInput = document.getElementById('reg-police-id');
  const submitBtn = document.getElementById('reg-submit-btn');

  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (emailInput) emailInput.value = '';
  if (pwdInput) pwdInput.value = '';
  if (confPwdInput) confPwdInput.value = '';
  if (deptInput) deptInput.value = '';
  if (badgeInput) badgeInput.value = '';
  if (regRole) {
    regRole.value = '';
    updateRegisterRoleUI('');
  }
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>CREATE ACCOUNT</span>';
  }
}

export function setAuthMode(mode) {
  clearAuthMessages();
  const signinPanel = document.getElementById('signin-panel');
  const registerPanel = document.getElementById('register-panel');
  
  // Ensure submit buttons are restored from any prior loading state
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  if (loginSubmitBtn) {
    loginSubmitBtn.disabled = false;
    loginSubmitBtn.innerHTML = '<span>SIGN IN</span>';
  }
  const regSubmitBtn = document.getElementById('reg-submit-btn');
  if (regSubmitBtn) {
    regSubmitBtn.disabled = false;
    regSubmitBtn.innerHTML = '<span>CREATE ACCOUNT</span>';
  }

  if (mode === 'register') {
    if (signinPanel) signinPanel.style.display = 'none';
    if (registerPanel) {
      registerPanel.style.display = 'block';
      registerPanel.classList.add('fade-in');
      const regRole = document.getElementById('reg-role');
      updateRegisterRoleUI(regRole ? regRole.value : '');
    }
  } else {
    if (registerPanel) registerPanel.style.display = 'none';
    if (signinPanel) {
      signinPanel.style.display = 'block';
      signinPanel.classList.add('fade-in');
      const loginRole = document.getElementById('login-role');
      updateLoginRoleUI(loginRole ? loginRole.value : '');
    }
  }
}

export function updateLoginRoleUI(role) {
  const labelEl = document.getElementById('login-identifier-label');
  const inputEl = document.getElementById('login-identifier');
  const iconEl = document.getElementById('login-identifier-icon');

  if (!inputEl) return;

  if (role === 'Citizen') {
    if (labelEl) labelEl.textContent = 'Phone Number';
    inputEl.placeholder = 'Enter your phone number';
    inputEl.type = 'tel';
    inputEl.autocomplete = 'tel';
    if (iconEl) iconEl.innerHTML = PHONE_ICON_SVG;
  } else if (role === 'Police Officer') {
    if (labelEl) labelEl.textContent = 'Email Address';
    inputEl.placeholder = 'Enter your official email address';
    inputEl.type = 'email';
    inputEl.autocomplete = 'email';
    if (iconEl) iconEl.innerHTML = MAIL_ICON_SVG;
  } else {
    if (labelEl) labelEl.textContent = 'Identifier';
    inputEl.placeholder = 'Select your role first';
    inputEl.type = 'text';
    inputEl.autocomplete = 'username';
    if (iconEl) iconEl.innerHTML = MAIL_ICON_SVG;
  }
}

export function updateRegisterRoleUI(role) {
  const dynamicFields = document.getElementById('reg-dynamic-fields');
  const rolePrompt = document.getElementById('reg-role-prompt');
  const emailGroup = document.getElementById('reg-email-group');
  const emailInput = document.getElementById('reg-email');

  if (!role || (role !== 'Citizen' && role !== 'Police Officer')) {
    if (dynamicFields) dynamicFields.style.display = 'none';
    if (rolePrompt) rolePrompt.style.display = 'block';
    if (emailGroup) emailGroup.style.display = 'none';
    if (emailInput) {
      emailInput.required = false;
      emailInput.value = '';
    }
    return;
  }

  // A valid role is chosen
  if (rolePrompt) rolePrompt.style.display = 'none';
  if (dynamicFields) {
    dynamicFields.style.display = 'block';
    dynamicFields.classList.add('fade-in');
  }

  if (role === 'Citizen') {
    if (emailGroup) emailGroup.style.display = 'none';
    if (emailInput) {
      emailInput.required = false;
      emailInput.value = '';
    }
  } else if (role === 'Police Officer') {
    if (emailGroup) {
      emailGroup.style.display = 'block';
      emailGroup.classList.add('fade-in');
    }
    if (emailInput) {
      emailInput.required = true;
    }
  }
}

export async function handleLogin(e, onLoginSuccess) {
  if (e) e.preventDefault();
  clearAuthMessages();

  const roleEl = document.getElementById('login-role');
  const identEl = document.getElementById('login-identifier');
  const passEl = document.getElementById('login-password');
  const submitBtn = document.getElementById('login-submit-btn');

  const role = roleEl ? roleEl.value.trim() : '';
  const identifier = identEl ? identEl.value.trim() : '';
  const password = passEl ? passEl.value : '';

  if (!role) {
    showAuthError('Please select your user role before signing in.');
    if (roleEl) roleEl.focus();
    return false;
  }

  if (role !== 'Citizen' && role !== 'Police Officer') {
    showAuthError('Please select a valid role (Citizen or Police Officer).');
    if (roleEl) roleEl.focus();
    return false;
  }

  if (!identifier) {
    if (role === 'Citizen') {
      showAuthError('Please enter your phone number.');
    } else {
      showAuthError('Please enter your official email address.');
    }
    if (identEl) identEl.focus();
    return false;
  }

  if (!password) {
    showAuthError('Please enter your password.');
    if (passEl) passEl.focus();
    return false;
  }

  // Visual loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="btn-spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round" />
      </svg>
      <span>AUTHENTICATING...</span>
    `;
  }

  try {
    if (!DATA) await loadData();

    // Authenticate user against registered storage
    const user = findUserAccount({ role, identifier });

    if (!user) {
      setTimeout(() => {
        if (role === 'Citizen') {
          showAuthError('Citizen account not found for this phone number. Please create an account.');
        } else {
          showAuthError('Police Officer account not found for this email address. Please create an account.');
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>SIGN IN</span>';
        }
      }, 350);
      return false;
    }

    // Verify password matches
    if (user.password !== password) {
      setTimeout(() => {
        showAuthError(
          role === 'Citizen'
            ? 'Invalid phone number or password. Please try again.'
            : 'Invalid email address or password. Please try again.'
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>SIGN IN</span>';
        }
      }, 350);
      return false;
    }

    // Successful login
    setTimeout(async () => {
      // Set active user details
      DATA.meta.analyst = user.fullName || user.name;
      DATA.meta.role = user.role;
      DATA.meta.phone = user.phone || '';
      DATA.meta.email = user.email || '';
      DATA.meta.org = user.role === 'Citizen'
        ? 'CrimeIntel — Citizen Public Portal'
        : 'Metro PD — Intelligence & Analysis Unit';

      // Record in active logged-in multi-sessions
      addAccountToActiveSessions(user);

      try {
        sessionStorage.setItem('crimeintel_session', JSON.stringify({
          analyst: DATA.meta.analyst,
          role: DATA.meta.role,
          phone: DATA.meta.phone,
          email: DATA.meta.email,
          org: DATA.meta.org
        }));
      } catch (err) {
        console.warn('Session storage write error', err);
      }

      await persist();

      // Smooth exit transition
      const loginScreen = document.getElementById('login-screen');
      if (loginScreen) {
        loginScreen.style.opacity = '0';
        loginScreen.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        loginScreen.style.transform = 'scale(0.98)';
        setTimeout(() => {
          loginScreen.style.display = 'none';
        }, 400);
      }

      const app = document.getElementById('app');
      if (app) {
        app.style.display = '';
        app.classList.add('visible');
      }

      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }
    }, 400);

  } catch (err) {
    console.error('Authentication error', err);
    showAuthError('An unexpected authentication error occurred. Please retry.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>SIGN IN</span>';
    }
  }

  return false;
}

export async function handleRegister(e) {
  if (e) e.preventDefault();
  clearAuthMessages();

  const roleEl = document.getElementById('reg-role');
  const nameEl = document.getElementById('reg-name');
  const phoneEl = document.getElementById('reg-phone');
  const emailEl = document.getElementById('reg-email');
  const passEl = document.getElementById('reg-password');
  const confirmPassEl = document.getElementById('reg-confirm-password');
  const submitBtn = document.getElementById('reg-submit-btn');

  const role = roleEl ? roleEl.value.trim() : '';
  const fullName = nameEl ? nameEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const password = passEl ? passEl.value : '';
  const confirmPassword = confirmPassEl ? confirmPassEl.value : '';

  // 1. Role Validation
  if (!role) {
    showAuthError('Please select your role before registering.');
    if (roleEl) roleEl.focus();
    return false;
  }

  if (role !== 'Citizen' && role !== 'Police Officer') {
    showAuthError('Please select a valid role (Citizen or Police Officer).');
    if (roleEl) roleEl.focus();
    return false;
  }

  // 2. Full Name Validation
  if (!fullName || fullName.length < 2) {
    showAuthError('Please enter your full name (minimum 2 characters).');
    if (nameEl) nameEl.focus();
    return false;
  }

  // 3. Phone Number Validation
  if (!phone) {
    showAuthError('Please enter your phone number.');
    if (phoneEl) phoneEl.focus();
    return false;
  }

  if (!isValidPhone(phone)) {
    showAuthError('Please enter a valid phone number (e.g. +1 555-123-4567 or 10 digits).');
    if (phoneEl) phoneEl.focus();
    return false;
  }

  // 4. Role-Specific Email Validation (ONLY for Police Officer)
  if (role === 'Police Officer') {
    if (!email) {
      showAuthError('Please enter your official email address.');
      if (emailEl) emailEl.focus();
      return false;
    }
    if (!isValidEmail(email)) {
      showAuthError('Please enter a valid official email address (e.g. officer@police.dept.gov).');
      if (emailEl) emailEl.focus();
      return false;
    }
  }

  // 5. Password Validation
  if (!password) {
    showAuthError('Please create your password.');
    if (passEl) passEl.focus();
    return false;
  }

  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters long.');
    if (passEl) passEl.focus();
    return false;
  }

  // 6. Confirm Password Validation
  if (!confirmPassword) {
    showAuthError('Please confirm your password.');
    if (confirmPassEl) confirmPassEl.focus();
    return false;
  }

  if (password !== confirmPassword) {
    showAuthError('Passwords do not match. Please verify your password.');
    if (confirmPassEl) confirmPassEl.focus();
    return false;
  }

  // 7. Duplicate Check
  if (!DATA) await loadData();
  
  if (role === 'Citizen') {
    const existingPhone = findUserByPhone(phone);
    if (existingPhone && existingPhone.role === 'Citizen') {
      showAuthError('An account with this phone number already exists. Please sign in.');
      return false;
    }
  } else if (role === 'Police Officer') {
    const existingEmail = findUserByEmail(email);
    if (existingEmail && existingEmail.role === 'Police Officer') {
      showAuthError('An officer account with this email address already exists. Please sign in.');
      return false;
    }
  }

  // Submit button loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="btn-spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round" />
      </svg>
      <span>CREATING ACCOUNT...</span>
    `;
  }

  try {
    // Save user according to exact structure requirements
    await registerNewUser({
      role,
      fullName,
      phone,
      email: role === 'Police Officer' ? email : undefined,
      password
    });

    setTimeout(() => {
      // Clear registration form fields
      if (nameEl) nameEl.value = '';
      if (phoneEl) phoneEl.value = '';
      if (emailEl) emailEl.value = '';
      if (passEl) passEl.value = '';
      if (confirmPassEl) confirmPassEl.value = '';
      if (roleEl) roleEl.value = '';
      updateRegisterRoleUI('');

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>CREATE ACCOUNT</span>';
      }

      // Automatically return to Sign In form
      setAuthMode('signin');

      // Pre-set login role & identifier for convenient sign-in
      const loginRole = document.getElementById('login-role');
      const loginIdent = document.getElementById('login-identifier');
      if (loginRole) {
        loginRole.value = role;
        updateLoginRoleUI(role);
      }
      if (loginIdent) {
        loginIdent.value = role === 'Citizen' ? phone : email;
      }

      // Show exact success message required: "Account created successfully. Please sign in."
      showAuthSuccess('Account created successfully. Please sign in.');
    }, 450);

  } catch (err) {
    console.error('Registration error', err);
    showAuthError('Failed to register account. Please try again.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>CREATE ACCOUNT</span>';
    }
  }

  return false;
}

export function togglePasswordVisibility(inputId, buttonEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  if (buttonEl) {
    if (isPassword) {
      buttonEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
      buttonEl.setAttribute('title', 'Hide password');
    } else {
      buttonEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
      buttonEl.setAttribute('title', 'Show password');
    }
  }
}

export function handleSsoClick() {
  showAuthError('Government SSO integration is not configured in this demo.');
}

export function handleForgotPasswordClick() {
  showAuthSuccess('Password recovery request logged. Please contact your system administrator.');
}

export function initAuth(onLoginSuccess) {
  if (authInitialized) return;
  authInitialized = true;

  // Pre-load data so user accounts are ready
  loadData();

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => handleLogin(e, onLoginSuccess));
  }

  const loginRole = document.getElementById('login-role');
  if (loginRole) {
    loginRole.addEventListener('change', e => {
      // Clear inputs when role is switched
      const identInput = document.getElementById('login-identifier');
      const pwdInput = document.getElementById('login-password');
      if (identInput) identInput.value = '';
      if (pwdInput) pwdInput.value = '';
      clearAuthMessages();
      updateLoginRoleUI(e.target.value);
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => handleRegister(e));
  }

  const regRole = document.getElementById('reg-role');
  if (regRole) {
    regRole.addEventListener('change', e => {
      // Clear inputs when reg role is switched
      const nameInput = document.getElementById('reg-fullname');
      const phoneInput = document.getElementById('reg-phone');
      const emailInput = document.getElementById('reg-email');
      const pwdInput = document.getElementById('reg-password');
      const confPwdInput = document.getElementById('reg-confirm-password');
      const deptInput = document.getElementById('reg-police-dept');
      const badgeInput = document.getElementById('reg-police-id');
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
      if (emailInput) emailInput.value = '';
      if (pwdInput) pwdInput.value = '';
      if (confPwdInput) confPwdInput.value = '';
      if (deptInput) deptInput.value = '';
      if (badgeInput) badgeInput.value = '';
      clearAuthMessages();
      updateRegisterRoleUI(e.target.value);
    });
  }

  const switchToRegBtn = document.getElementById('switch-to-register');
  if (switchToRegBtn) {
    switchToRegBtn.addEventListener('click', e => {
      e.preventDefault();
      resetRegisterForm();
      setAuthMode('register');
    });
  }

  const switchToSignBtn = document.getElementById('switch-to-signin');
  if (switchToSignBtn) {
    switchToSignBtn.addEventListener('click', e => {
      e.preventDefault();
      resetLoginForm();
      setAuthMode('signin');
    });
  }

  const ssoBtn = document.getElementById('sso-login-btn');
  if (ssoBtn) {
    ssoBtn.addEventListener('click', e => {
      e.preventDefault();
      handleSsoClick();
    });
  }

  const forgotLink = document.getElementById('forgot-password-link');
  if (forgotLink) {
    forgotLink.addEventListener('click', e => {
      e.preventDefault();
      handleForgotPasswordClick();
    });
  }

  // Password visibility toggle buttons (delegated listener)
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-toggle-password]');
    if (btn) {
      e.preventDefault();
      const targetInputId = btn.dataset.togglePassword;
      togglePasswordVisibility(targetInputId, btn);
    }
  });

  // Initial role state checks
  if (loginRole) updateLoginRoleUI(loginRole.value);
  if (regRole) updateRegisterRoleUI(regRole.value);

  // Expose global methods
  window.setAuthMode = setAuthMode;
  window.togglePasswordVisibility = togglePasswordVisibility;
  window.handleSsoClick = handleSsoClick;
  window.handleForgotPasswordClick = handleForgotPasswordClick;
  window.updateLoginRoleUI = updateLoginRoleUI;
  window.updateRegisterRoleUI = updateRegisterRoleUI;
  window.resetLoginForm = resetLoginForm;
  window.resetRegisterForm = resetRegisterForm;
  window.initializeAuth = initAuth;
}

export const initializeAuth = initAuth;

