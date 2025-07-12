// Teste simples de login no frontend
const testLogin = async () => {
  try {
    console.log('🧪 Testando login...');
    
    const formData = new FormData();
    formData.append('username', 'admin@provafacil.com');
    formData.append('password', 'admin123');
    
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: 'admin@provafacil.com',
        password: 'admin123'
      })
    });
    
    console.log('�� Status:', response.status);
    console.log('📋 Headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login bem-sucedido:', data);
    } else {
      const error = await response.text();
      console.log('❌ Erro no login:', error);
    }
    
  } catch (error) {
    console.log('💥 Erro de rede:', error);
  }
};

testLogin(); 