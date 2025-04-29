    accessibilityState.settings.fontSize = 'medium';
        accessibilityState.settings.lineSpacing = 'large';
        accessibilityState.settings.letterSpacing = 'medium';
        break;
      case 'adhd-friendly':
        accessibilityState.settings.readingMask = true;
        break;
    }
    
    accessibilityState.activeProfile = profileName;
    applySettings();
  }
  
  // Einstellung umschalten
  function toggleSetting(setting) {
    accessibilityState.settings[setting] = !accessibilityState.settings[setting];
    accessibilityState.activeProfile = null; // Aktives Profil zurücksetzen, wenn Einstellungen geändert werden
    applySettings();
  }
  
  // Einstellung aktualisieren
  function updateSetting(setting, value) {
    accessibilityState.settings[setting] = value;
    accessibilityState.activeProfile = null; // Aktives Profil zurücksetzen, wenn Einstellungen geändert werden
    applySettings();
  }
  
  // Einstellungen zurücksetzen
  function resetSettings() {
    accessibilityState = {
      settings: {...defaultSettings},
      activeProfile: null
    };
    applySettings();
    
    // UI-Elemente entfernen
    removeReadingGuide();
    removeReadingMask();
  }
  
  // Widget erstellen
  function createAccessibilityWidget() {
    // CSS hinzufügen
    const style = document.createElement('style');
    style.textContent = widgetStyles;
    document.head.appendChild(style);
    
    // Widget-Button erstellen
    const button = document.createElement('button');
    button.className = 'a11y-widget-button';
    button.setAttribute('aria-label', 'Barrierefreiheit-Widget öffnen');
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 18c-3.3 0-6-2.7-6-6"/><path d="M12 18c3.3 0 6-2.7 6-6"/><line x1="12" y1="12" x2="12" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
    
    // Panel erstellen
    const panel = document.createElement('div');
    panel.className = 'a11y-widget-panel';
    panel.innerHTML = `
      <div class="a11y-panel-header">
        <h2>Barrierefreiheit</h2>
        <button class="a11y-close-button" aria-label="Barrierefreiheit-Widget schließen">&times;</button>
      </div>
      
      <div class="a11y-section">
        <h3>Profile</h3>
        <button class="a11y-button profile" data-profile="seizure-safe">Epilepsie-sicher</button>
        <button class="a11y-button profile" data-profile="vision-impaired">Sehschwäche</button>
        <button class="a11y-button profile" data-profile="cognitive-disability">Kognitive Einschränkung</button>
        <button class="a11y-button profile" data-profile="adhd-friendly">ADHS-freundlich</button>
        <button class="a11y-button profile" data-reset="true">Zurücksetzen</button>
      </div>
      
      <div class="a11y-section">
        <h3>Anzeigeoptionen</h3>
        <div class="a11y-toggle">
          <input type="checkbox" id="a11y-dark-contrast">
          <label for="a11y-dark-contrast">Dunkler Kontrast</label>
        </div>
        <div class="a11y-toggle">
          <input type="checkbox" id="a11y-light-contrast">
          <label for="a11y-light-contrast">Heller Kontrast</label>
        </div>
        <div class="a11y-toggle">
          <input type="checkbox" id="a11y-monochrome">
          <label for="a11y-monochrome">Monochrom</label>
        </div>
        <div class="a11y-toggle">
          <input type="checkbox" id="a11y-high-saturation">
          <label for="a11y-high-saturation">Hohe Sättigung</label>
        </div>
      </div>
      
      <div class="a11y-section">
        <h3>Inhaltsskalierung</h3>
        <label class="a11y-select-label" for="a11y-font-size">Schriftgröße</label>
        <select class="a11y-select" id="a11y-font-size">
          <option value="normal">Normal</option>
          <option value="small">Klein</option>
          <option value="medium">Mittel</option>
          <option value="large">Groß</option>
          <option value="x-large">Extra Groß</option>
        </select>
        
        <label class="a11y-select-label" for="a11y-line-spacing">Zeilenabstand</label>
        <select class="a11y-select" id="a11y-line-spacing">
          <option value="normal">Normal</option>
          <option value="small">Klein</option>
          <option value="medium">Mittel</option>
          <option value="large">Groß</option>
        </select>
        
        <label class="a11y-select-label" for="a11y-letter-spacing">Buchstabenabstand</label>
        <select class="a11y-select" id="a11y-letter-spacing">
          <option value="normal">Normal</option>
          <option value="small">Klein</option>
          <option value="medium">Mittel</option>
          <option value="large">Groß</option>
        </select>
      </div>
      
      <div class="a11y-section">
        <h3>Navigationsassistenz</h3>
        <div class="a11y-toggle">
          <input type="checkbox" id="a11y-reading-guide">
          <label for="a11y-reading-guide">Lesehilfe</label>
        </div>
        <div class="a11y-toggle">
          <input type="checkbox" id="a11y-large-cursor">
          <label for="a11y-large-cursor">Großer Cursor</label>
        </div>
        <div class="a11y-toggle">
          <input type="checkbox" id="a11y-reading-mask">
          <label for="a11y-reading-mask">Lesemaske</label>
        </div>
      </div>
    `;
    
    // Zum Dokument hinzufügen
    document.body.appendChild(button);
    document.body.appendChild(panel);
    
    // Panel umschalten
    let isOpen = false;
    button.addEventListener('click', () => {
      isOpen = !isOpen;
      if (isOpen) {
        panel.classList.add('open');
      } else {
        panel.classList.remove('open');
      }
    });
    
    // Schließen-Button
    panel.querySelector('.a11y-close-button').addEventListener('click', () => {
      isOpen = false;
      panel.classList.remove('open');
    });
    
    // Profil-Buttons
    const profileButtons = panel.querySelectorAll('.a11y-button.profile');
    profileButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const reset = btn.hasAttribute('data-reset');
        if (reset) {
          resetSettings();
          updateUIState();
        } else {
          const profile = btn.getAttribute('data-profile');
          applyProfile(profile);
          updateUIState();
        }
      });
    });
    
    // Einstellungen umschalten
    panel.querySelector('#a11y-dark-contrast').addEventListener('change', e => {
      toggleSetting('darkContrast');
      updateUIState();
    });
    
    panel.querySelector('#a11y-light-contrast').addEventListener('change', e => {
      toggleSetting('lightContrast');
      updateUIState();
    });
    
    panel.querySelector('#a11y-monochrome').addEventListener('change', e => {
      toggleSetting('monochrome');
      updateUIState();
    });
    
    panel.querySelector('#a11y-high-saturation').addEventListener('change', e => {
      toggleSetting('highSaturation');
      updateUIState();
    });
    
    panel.querySelector('#a11y-reading-guide').addEventListener('change', e => {
      toggleSetting('readingGuide');
      updateUIState();
    });
    
    panel.querySelector('#a11y-large-cursor').addEventListener('change', e => {
      toggleSetting('largeCursor');
      updateUIState();
    });
    
    panel.querySelector('#a11y-reading-mask').addEventListener('change', e => {
      toggleSetting('readingMask');
      updateUIState();
    });
    
    // Auswahlelemente
    panel.querySelector('#a11y-font-size').addEventListener('change', e => {
      updateSetting('fontSize', e.target.value);
      updateUIState();
    });
    
    panel.querySelector('#a11y-line-spacing').addEventListener('change', e => {
      updateSetting('lineSpacing', e.target.value);
      updateUIState();
    });
    
    panel.querySelector('#a11y-letter-spacing').addEventListener('change', e => {
      updateSetting('letterSpacing', e.target.value);
      updateUIState();
    });
    
    // UI basierend auf aktuellen Einstellungen aktualisieren
    function updateUIState() {
      const { settings, activeProfile } = accessibilityState;
      
      // Checkboxen aktualisieren
      panel.querySelector('#a11y-dark-contrast').checked = settings.darkContrast;
      panel.querySelector('#a11y-light-contrast').checked = settings.lightContrast;
      panel.querySelector('#a11y-monochrome').checked = settings.monochrome;
      panel.querySelector('#a11y-high-saturation').checked = settings.highSaturation;
      panel.querySelector('#a11y-reading-guide').checked = settings.readingGuide;
      panel.querySelector('#a11y-large-cursor').checked = settings.largeCursor;
      panel.querySelector('#a11y-reading-mask').checked = settings.readingMask;
      
      // Dropdowns aktualisieren
      panel.querySelector('#a11y-font-size').value = settings.fontSize;
      panel.querySelector('#a11y-line-spacing').value = settings.lineSpacing;
      panel.querySelector('#a11y-letter-spacing').value = settings.letterSpacing;
      
      // Profil-Buttons aktualisieren
      profileButtons.forEach(btn => {
        const profile = btn.getAttribute('data-profile');
        if (profile && profile === activeProfile) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
    
    // Gespeicherte Einstellungen laden und UI aktualisieren
    loadSettings();
    applySettings();
    updateUIState();
  }
  
  // Initialisieren, wenn das DOM geladen ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAccessibilityWidget);
  } else {
    createAccessibilityWidget();
  }
  
  // API für Zugriff von außen
  window.accessibilityWidget = {
    toggleSetting,
    updateSetting,
    applyProfile,
    resetSettings
  };
})();
