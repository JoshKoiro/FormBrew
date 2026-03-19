// Function to update the logo
function updateLogo(theme) {
  const logo = document.querySelector('.logo');
  if (!logo) return;

  // Use product config if available (preferred)
  if (window.productConfig && window.productConfig.logo && window.productConfig.logoDark) {
      logo.src = (theme === 'dark') ? window.productConfig.logoDark : window.productConfig.logo;
      return;
  }

  // Fallback: derive dark logo path from current src (legacy behavior)
  const currentSrc = logo.src;
  if (!currentSrc || currentSrc.endsWith('/')) return;
  const logoLocation = currentSrc.split('/').slice(0, -1).join('/');
  if (theme === 'dark') {
      logo.src = `${logoLocation}/logo-dark.png`;
  } else {
      logo.src = `${logoLocation}/logo.png`;
  }
}

// Function to set the theme
function setTheme(theme) {
  const htmlElement = document.documentElement;
  htmlElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeIcon(theme);
  updateLogo(theme);
}

// Function to update the theme icon
function updateThemeIcon(theme) {
  const themeToggleBtn = document.getElementById('themeToggle');
  if (!themeToggleBtn) return;
  const themeIcon = themeToggleBtn.querySelector('i');
  if (!themeIcon) return;
  if (theme === 'dark') {
      themeIcon.classList.remove('light_mode');
      themeIcon.classList.add('dark_mode');
      themeIcon.textContent = 'dark_mode';
  } else {
      themeIcon.classList.remove('dark_mode');
      themeIcon.classList.add('light_mode');
      themeIcon.textContent = 'light_mode';
  }
}

function toggleTheme() {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

window.setTheme = setTheme;
window.toggleTheme = toggleTheme;