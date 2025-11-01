// Shared helpers for modals and form validation
(function(){
  // Create a reusable confirm modal. Options: title, message, confirmText, cancelText
  window.showConfirmModal = function(options = {}, onConfirm, onCancel) {
    const title = options.title || 'Confirmar';
    const message = options.message || '';
    const confirmText = options.confirmText || 'Aceptar';
    const cancelText = options.cancelText || 'Cancelar';

    const rootId = 'sharedConfirmRoot';
    let root = document.getElementById(rootId);
    if (root) root.remove();
    root = document.createElement('div');
    root.id = rootId;
    root.className = 'cu-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'cu-modal';
    modal.innerHTML = `
      <h3>${title}</h3>
      <div class="muted" style="margin:8px 0 12px">${message}</div>
      <div class="actions" style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
        <button class="btn-outline" id="sharedCancel">${cancelText}</button>
        <button class="btn" id="sharedConfirm">${confirmText}</button>
      </div>
    `;

    root.appendChild(modal);
    document.body.appendChild(root);

    const cleanup = () => { try { root.remove(); } catch(e){} };

    document.getElementById('sharedCancel').onclick = () => {
      if (typeof onCancel === 'function') onCancel();
      cleanup();
    };
    document.getElementById('sharedConfirm').onclick = () => {
      try { if (typeof onConfirm === 'function') onConfirm(); } catch(e){ console.error(e); }
      cleanup();
    };

    return root;
  };

  // Validate vacante form given a form element. Returns {valid, errors}
  window.validateVacanteForm = function(form) {
    const errors = {};
    if (!form) return { valid: false, errors: { form: 'Formulario no encontrado' } };
    const titulo = form.querySelector('#titulo')?.value?.trim() || '';
    const descripcion = form.querySelector('#descripcion')?.value?.trim() || '';
    const pago = form.querySelector('#pago')?.value?.trim() || '';
    const modalidad = form.querySelector('#modalidad')?.value || '';
    const habilidades = form.querySelector('#habilidades')?.value?.trim() || '';

    if (titulo.length < 3) errors.titulo = 'El título debe tener al menos 3 caracteres';
    if (descripcion.length < 10) errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    const pagoNum = Number(pago);
    if (!pago || Number.isNaN(pagoNum) || pagoNum <= 0) errors.pago = 'Introduce un pago válido mayor que 0';
    if (!modalidad) errors.modalidad = 'Selecciona una modalidad';
    if (!habilidades) errors.habilidades = 'Indica al menos una habilidad (separada por coma)';

    return { valid: Object.keys(errors).length === 0, errors };
  };

  // Utility to show inline validation errors in a form. It will create/replace small <div class="form-error"> under inputs
  window.showFormErrors = function(form, errors) {
    // clear previous
    form.querySelectorAll('.form-error').forEach(n => n.remove());

    for (const key in errors) {
      const input = form.querySelector('#' + key);
      if (input) {
        const err = document.createElement('div');
        err.className = 'form-error';
        err.style.color = '#b52d2d';
        err.style.fontSize = '13px';
        err.style.marginTop = '6px';
        err.textContent = errors[key];
        input.parentNode && input.parentNode.appendChild(err);
      }
    }
  };

})();
