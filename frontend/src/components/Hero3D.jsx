import React from 'react';
import { motion } from 'framer-motion';

const Hero3D = () => {
  return (
    <div style={{ 
      height: '320px', 
      width: '100%', 
      background: 'linear-gradient(120deg, #121212 0%, #1e1e1e 100%)', 
      borderRadius: '24px', 
      overflow: 'hidden', 
      position: 'relative', 
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 60px',
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '0',
        width: '50%',
        height: '200%',
        background: 'radial-gradient(ellipse at center, rgba(255, 107, 53, 0.12) 0%, transparent 70%)',
        transform: 'rotate(-45deg)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'absolute',
        right: '-10%',
        top: '-20%',
        width: '600px',
        height: '600px',
        opacity: 0.03,
        backgroundImage: 'linear-gradient(90deg, #fff 2px, transparent 2px), linear-gradient(#fff 2px, transparent 2px)',
        backgroundSize: '100px 100px, 100px 100px',
        transform: 'rotate(15deg)',
        pointerEvents: 'none'
      }}></div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '650px' }}>
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           style={{ 
             display: 'inline-flex', 
             alignItems: 'center',
             gap: '8px',
             padding: '8px 16px', 
             background: 'rgba(255, 107, 53, 0.1)', 
             border: '1px solid rgba(255, 107, 53, 0.3)',
             borderRadius: '100px', 
             marginBottom: '24px',
             color: '#FF6B35',
             fontSize: '0.85rem',
             fontWeight: '700',
             letterSpacing: '0.5px',
             textTransform: 'uppercase'
           }}
         >
           <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B35', boxShadow: '0 0 10px #FF6B35' }}></span>
           Live Production Hub
         </motion.div>
         
         <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.1 }}
           style={{ 
             fontSize: '3.5rem', 
             fontWeight: '800', 
             color: '#ffffff', 
             lineHeight: '1.1',
             marginBottom: '20px',
             letterSpacing: '-1.5px',
             fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
           }}
         >
           Filmmaking 
           <span style={{ color: '#FF6B35' }}> Reimagined.</span>
         </motion.h1>
         
         <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           style={{ 
             fontSize: '1.15rem', 
             color: '#9ca3af', 
             fontWeight: '400', 
             lineHeight: '1.6',
             maxWidth: '90%',
             marginBottom: '32px'
           }}
         >
           From script breakdown to final cut — let AI handle the logistics while you focus on the vision.
         </motion.p>

         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: '16px' }}
         >
            <button style={{
              padding: '14px 28px',
              background: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 20px -4px rgba(255, 107, 53, 0.5)',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>+</span> New Project
            </button>
            <button style={{
              padding: '14px 28px',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}>
              View Analytics
            </button>
         </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, x: 50, rotate: 5, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, rotate: 5, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          right: '80px',
          top: '50px',
          width: '320px',
          height: '220px',
          borderRadius: '20px',
          transform: 'rotate(5deg)',
          boxShadow: '-30px 30px 60px rgba(0,0,0,0.5)',
          background: 'linear-gradient(135deg, #1f1f1f 0%, #171717 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
          overflow: 'hidden'
        }}
      >
        <div style={{ height: '50px', background: '#262626', borderBottom: '4px solid #000', display: 'flex', position: 'relative', transformOrigin: 'bottom left', transform: 'rotate(-5deg)', marginBottom: '-10px', zIndex: 10 }}>
           <div style={{ flex: 1, background: 'repeating-linear-gradient(120deg, #e5e5e5, #e5e5e5 20px, #262626 20px, #262626 40px)' }}></div>
        </div>
        
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', marginTop: '10px' }}>
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)', pointerEvents: 'none' }}></div>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
             <div style={{ width: '100px', height: '60px', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}></div>
             <div style={{ width: '100px', height: '60px', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}></div>
           </div>
           
           <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Scene</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'rgba(255,255,255,0.9)', lineHeight: 1 }}>
                  24<span style={{ fontSize: '1.5rem', color: '#FF6B35' }}>B</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Take</div>
                 <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#FF6B35', lineHeight: 1 }}>03</div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero3D;
