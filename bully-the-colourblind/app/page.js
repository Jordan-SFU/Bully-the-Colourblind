'use client'

import React from 'react';
import styles from '../app/page.module.css';
import ColourWheel from './colourWheel';
import ColourWheelBroken from './colourWheelBroken';

export default function Home() {
  const initialList = [
    {
      id: '1',
      hexvalue: '#FFFFFF',
      amount: '10',
    },
    {
      id: '2',
      hexvalue: '#AF100B',
      amount: '3',
    },
  ];

  const [list, setList] = React.useState(initialList);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Bully the Colourblind</h1>
      <ColourWheel />
    </main>
  );
}