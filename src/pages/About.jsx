import React from 'react';

const img1 = require('../assets/about-img-1.jpg'); // Cambia la extensión si es png
const img2 = require('../assets/about-img-2.jpg');

const About = () => (
  <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <h1 className="text-3xl font-bold mb-4">Acerca del sistema</h1>
    <p className="mb-8">No vacunamos pitise ni golda.</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
      <img src={img1} alt="No golda" style={{ maxWidth: 200, borderRadius: 12, boxShadow: '0 2px 8px #0002' }} />
      <img src={img2} alt="Marrón!" style={{ maxWidth: 220, borderRadius: 12, boxShadow: '0 2px 8px #0002' }} />
    </div>
    <a href="/no-vacunamos" className="text-primary underline text-lg font-semibold">Ver política especial</a>
  </div>
);

export default About;
