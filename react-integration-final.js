(function() {
  // Konfiguration - ÄNDERN SIE DIESE URL ZU IHRER HOSTING-URL, WO DIE DATEIEN LIEGEN
  // Wichtig: Wenn Sie das Widget in Webflow integrieren, stellen Sie sicher, dass Sie 
  // hier die korrekte URL zu Ihrem 'improved-build' Ordner angeben
  const widgetBaseUrl = './improved-build/';  // Für lokales Testen
  
  // Überprüfen, ob wir bereits in einem iframe sind
  const isInIframe = window.self !== window.top;
  
  // Widget erstellen - entweder in-page oder im iframe, je nachdem, wo wir uns befinden
  function createWidgetIframe() {
    // Wenn wir bereits in einem iframe sind, verwenden wir keinen weiteren iframe
    if (isInIframe) {
      console.log('Widget läuft bereits in einem iframe, erstelle direkte Komponenten');
      createDirectWidgetComponents();
      return;
    }
    // Barrierefreiheit-Button erstellen
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Barrierefreiheit-Optionen öffnen');
    button.setAttribute('title', 'Barrierefreiheit-Optionen');
    button.className = 'a11y-widget-button';
    button.setAttribute('style', `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #0066ff;
      border: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `);
    
    // Icon für den Button erstellen
    const icon = document.createElement('div');
    icon.setAttribute('style', `
      width: 30px;
      height: 30px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.5-15c-.83 0-1.5.67-1.5 1.5S10.67 8 11.5 8 13 7.33 13 6.5 12.33 5 11.5 5zm-1 4.5v6H12v-2h1v2h1.5v-6h-4z'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    `);
    button.appendChild(icon);
    
    // Container für das iframe erstellen
    const iframeContainer = document.createElement('div');
    iframeContainer.setAttribute('style', `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 570px;
      z-index: 9998;
      overflow: hidden;
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform: translateY(20px);
      opacity: 0;
      pointer-events: none;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    `);
    iframeContainer.setAttribute('aria-hidden', 'true');
    
    // iframe erstellen und zur React-Anwendung verweisen
    const iframe = document.createElement('iframe');
    iframe.src = widgetBaseUrl + 'index.html';  // Auf die gebaute React-Anwendung verweisen
    iframe.setAttribute('title', 'Barrierefreiheit Optionen');
    iframe.setAttribute('style', `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
      background-color: white;
    `);
    iframeContainer.appendChild(iframe);
    
    // Elemente zur DOM hinzufügen
    document.body.appendChild(button);
    document.body.appendChild(iframeContainer);
    
    // Panel-Sichtbarkeit ein-/ausschalten
    let isOpen = false;
    
    button.addEventListener('click', function() {
      isOpen = !isOpen;
      if (isOpen) {
        iframeContainer.style.opacity = '1';
        iframeContainer.style.transform = 'translateY(0)';
        iframeContainer.style.pointerEvents = 'auto';
        iframeContainer.setAttribute('aria-hidden', 'false');
        button.setAttribute('aria-expanded', 'true');
      } else {
        iframeContainer.style.opacity = '0';
        iframeContainer.style.transform = 'translateY(20px)';
        iframeContainer.style.pointerEvents = 'none'; 
        iframeContainer.setAttribute('aria-hidden', 'true');
        button.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Kommunikation zwischen iframe und parent
    window.addEventListener('message', function(event) {
      // In Produktion: Origin validieren
      // if (event.origin !== expectedOrigin) return;
      
      const data = event.data;
      
      if (data.type === 'CLOSE_PANEL') {
        isOpen = false;
        iframeContainer.style.opacity = '0';
        iframeContainer.style.transform = 'translateY(20px)';
        iframeContainer.style.pointerEvents = 'none'; 
        iframeContainer.setAttribute('aria-hidden', 'true');
        button.setAttribute('aria-expanded', 'false');
      }
      
      if (data.type === 'TOGGLE_ACCESSIBILITY_PANEL') {
        // Umschalten des Panels, wenn die Anfrage von einem inneren iframe kommt
        isOpen = !isOpen;
        if (isOpen) {
          iframeContainer.style.opacity = '1';
          iframeContainer.style.transform = 'translateY(0)';
          iframeContainer.style.pointerEvents = 'auto';
          iframeContainer.setAttribute('aria-hidden', 'false');
          button.setAttribute('aria-expanded', 'true');
        } else {
          iframeContainer.style.opacity = '0';
          iframeContainer.style.transform = 'translateY(20px)';
          iframeContainer.style.pointerEvents = 'none'; 
          iframeContainer.setAttribute('aria-hidden', 'true');
          button.setAttribute('aria-expanded', 'false');
        }
      }
      
      if (data.type === 'APPLY_SETTINGS') {
        // Einstellungen auf die Hauptseite anwenden, nicht nur im Widget
        applyAccessibilitySettings(data.settings);
        
        // Debugging-Informationen
        console.log('Barrierefreiheit-Einstellungen werden auf Hauptseite angewendet:', data.settings);
        
        // Falls die Anfrage aus der URL bar kommt (statt aus dem iframe),
        // sollten wir nicht versuchen, die Einstellungen anzuwenden
        if (event.origin === 'null' || !event.origin) {
          console.warn('Origin ist unbekannt, Einstellungen werden nicht angewendet.');
          return;
        }
      }
    });
    
    // CSS-Stile für Barrierefreiheit erstellen
    function createAccessibilityStyles() {
      const styles = document.createElement('style');
      styles.id = 'a11y-styles';
      styles.textContent = `
        /* Reading guide */
        .a11y-reading-guide {
          position: fixed;
          left: 0;
          width: 100%;
          height: 30px;
          background: rgba(255, 255, 0, 0.2);
          pointer-events: none;
          z-index: 9998;
          display: none;
        }
        body.a11y-reading-guide-active .a11y-reading-guide {
          display: block;
        }
        
        /* Color modes */
        body.a11y-dark-contrast {
          filter: invert(1) hue-rotate(180deg);
          background: #000;
        }
        
        body.a11y-light-contrast {
          background: #fff;
          color: #000;
        }
        
        body.a11y-high-saturation {
          filter: saturate(200%);
        }
        
        body.a11y-monochrome {
          filter: grayscale(100%);
        }
        
        /* Cursor styles */
        body.a11y-large-cursor * {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M7 22l1.092-7L2 9l16.178 4.615L7 22z'/%3E%3C/svg%3E"), auto !important;
        }
        
        /* Font size adjustment */
        body.a11y-font-lg {
          font-size: 120% !important;
        }
        
        body.a11y-font-xl {
          font-size: 150% !important;
        }
        
        body.a11y-font-xxl {
          font-size: 200% !important;
        }
        
        /* Lines spacing */
        body.a11y-line-spacing-md p, 
        body.a11y-line-spacing-md h1, 
        body.a11y-line-spacing-md h2, 
        body.a11y-line-spacing-md h3, 
        body.a11y-line-spacing-md h4, 
        body.a11y-line-spacing-md h5, 
        body.a11y-line-spacing-md h6, 
        body.a11y-line-spacing-md li, 
        body.a11y-line-spacing-md span {
          line-height: 1.8 !important;
        }
        
        body.a11y-line-spacing-lg p, 
        body.a11y-line-spacing-lg h1, 
        body.a11y-line-spacing-lg h2, 
        body.a11y-line-spacing-lg h3, 
        body.a11y-line-spacing-lg h4, 
        body.a11y-line-spacing-lg h5, 
        body.a11y-line-spacing-lg h6, 
        body.a11y-line-spacing-lg li, 
        body.a11y-line-spacing-lg span {
          line-height: 2.2 !important;
        }
        
        /* Letter spacing */
        body.a11y-letter-spacing-md p, 
        body.a11y-letter-spacing-md h1, 
        body.a11y-letter-spacing-md h2, 
        body.a11y-letter-spacing-md h3, 
        body.a11y-letter-spacing-md h4, 
        body.a11y-letter-spacing-md h5, 
        body.a11y-letter-spacing-md h6, 
        body.a11y-letter-spacing-md li, 
        body.a11y-letter-spacing-md span {
          letter-spacing: 1px !important;
        }
        
        body.a11y-letter-spacing-lg p, 
        body.a11y-letter-spacing-lg h1, 
        body.a11y-letter-spacing-lg h2, 
        body.a11y-letter-spacing-lg h3, 
        body.a11y-letter-spacing-lg h4, 
        body.a11y-letter-spacing-lg h5, 
        body.a11y-letter-spacing-lg h6, 
        body.a11y-letter-spacing-lg li, 
        body.a11y-letter-spacing-lg span {
          letter-spacing: 2px !important;
        }
        
        /* Reading mask overlay */
        .reading-mask-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9997;
        }
      `;
      document.head.appendChild(styles);
    }
    
    // Leseführung erstellen
    function createReadingGuide() {
      const guide = document.createElement('div');
      guide.className = 'a11y-reading-guide';
      document.body.appendChild(guide);
      
      document.addEventListener('mousemove', handleReadingGuideMouseMove);
    }
    
    // Leseführung entfernen
    function removeReadingGuide() {
      const guide = document.querySelector('.a11y-reading-guide');
      if (guide) {
        guide.remove();
        document.removeEventListener('mousemove', handleReadingGuideMouseMove);
      }
    }
    
    // Mausbewegung für Leseführung verarbeiten
    function handleReadingGuideMouseMove(e) {
      const guide = document.querySelector('.a11y-reading-guide');
      if (guide) {
        guide.style.top = `${e.clientY}px`;
      }
    }
    
    // Lesemaske erstellen
    function createReadingMask() {
      const mask = document.createElement('div');
      mask.className = 'reading-mask-overlay';
      
      // Canvas für die Maske erstellen
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      mask.appendChild(canvas);
      
      document.body.appendChild(mask);
      
      // Canvas-Größe aktualisieren
      const ctx = canvas.getContext('2d');
      
      function updateCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawMask({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
      }
      
      window.addEventListener('resize', updateCanvasSize);
      updateCanvasSize();
      
      function drawMask(e) {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dunkle Überlagerung
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Transparenter Kreis an der Cursor-Position
        const radius = 120;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, radius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
      
      document.addEventListener('mousemove', drawMask);
      
      return { mask, cleanup: () => {
        document.removeEventListener('mousemove', drawMask);
        window.removeEventListener('resize', updateCanvasSize);
      }};
    }
    
    // Lesemaske entfernen
    function removeReadingMask() {
      const mask = document.querySelector('.reading-mask-overlay');
      if (mask) {
        mask.remove();
      }
    }
    
    // Einstellungen anwenden
    function applyAccessibilitySettings(settings) {
      // CSS-Stile für Barrierefreiheit erstellen, falls noch nicht vorhanden
      if (!document.getElementById('a11y-styles')) {
        createAccessibilityStyles();
      }
      
      // Alle Einstellungen zurücksetzen
      document.body.classList.remove(
        'a11y-dark-contrast',
        'a11y-light-contrast',
        'a11y-monochrome',
        'a11y-high-saturation',
        'a11y-font-lg',
        'a11y-font-xl',
        'a11y-font-xxl',
        'a11y-line-spacing-md',
        'a11y-line-spacing-lg',
        'a11y-letter-spacing-md',
        'a11y-letter-spacing-lg',
        'a11y-reading-guide-active',
        'a11y-large-cursor'
      );
      
      // Dynamische Elemente entfernen
      removeReadingGuide();
      removeReadingMask();
      
      // Neue Einstellungen anwenden
      if (settings.darkContrast) {
        document.body.classList.add('a11y-dark-contrast');
      }
      
      if (settings.lightContrast) {
        document.body.classList.add('a11y-light-contrast');
      }
      
      if (settings.monochrome) {
        document.body.classList.add('a11y-monochrome');
      }
      
      if (settings.highSaturation) {
        document.body.classList.add('a11y-high-saturation');
      }
      
      // Schriftgröße
      if (settings.fontSize === 'large') {
        document.body.classList.add('a11y-font-lg');
      } else if (settings.fontSize === 'x-large') {
        document.body.classList.add('a11y-font-xl');
      } else if (settings.fontSize === 'xx-large') {
        document.body.classList.add('a11y-font-xxl');
      }
      
      // Zeilenabstand
      if (settings.lineSpacing === 'medium') {
        document.body.classList.add('a11y-line-spacing-md');
      } else if (settings.lineSpacing === 'large') {
        document.body.classList.add('a11y-line-spacing-lg');
      }
      
      // Buchstabenabstand
      if (settings.letterSpacing === 'medium') {
        document.body.classList.add('a11y-letter-spacing-md');
      } else if (settings.letterSpacing === 'large') {
        document.body.classList.add('a11y-letter-spacing-lg');
      }
      
      // Leseführung
      if (settings.readingGuide) {
        document.body.classList.add('a11y-reading-guide-active');
        createReadingGuide();
      }
      
      // Großer Cursor
      if (settings.largeCursor) {
        document.body.classList.add('a11y-large-cursor');
      }
      
      // Lesemaske
      if (settings.readingMask) {
        createReadingMask();
      }
    }
  }
  
  // Widget initialisieren
  // Erstelle direkte Widget-Komponenten ohne iframe
  function createDirectWidgetComponents() {
    // Ähnlich wie direct-integration.js, aber vereinfacht nur für den Fall, 
    // dass wir bereits in einem iframe sind
    let isOpen = false;
    let settings = {
      darkContrast: false,
      lightContrast: false,
      monochrome: false,
      highSaturation: false,
      fontSize: 'default',
      lineSpacing: 'default',
      letterSpacing: 'default',
      readingGuide: false,
      largeCursor: false,
      readingMask: false
    };

    // CSS für Widget erstellen
    createAccessibilityStyles();

    // Widget-Button erstellen
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Barrierefreiheit-Optionen öffnen');
    button.setAttribute('title', 'Barrierefreiheit-Optionen');
    button.className = 'a11y-widget-button';
    button.setAttribute('style', `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #0066ff;
      border: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `);
    
    // Icon für den Button erstellen
    const icon = document.createElement('div');
    icon.setAttribute('style', `
      width: 30px;
      height: 30px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.5-15c-.83 0-1.5.67-1.5 1.5S10.67 8 11.5 8 13 7.33 13 6.5 12.33 5 11.5 5zm-1 4.5v6H12v-2h1v2h1.5v-6h-4z'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    `);
    button.appendChild(icon);
    
    // Button zum DOM hinzufügen
    document.body.appendChild(button);
    
    // Einstellungen auf die Hauptseite anwenden
    button.addEventListener('click', function() {
      // Statt ein Panel zu öffnen, kommunizieren wir direkt mit dem parent window
      if (window.top && window.top !== window.self) {
        window.top.postMessage({ 
          type: 'TOGGLE_ACCESSIBILITY_PANEL' 
        }, '*');
      }
    });
    
    // Eventlistener für Nachrichten vom parent window
    window.addEventListener('message', function(event) {
      const data = event.data;
      
      if (data.type === 'APPLY_SETTINGS') {
        settings = { ...data.settings };
        // Direkt zum parent window senden
        if (window.top && window.top !== window.self) {
          window.top.postMessage({ 
            type: 'APPLY_SETTINGS',
            settings: settings
          }, '*');
        }
      }
    });
  }

  function initWidget() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createWidgetIframe);
    } else {
      createWidgetIframe();
    }
  }
  
  // Starten
  initWidget();
})();
