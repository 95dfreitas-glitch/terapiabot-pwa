// TerapiaBot v2 - PWA App JavaScript

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered successfully:', registration.scope);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute
            })
            .catch(error => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;
const installButton = document.getElementById('installButton');

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 Install prompt available');
    
    // Prevent the default mini-infobar from appearing
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e;
    
    // Show the install button
    if (installButton) {
        installButton.style.display = 'flex';
    }
});

// Handle install button click
if (installButton) {
    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            console.log('⚠️ Install prompt not available');
            return;
        }
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`👤 User response to install prompt: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('✅ User accepted the install prompt');
        } else {
            console.log('❌ User dismissed the install prompt');
        }
        
        // Clear the deferred prompt
        deferredPrompt = null;
        
        // Hide the install button
        installButton.style.display = 'none';
    });
}

// Listen for successful installation
window.addEventListener('appinstalled', (e) => {
    console.log('🎉 TerapiaBot v2 PWA installed successfully!');
    
    // Hide the install button
    if (installButton) {
        installButton.style.display = 'none';
    }
    
    // Optional: Show a thank you message
    showInstallSuccessMessage();
});

// Function to show installation success message
function showInstallSuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #7FB069, #5B8FA3);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    message.textContent = '🎉 TerapiaBot v2 installed successfully!';
    document.body.appendChild(message);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Network status indicator
window.addEventListener('online', () => {
    console.log('🌐 Back online');
    showNetworkStatus('You are back online', '#7FB069');
});

window.addEventListener('offline', () => {
    console.log('📴 Offline mode');
    showNetworkStatus('You are offline - Some features may be limited', '#FFB84D');
});

function showNetworkStatus(message, color) {
    const statusBar = document.createElement('div');
    statusBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: ${color};
        color: white;
        text-align: center;
        padding: 12px;
        font-weight: 600;
        z-index: 10000;
        animation: slideDown 0.3s ease;
    `;
    statusBar.textContent = message;
    document.body.insertBefore(statusBar, document.body.firstChild);
    
    setTimeout(() => {
        statusBar.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => statusBar.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
        }
        to {
            transform: translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(0);
        }
        to {
            transform: translateY(-100%);
        }
    }
`;
document.head.appendChild(style);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📱 App is now in background');
    } else {
        console.log('📱 App is now in foreground');
    }
});

// Log PWA capabilities
console.log('🚀 TerapiaBot v2 PWA Loaded');
console.log('📱 Standalone mode:', window.matchMedia('(display-mode: standalone)').matches);
console.log('🔔 Notifications supported:', 'Notification' in window);
console.log('💾 Service Worker supported:', 'serviceWorker' in navigator);
console.log('📦 Cache API supported:', 'caches' in window);