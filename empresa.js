// Funciones para cambiar de perfil
async function cambiarPerfil() {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    // Si es empresa, cambiar a estudiante
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Error al cambiar de perfil:', error);
    showToast('Error al cambiar de perfil', 'error');
  }
}

// Cargar y mostrar vacantes
async function cargarVacantes(empresaId) {
  try {
    const vacantesQuery = query(
      collection(db, 'vacantes'),
      where('empresaId', '==', empresaId),
      orderBy('fecha', 'desc')
    );
    
    const snapshot = await getDocs(vacantesQuery);
    const misVacantes = document.getElementById('misVacantes');
    const totalVacantes = document.getElementById('totalVacantes');
    
    totalVacantes.textContent = snapshot.size;
    misVacantes.innerHTML = '';

    if (snapshot.empty) {
      misVacantes.innerHTML = `
        <div class="no-results">
          <h3>No hay vacantes publicadas</h3>
          <p>Utiliza el formulario superior para crear tu primera vacante.</p>
        </div>
      `;
      return;
    }

    snapshot.forEach(doc => {
      const vacante = doc.data();
      const vacanteElement = document.createElement('div');
      vacanteElement.className = 'vacante';
      
      // Formatear el salario
      const salarioFormateado = vacante.pago.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });

      // Crear elemento de la vacante
      vacanteElement.innerHTML = `
        <div class="vacante-header">
          <h3 class="vacante-title">${vacante.titulo}</h3>
          <button onclick="eliminarVacante('${doc.id}')" class="btn-delete">
            <span class="material-icons">delete</span>
          </button>
        </div>
        
        <div class="vacante-tags">
          <span class="tag tag-modalidad">${vacante.modalidad}</span>
          <span class="tag tag-salary">${salarioFormateado}</span>
        </div>
        
        <p class="vacante-description">${vacante.descripcion}</p>
        
        <div class="vacante-skills">
          ${vacante.habilidades.map(skill => `<span class="skill">${skill}</span>`).join('')}
        </div>
        
        <div class="vacante-info">
          <p>Postulaciones: <strong>${vacante.postulaciones?.length || 0}</strong></p>
          <button onclick="verPostulaciones('${doc.id}')" class="btn-secondary">
            Ver postulaciones
          </button>
        </div>
      `;
      
      misVacantes.appendChild(vacanteElement);
    });
  } catch (error) {
    console.error('Error al cargar vacantes:', error);
    showToast('Error al cargar las vacantes', 'error');
  }
}

// Función para eliminar una vacante
async function eliminarVacante(vacanteId) {
  // show visual confirmation modal
  window.showConfirmModal({
    title: 'Eliminar vacante',
    message: '¿Estás seguro de que deseas eliminar esta vacante?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar'
  }, async () => {
    try {
      await deleteDoc(doc(db, 'vacantes', vacanteId));
      showToast('Vacante eliminada exitosamente', 'success');
      const user = auth.currentUser;
      if (user) cargarVacantes(user.uid);
    } catch (error) {
      console.error('Error al eliminar la vacante:', error);
      showToast('Error al eliminar la vacante', 'error');
    }
  });
  }

// Ver postulaciones de una vacante
async function verPostulaciones(vacanteId) {
  try {
    const postulacionesQuery = query(
      collection(db, 'postulaciones'),
      where('vacanteId', '==', vacanteId)
    );
    
    const snapshot = await getDocs(postulacionesQuery);
    let postulacionesHTML = '';

    if (snapshot.empty) {
      alert('No hay postulaciones para esta vacante aún.');
      return;
    }

    for (const doc of snapshot.docs) {
      const postulacion = doc.data();
      const estudiante = await getDoc(doc(db, 'users', postulacion.estudianteId));
      const estudianteData = estudiante.data();
      
      postulacionesHTML += `
        Estudiante: ${estudianteData.name}
        Universidad: ${estudianteData.university}
        Carrera: ${estudianteData.career}
        GPA: ${estudianteData.gpa}
        Fecha de postulación: ${postulacion.fecha.toDate().toLocaleDateString()}
        
      `;
    }

    alert(postulacionesHTML);
  } catch (error) {
    console.error('Error al cargar postulaciones:', error);
    showToast('Error al cargar las postulaciones', 'error');
  }
}

// Función para mostrar notificaciones toast
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// Manejar el formulario de vacantes
const vacanteForm = document.getElementById('vacanteForm');
if (vacanteForm) {
  vacanteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = vacanteForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Publicando...';
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Debes iniciar sesión');

      const vacanteData = {
        titulo: vacanteForm.titulo.value,
        descripcion: vacanteForm.descripcion.value,
        modalidad: vacanteForm.modalidad.value,
        ubicacion: vacanteForm.ubicacion.value,
        pago: parseInt(vacanteForm.pago.value),
        habilidades: vacanteForm.habilidades.value.split(',').map(h => h.trim()),
        empresaId: user.uid,
        empresaNombre: empresaData?.name || 'Empresa',
        fecha: new Date(),
        estado: 'activa'
      };

      await addDoc(collection(db, 'vacantes'), vacanteData);
      
      showToast('¡Vacante publicada con éxito!', 'success');
      vacanteForm.reset();
      cargarVacantes(user.uid);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al publicar la vacante: ' + error.message, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Publicar Vacante';
    }
  });
}

// Exponer funciones necesarias al ámbito global
window.cerrarSesion = async () => {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    showToast('Error al cerrar sesión', 'error');
  }
};

window.cambiarPerfil = cambiarPerfil;
window.eliminarVacante = eliminarVacante;
window.verPostulaciones = verPostulaciones;