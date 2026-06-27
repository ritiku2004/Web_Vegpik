import React from 'react';
import Card from '../../components/common/Card/Card';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.header}>
        <h1>About Vegpik</h1>
        <p>Your trusted partner for organic and fresh farm produce.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.story}>
          <h2>Our Story</h2>
          <p>
            Founded in 2026, Vegpik started with a simple mission: to bridge the gap between local farming communities and health-conscious consumers. We believe that access to clean, chemical-free food is a fundamental right.
          </p>
          <p>
            We curate the best vegetables, greens, and fruits, sorting them meticulously to deliver premium-grade produce to families who care about their wellness and vitality.
          </p>
        </div>

        <div className={styles.values}>
          <h2>Our Core Values</h2>
          <div className={styles.grid}>
            <Card title="Freshness First">
              <p>Harvested, packed, and shipped within 24 hours to preserve nutrient density and exceptional taste.</p>
            </Card>
            <Card title="Sustainability">
              <p>Eco-friendly packaging and green logistics to minimize our environmental footprint.</p>
            </Card>
            <Card title="Fair Partnerships">
              <p>Providing fair pricing and sustainable livelihoods for local, small-scale farmers.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
