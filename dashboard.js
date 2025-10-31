// Variables globales
let todasLasVacantes = [];
let vacantesFiltradas = [];

// Establecer el mensaje de bienvenida cuando el usuario esté autenticado
auth.onAuthStateChanged(async user => {
  if (user) {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      setWelcomeMessage(userData.name || user.email);
    }
  }
});

// Cargar y mostrar vacantes
const vacantesDiv = document.getElementById('vacantes');
if (vacantesDiv) {
  db.collection('vacantes')
    .orderBy('fecha', 'desc')
    .onSnapshot(snapshot => {
      todasLasVacantes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Actualizar contador de vacantes
      const totalVacantes = document.getElementById('totalVacantes');
      totalVacantes.textContent = todasLasVacantes.length;
      
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
    const vacanteElement = document.createElement('div');
    vacanteElement.className = 'vacante';
    
    // Formatear salario
    const salarioFormateado = v.pago.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    // Crear el elemento de la vacante
    vacanteElement.innerHTML = `
      <div class="vacante-header">
        <h3 class="vacante-title">${v.titulo}</h3>
        <p class="vacante-company">${v.empresa || 'Empresa Confidencial'}</p>
      </div>
      
      <div class="vacante-tags">
        <span class="tag tag-modalidad">${v.modalidad}</span>
        <span class="tag tag-salary">${salarioFormateado}</span>
      </div>
      
      <p class="vacante-description">${v.descripcion}</p>
      
      <div class="vacante-skills">
        ${v.habilidades.map(skill => `<span class="skill">${skill}</span>`).join('')}
      </div>
      
      <button onclick="postular('${v.id}')" class="btn-postular">Postularme a esta vacante</button>
    `;
    
    vacantesDiv.appendChild(vacanteElement);
  });
}

// Función para postularse a una vacante
async function postular(vacanteId) {
  const user = auth.currentUser;
  if (!user) {
    showToast('Debes iniciar sesión para postularte');
    return;
  }

  try {
    // Verificar si ya se postuló
    const postulacionesRef = db.collection('postulaciones');
    const postulacionExistente = await postulacionesRef
      .where('vacanteId', '==', vacanteId)
      .where('estudianteId', '==', user.uid)
      .get();
    
    if (!postulacionExistente.empty) {
      showToast('Ya te has postulado a esta vacante');
      return;
    }
    
    // Crear la postulación
    await postulacionesRef.add({
      vacanteId,
      estudianteId: user.uid,
      fecha: new Date(),
      estado: 'pendiente'
    });
    
    showToast('¡Postulación enviada con éxito!', 'success');
  } catch (error) {
    console.error('Error al postular:', error);
    showToast('Error al enviar la postulación. Por favor intenta de nuevo.');
  }
}

// Función para mostrar notificaciones toast
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  
  // Añadir clase según el tipo
  toast.className = `toast ${type}`;
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// Función para establecer el mensaje de bienvenida
function setWelcomeMessage(name) {
  const welcomeMessage = document.getElementById('welcomeMessage');
  const firstName = name.split(' ')[0];
  welcomeMessage.textContent = `¡Bienvenido, ${firstName}!`;
}

// Función para cerrar sesión
function cerrarSesion() {
  auth.signOut()
    .then(() => {
      window.location.href = 'login.html';
    })
    .catch(error => {
      console.error('Error al cerrar sesión:', error);
      showToast('Error al cerrar sesión. Por favor intenta de nuevo.');
    });
}