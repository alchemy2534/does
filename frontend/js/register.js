const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async function(e){
  e.preventDefault();

  const data = {
    username: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  try {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    // Create notification div
    const notify = document.createElement('div');
    notify.className = 'notify';
    notify.style.position = 'fixed';
    notify.style.top = '20px';
    notify.style.right = '20px';
    notify.style.padding = '12px 20px';
    notify.style.background = 'rgba(0,0,0,0.6)';
    notify.style.color = '#00ff7f';
    notify.style.borderRadius = '8px';
    notify.style.fontWeight = '500';
    notify.style.display = 'flex';
    notify.style.alignItems = 'center';
    notify.style.zIndex = 999;
    notify.style.gap = '8px';
    notify.innerHTML = `✔ ${result.message || 'Registered successfully!'}`;

    document.body.appendChild(notify);

    // Remove notification after 2s and redirect to login
    setTimeout(() => {
      notify.remove();
      window.location.href = './login.html';
    }, 2000);

  } catch(err) {
    console.error(err);
  }
});

// Close button function
function closeRegister() {
  window.location.href = "../index.html";
}
