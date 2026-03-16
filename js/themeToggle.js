  // Function to update the logo
  function updateLogo(theme) {
    const logo = document.querySelector('.logo');
    // get the existing logo src up to the last slash
    const logoLocation = logo.src.split('/').slice(0, -1).join('/');
    if (logo) {
      if (theme === 'dark') {
        logo.src = `${logoLocation}/logo-dark.png`;
      } else {
        logo.src = `${logoLocation}/logo.png`;
      }
    }
  }

// Function to set the theme
function setTheme(theme) {
    const themeToggleBtn = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    updateLogo(theme);
}

// Function to update the theme icon
function updateThemeIcon(theme) {
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = themeToggleBtn.querySelector('i');
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
    htmlElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    updateLogo(newTheme);
}

window.setTheme = setTheme;
window.toggleTheme = toggleTheme;