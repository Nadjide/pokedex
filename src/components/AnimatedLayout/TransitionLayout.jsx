// src/components/AnimatedLayout/TransitionLayout.jsx
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  in: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } },
  out: { opacity: 0, transition: { duration: 0.14, ease: 'easeIn' } },
};

const reducedVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.01 } },
  out: { opacity: 0, transition: { duration: 0.01 } },
};

// Enveloppe chaque route pour animer les changements de page.
const TransitionLayout = ({ children }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={reduceMotion ? reducedVariants : pageVariants}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default TransitionLayout;
