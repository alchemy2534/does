console.log('Frontend loaded');
let currentOrderId = null;

document.getElementById('skillForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const skill = document.getElementById('skill').value;
  document.getElementById('results').innerText = 'Loading...';
  try {
    const searchResponse = await fetch('http://localhost:5000/api/beckn/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill })
    });
    const data = await searchResponse.json();
    console.log('Search response:', data); // Debug log
    if (data.message && data.message.includes('mock')) {
      document.getElementById('results').innerText = `${data.message}`;
      if (data.mapped_data) {
        const mappedStr = data.mapped_data.map(item => `${item.name}: ${item.competency_level} (NSQF ${item.nsqf_level})`).join('\n');
        document.getElementById('results').innerText += `\nMapped: ${mappedStr}`;
      }
      const existingBtn = document.getElementById('selectBtn');
      if (existingBtn) existingBtn.remove();
      const selectBtn = document.createElement('button');
      selectBtn.id = 'selectBtn';
      selectBtn.textContent = 'Select Credential';
      document.getElementById('results').appendChild(selectBtn);
      selectBtn.addEventListener('click', () => handleSelect(skill, data.bppUrl), { once: true });
    } else {
      document.getElementById('results').innerText = `Found: ${data.message || JSON.stringify(data)}`;
    }
  } catch (error) {
    console.error('Search error:', error);
    document.getElementById('results').innerText = `Error: ${error.message}`;
  }
});

async function handleSelect(skill, bppUrl) {
  const btn = document.getElementById('selectBtn');
  if (btn) btn.disabled = true;
  console.log('Select called with bppUrl:', bppUrl, 'at', new Date().toISOString()); // Debug log
  document.getElementById('results').innerText += '\nSelecting...';
  const selectResponse = await fetch('http://localhost:5000/api/beckn/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: 'java-cert', provider_id: 'uni-1', skill_category: skill, bppUrl })
  });
  const data = await selectResponse.json();
  console.log('Select response:', data); // Debug log
  currentOrderId = data.order_id;
  document.getElementById('results').innerText += `\nSelected: Order ID ${currentOrderId}`;
  const existingInitBtn = document.getElementById('initBtn');
  if (existingInitBtn) existingInitBtn.remove();
  const initBtn = document.createElement('button');
  initBtn.id = 'initBtn';
  initBtn.textContent = 'Initiate Verification';
  document.getElementById('results').appendChild(initBtn);
  initBtn.addEventListener('click', () => handleInit(currentOrderId, bppUrl), { once: true });
}

async function handleInit(orderId, bppUrl) {
  const btn = document.getElementById('initBtn');
  if (btn) btn.disabled = true;
  console.log('Init called with bppUrl:', bppUrl, 'at', new Date().toISOString()); // Debug log
  document.getElementById('results').innerText += '\nInitiating...';
  const initResponse = await fetch('http://localhost:5000/api/beckn/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, student_id: 'student-1', competencies: [{ name: 'java' }], bppUrl })
  });
  const data = await initResponse.json();
  console.log('Init response:', data); // Debug log
  document.getElementById('results').innerText += `\nInitiated: ${JSON.stringify(data)}`;
  const existingConfirmBtn = document.getElementById('confirmBtn');
  if (existingConfirmBtn) existingConfirmBtn.remove();
  const confirmBtn = document.createElement('button');
  confirmBtn.id = 'confirmBtn';
  confirmBtn.textContent = 'Confirm Verification';
  document.getElementById('results').appendChild(confirmBtn);
  confirmBtn.addEventListener('click', () => handleConfirm(orderId, bppUrl), { once: true });
}

async function handleConfirm(orderId, bppUrl) {
  const btn = document.getElementById('confirmBtn');
  if (btn) btn.disabled = true;
  console.log('Confirm called with bppUrl:', bppUrl, 'at', new Date().toISOString()); // Debug log
  document.getElementById('results').innerText += '\nConfirming...';
  const confirmResponse = await fetch('http://localhost:5000/api/beckn/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, student_id: 'student-1', bppUrl })
  });
  const data = await confirmResponse.json();
  console.log('Confirm response:', data); // Debug log
  document.getElementById('results').innerText += `\nConfirmed: ${JSON.stringify(data)}`;
  const existingFulfillBtn = document.getElementById('fulfillBtn');
  if (existingFulfillBtn) existingFulfillBtn.remove();
  const fulfillBtn = document.createElement('button');
  fulfillBtn.id = 'fulfillBtn';
  fulfillBtn.textContent = 'Get Fulfilled Profile';
  document.getElementById('results').appendChild(fulfillBtn);
  fulfillBtn.addEventListener('click', () => handleFulfill(orderId, bppUrl), { once: true });
}

async function handleFulfill(orderId, bppUrl) {
  const btn = document.getElementById('fulfillBtn');
  if (btn) btn.disabled = true;
  console.log('Fulfill called with bppUrl:', bppUrl, 'at', new Date().toISOString()); // Debug log
  document.getElementById('results').innerText += '\nFulfilling...';
  const fulfillResponse = await fetch('http://localhost:5000/api/beckn/fulfill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, bppUrl })
  });
  const data = await fulfillResponse.json();
  console.log('Fulfill response:', data); // Debug log
  document.getElementById('results').innerText += `\nFulfilled: ${JSON.stringify(data)}`;
}