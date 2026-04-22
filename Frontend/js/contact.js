import { initDarkMode, showToast } from './utils.js';

export function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('success-message');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.querySelector('#contact-form .fa-paper-plane');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic validation
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // UI state: loading
        btnText.textContent = 'Sending...';
        form.style.pointerEvents = 'none';
        form.style.opacity = '0.7';

        // Mock API call delay
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success
            form.classList.add('hide');
            successMsg.classList.remove('hide');
            showToast('Message sent successfully!', 'success');
            
            console.log('Contact form submitted:', formData);
        } catch (error) {
            showToast('Failed to send message. Please try again.', 'error');
            btnText.textContent = 'Send Message';
            form.style.pointerEvents = 'auto';
            form.style.opacity = '1';
        }
    });

    const sendAnotherBtn = document.getElementById('send-another-btn');
    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener('click', () => {
            form.reset();
            form.classList.remove('hide');
            successMsg.classList.add('hide');
            btnText.textContent = 'Send Message';
            form.style.pointerEvents = 'auto';
            form.style.opacity = '1';
        });
    }
}

