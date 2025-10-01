// Replace with your form endpoint (Formspree, Formcarry, your server). If left as the placeholder, submit will simulate success.
const FORM_ENDPOINT = 'https://formspree.io/f/meorgyoe'; // e.g. https://formspree.io/f/your-id

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const feedbackEl = document.getElementById('formFeedback');

    function showErr(id, text) {
        const el = document.getElementById('err-' + id);
        if (!el) return;
        if (text) { el.textContent = text; el.style.display = 'block'; }
        else { el.textContent = ''; el.style.display = 'none'; }
    }

    function validate() {
        let ok = true;
        const first = form.firstName.value.trim();
        const last = form.lastName.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();
        const phone = form.phone.value.trim();

        // reset
        ['first', 'last', 'email', 'message', 'phone'].forEach(k => showErr(k, ''));

        if (!first) { showErr('first', 'First name is required'); ok = false; }
        if (!last) { showErr('last', 'Last name is required'); ok = false; }
        if (!email) { showErr('email', 'Email is required'); ok = false; }
        else {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(email)) { showErr('email', 'Enter a valid email'); ok = false; }
        }
        if (!message || message.length < 8) { showErr('message', 'Message should be 8 or more characters'); ok = false; }
        if (phone && phone.length < 6) { showErr('phone', 'Enter a valid phone'); ok = false; }

        return ok;
    }

    async function postData(data) {
        // If no endpoint provided, simulate a success response for local dev
        if (FORM_ENDPOINT === 'REPLACE_WITH_YOUR_ENDPOINT') {
            await new Promise(r => setTimeout(r, 800));
            return { ok: true, simulated: true };
        }
        // Send JSON to endpoint
        const res = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res;
    }

    function showFeedback(type, text) {
        feedbackEl.style.display = 'block';
        feedbackEl.className = 'form-feedback ' + (type === 'success' ? 'success' : 'error');
        feedbackEl.textContent = text;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        feedbackEl.style.display = 'none';
        if (!validate()) return;

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';

        const payload = {
            firstName: form.firstName.value.trim(),
            lastName: form.lastName.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            message: form.message.value.trim(),
            timestamp: new Date().toISOString()
        };

        try {
            const res = await postData(payload);
            if (res.ok) {
                showFeedback('success', 'Thanks — your message has been sent. We will reply within 24 hours.');
                form.reset();
            } else {
                // attempt to read error text
                let txt = '';
                try { txt = await res.text(); } catch (e) { }
                showFeedback('error', 'Error sending the message. ' + (txt || 'Please try again later.'));
            }
        } catch (err) {
            console.error(err);
            showFeedback('error', 'Network error. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});
