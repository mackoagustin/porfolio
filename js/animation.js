document.addEventListener('DOMContentLoaded', function() {
   
    const elements = document.querySelectorAll('.moveInLeftLarge, .moveInRightLarge, .apear, .apear1, .apear2, .moveInUpLarge, .moveInDownLarge');
  
    // Crear una instancia del Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Añadir la clase para activar la animación
          entry.target.classList.add('animate');
          // Dejar de observar el elemento después de aplicar la animación
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1 // Ajusta el umbral según tus necesidades
    });
  
    // Observar cada elemento
    elements.forEach(element => {
      observer.observe(element);
    });
  });
  