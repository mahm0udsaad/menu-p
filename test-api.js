const fetch = require('node-fetch');
async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/menu-pdf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menuId: 'test-menu',
        templateId: 'modern',
        language: 'ar',
        customizations: {}
      })
    });
    console.log(res.status, res.headers.get('content-type'));
    const text = await res.text();
    console.log(text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}
test();
