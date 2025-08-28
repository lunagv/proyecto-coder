(function() {
  const password = "miContraseña123"; // Cambia aquí tu contraseña

  const body = document.body;

  const contentWrapper = document.createElement('div');
  contentWrapper.id = 'content-wrapper';

  while (body.firstChild) {
    contentWrapper.appendChild(body.firstChild);
  }
  body.appendChild(contentWrapper);

  contentWrapper.style.display = 'none';

  const modalHtml = `
    <style>
      html, body {
        margin: 0; padding: 0; height: 100%;
        font-family: Arial, sans-serif;
      }
      #passwordModal {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1rem;
        min-height: 100vh;
      }
      #modalContent {
        background: #fff;
        padding: 2rem;
        border-radius: 10px;
        max-width: 360px;
        width: 100%;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        box-sizing: border-box;
        text-align: center;
      }
      #modalContent h2 {
        margin-top: 0;
        font-weight: 600;
        color: #333;
      }
      #modalContent input[type="password"] {
        width: 100%;
        padding: 0.6rem;
        margin-top: 1rem;
        font-size: 1.1rem;
        border-radius: 6px;
        border: 1px solid #ccc;
        box-sizing: border-box;
        outline-offset: 2px;
      }
      #modalContent button {
        margin-top: 1.2rem;
        padding: 0.6rem 1.5rem;
        font-size: 1.1rem;
        cursor: pointer;
        background-color: #0078d7;
        border: none;
        color: white;
        border-radius: 6px;
        transition: background-color 0.3s ease;
      }
      #modalContent button:hover {
        background-color: #005fa3;
      }
      #errorMsg {
        color: #d93025;
        margin-top: 0.7rem;
        display: none;
        font-weight: 600;
      }
    </style>
    <div id="passwordModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div id="modalContent">
        <h2 id="modalTitle">Ingresa la contraseña</h2>
        <input type="password" id="passwordInput" placeholder="Contraseña" aria-label="Contraseña" />
        <button id="submitBtn">Entrar</button>
        <div id="errorMsg" role="alert">Contraseña incorrecta, intenta de nuevo.</div>
      </div>
    </div>
  `;

  body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('passwordModal');
  const input = document.getElementById('passwordInput');
  const btn = document.getElementById('submitBtn');
  const errorMsg = document.getElementById('errorMsg');

  btn.addEventListener('click', () => {
    if(input.value === password) {
      modal.style.display = 'none';
      contentWrapper.style.display = 'block';
    } else {
      errorMsg.style.display = 'block';
      input.value = '';
      input.focus();
    }
  });

  input.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') btn.click();
  });

  // Foco automático al input cuando carga el modal
  input.focus();
})();
