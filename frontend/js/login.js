const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async function(e){
  e.preventDefault();

  const data = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    // Notification div
    const notify = document.createElement('div');
    notify.className = 'notify';
    notify.style.position = 'fixed';
    notify.style.top = '20px';
    notify.style.right = '20px';
    notify.style.padding = '12px 20px';
    notify.style.borderRadius = '8px';
    notify.style.display = 'flex';
    notify.style.alignItems = 'center';
    notify.style.gap = '8px';
    notify.style.zIndex = 999;

    if(response.ok){
      notify.style.background = 'rgba(0,0,0,0.6)';
      notify.style.color = '#00ff7f';
      notify.innerHTML = `✔ ${result.message}`;
      document.body.appendChild(notify);
      setTimeout(() => {
        notify.remove();
        window.location.href = '../index.html';
      }, 2000);
    } else {
      notify.style.background = 'rgba(0,0,0,0.6)';
      notify.style.color = '#ff5555';
      notify.innerHTML = `✖ ${result.message}`;
      document.body.appendChild(notify);
      setTimeout(() => notify.remove(), 2500);
    }

  } catch(err) {
    const notify = document.createElement('div');
    notify.className = 'notify';
    notify.style.position = 'fixed';
    notify.style.top = '20px';
    notify.style.right = '20px';
    notify.style.padding = '12px 20px';
    notify.style.background = 'rgba(0,0,0,0.6)';
    notify.style.color = '#ff5555';
    notify.style.borderRadius = '8px';
    notify.style.display = 'flex';
    notify.style.alignItems = 'center';
    notify.style.gap = '8px';
    notify.style.zIndex = 999;
    notify.innerHTML = `✖ Server not reachable`;
    document.body.appendChild(notify);
    setTimeout(() => notify.remove(), 2500);
    console.error(err);
  }
});

// Close button
function closeLogin(){
  window.location.href = "../index.html";
}
