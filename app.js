// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9USwOBgrunZQZcBCQFd8Fx0UJTytZ8_s",
  authDomain: "conectau-16a34.firebaseapp.com",
  projectId: "conectau-16a34",
  storageBucket: "conectau-16a34.appspot.com",
  messagingSenderId: "557099346827",
  appId: "1:557099346827:web:13509cb4bf9c9921615d8e",
  measurementId: "G-JSE7B6KR38"
};

// Inicializar Firebase
if (typeof window.initializeFirebase === 'function') {
  window.initializeFirebase();
}

// Verificación de autenticación para todas las páginas protegidas
function verificarAuth() {
  const paginasProtegidas = ['dashboard.html', 'empresa.html'];
  const paginaActual = window.location.pathname.split('/').pop();
  
  if (paginasProtegidas.includes(paginaActual)) {
    auth.onAuthStateChanged(user => {
      if (!user) {
        window.location.href = 'login.html';
      }
    });
  }
}

verificarAuth();

// Registro
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validación de contraseña
    const password = registerForm.password.value;
    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    // Validación de campos
    if (!registerForm.role.value) {
      alert('Por favor selecciona un rol');
      return;
    }
    
    const data = {
      name: registerForm.name.value,
      email: registerForm.email.value,
      university: registerForm.university.value,
      career: registerForm.career.value,
      gpa: parseFloat(registerForm.gpa.value),
      skills: registerForm.skills.value.split(',').map(s => s.trim()),
      role: registerForm.role.value,
      createdAt: new Date(),
      lastLogin: null
    };
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(data.email, registerForm.password.value);
      await db.collection('users').doc(userCredential.user.uid).set(data);
      await auth.signOut(); // Cerrar sesión después del registro
      alert('Registro exitoso. Por favor, inicia sesión.');
      window.location.href = 'login.html';
    } catch (error) {
      alert('Error en el registro: ' + error.message);
    }
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    
    try {
      // Mostrar indicador de carga
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Iniciando sesión...';
      
      // Intentar login
      const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
      
      // Buscar datos del usuario
      const userDoc = await window.db.collection('users').doc(userCredential.user.uid).get();
      
      if (!userDoc.exists) {
        throw new Error('No se encontraron datos del usuario');
      }

      const userData = userDoc.data();
      
      // Actualizar último login
      await window.db.collection('users').doc(userCredential.user.uid).update({
        lastLogin: new Date()
      });
      
      // Redirigir según el rol
      window.location.href = userData.role === 'empresa' ? 'empresa.html' : 'dashboard.html';
    } catch (error) {
      console.error('Error de login:', error);
      alert('Error al iniciar sesión: ' + (error.message || 'Verifica tus credenciales'));
    }
  });
}

// Publicar vacante
const vacanteForm = document.getElementById('vacanteForm');
if (vacanteForm) {
  vacanteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const vacante = {
      titulo: vacanteForm.titulo.value,
      descripcion: vacanteForm.descripcion.value,
      modalidad: vacanteForm.modalidad.value,
      ubicacion: vacanteForm.ubicacion.value,
      pago: parseInt(vacanteForm.pago.value),
      habilidades: vacanteForm.habilidades.value.split(',').map(h => h.trim()),
      fecha: new Date()
    };
    try {
      await db.collection('vacantes').add(vacante);
      alert('Vacante publicada');
      vacanteForm.reset();
    } catch (error) {
      alert('Error al publicar vacante: ' + error.message);
    }
  });
}

// Variables globales para las vacantes
let todasLasVacantes = [];
let vacantesFiltradas = [];

// Mostrar vacantes
const vacantesDiv = document.getElementById('vacantes');
if (vacantesDiv) {
  db.collection('vacantes').orderBy('fecha', 'desc').onSnapshot(snapshot => {
    todasLasVacantes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    filtrarVacantes();
  });
}

// Función para filtrar vacantes
function filtrarVacantes() {
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const modalidad = document.getElementById('modalidadFilter')?.value || '';
  const salaryRange = document.getElementById('salaryFilter')?.value || '';
  
  vacantesFiltradas = todasLasVacantes.filter(v => {
    const matchSearch = v.titulo.toLowerCase().includes(searchTerm) ||
                       v.descripcion.toLowerCase().includes(searchTerm) ||
                       v.habilidades.some(h => h.toLowerCase().includes(searchTerm));
    
    const matchModalidad = !modalidad || v.modalidad === modalidad;
    
    let matchSalary = true;
    if (salaryRange) {
      const [min, max] = salaryRange.split('-').map(Number);
      if (max) {
        matchSalary = v.pago >= min && v.pago <= max;
      } else {
        matchSalary = v.pago >= min;
      }
    }
    
    return matchSearch && matchModalidad && matchSalary;
  });
  
  mostrarVacantes();
}

// Función para mostrar las vacantes filtradas
function mostrarVacantes() {
  if (!vacantesDiv) return;
  
  vacantesDiv.innerHTML = '';
  const noResults = document.getElementById('noResults');
  
  if (vacantesFiltradas.length === 0) {
    noResults.style.display = 'block';
    return;
  }
  
  noResults.style.display = 'none';
  vacantesFiltradas.forEach(v => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <h3>${v.titulo}</h3>
      <p><strong>Empresa:</strong> ${v.empresa || 'Confidencial'}</p>
      <p><strong>Descripción:</strong> ${v.descripcion}</p>
      <p><strong>Modalidad:</strong> ${v.modalidad}</p>
      <p><strong>Ubicación:</strong> ${v.ubicacion}</p>
      <p><strong>Pago:</strong> $${v.pago.toLocaleString()}</p>
      <p><strong>Habilidades:</strong> ${v.habilidades.join(', ')}</p>
      <div class="card-actions">
        <button onclick="postular('${v.id}')" class="btn-postular">Postularme</button>
        <button onclick="toggleFavorito('${v.id}')" class="btn-favorito">
          ${v.esFavorito ? '★' : '☆'}
        </button>
      </div>
    `;
    vacantesDiv.appendChild(card);
  });
}

// Función para marcar/desmarcar favoritos
async function toggleFavorito(vacanteId) {
  const user = auth.currentUser;
  if (!user) {
    alert('Debes iniciar sesión para guardar favoritos');
    return;
  }

  try {
    const favoritosRef = db.collection('usuarios').doc(user.uid).collection('favoritos').doc(vacanteId);
    const doc = await favoritosRef.get();

    if (doc.exists) {
      await favoritosRef.delete();
    } else {
      await favoritosRef.set({
        fecha: new Date()
      });
    }

    // Actualizar la UI
    filtrarVacantes();
  } catch (error) {
    alert('Error al actualizar favoritos: ' + error.message);
  }
}

// Postularse a vacante
function postular(vacanteId) {
  auth.onAuthStateChanged(async user => {
    if (user) {
      try {
        await db.collection('postulaciones').add({
          vacanteId,
          estudianteId: user.uid,
          fecha: new Date()
        });
        alert('Postulación enviada');
      } catch (error) {
        alert('Error al postularse: ' + error.message);
      }
    } else {
      alert('Debes iniciar sesión para postularte');
    }
  });
}
