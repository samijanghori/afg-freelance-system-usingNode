// public/js/script.js

/**
 * Handle form submission with AJAX
 */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('memberForm');
    const responseMessage = document.getElementById('responseMessage');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // جمع‌آوری داده‌های فرم
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // پردازش مهارت‌ها
            if (data.skills) {
                data.skills = data.skills.split(',').map(s => s.trim()).filter(s => s);
            }
            
            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    responseMessage.innerHTML = `
                        <div class="success-message">
                            ✅ Member created successfully!
                            <pre>${JSON.stringify(result.data, null, 2)}</pre>
                        </div>
                    `;
                    form.reset();
                } else {
                    responseMessage.innerHTML = `
                        <div class="error-message">
                            ❌ Error: ${result.message}
                        </div>
                    `;
                }
            } catch (error) {
                responseMessage.innerHTML = `
                    <div class="error-message">
                        ❌ Network error: ${error.message}
                    </div>
                `;
            }
        });
    }
});

/**
 * Utility function to show notifications
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.5s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#2ecc71';
    } else if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else {
        notification.style.background = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

/**
 * Add CSS animations dynamically
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .success-message {
        background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 5px;
        margin-top: 1rem;
        border: 1px solid #c3e6cb;
    }
    
    .error-message {
        background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 5px;
        margin-top: 1rem;
        border: 1px solid #f5c6cb;
    }
    
    .success-message pre, .error-message pre {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: rgba(0,0,0,0.05);
        border-radius: 3px;
        overflow-x: auto;
    }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
window.showNotification = showNotification;