window.onload = function() {
    Particles.init({
        selector: '.background',
        color:['#DA0463', '#404B69', '#DBEDF3'],
        responsive: [
            {
              breakpoint: 1920,
              options: {
                maxParticles: 150,
                connectParticles: true
              }
            }, {
              breakpoint: 425,
              options: {
                maxParticles: 50,
                connectParticles: false
              }
            }, {
              breakpoint: 320,
              options: {
                maxParticles: 0
              }
            }
          ] 
    });
    
}; 