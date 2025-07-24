!function(){
    const p="miContraseña123",
          e=prompt("Ingresa la contraseña para acceder a esta página:");
    e!==p&&(alert("Contraseña incorrecta"),window.location.href="/");
  }();
  