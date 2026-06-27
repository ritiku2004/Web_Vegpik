import SubPageHeader from '../../components/layout/SubPageHeader/SubPageHeader';
import Card from '../../components/common/Card/Card';
import styles from './Services.module.css';

const Services = () => {
  const servicesList = [
    {
      title: 'Home Delivery',
      description: 'Receive fresh fruits, vegetables, and leafy greens right at your doorstep. Schedule one-off deliveries or subscribe to weekly grocery plans.',
      icon: '🚚'
    },
    {
      title: 'Customized Vegetable Boxes',
      description: 'Choose your preferred combinations or get a chef-curated box of seasonal greens, root veggies, and fruits tailored to your diet.',
      icon: '📦'
    },
    {
      title: 'Bulk & Corporate Catering',
      description: 'Supporting restaurants, juice bars, offices, and events with premium organic produce at wholesale rates and customized shipping.',
      icon: '🏢'
    }
  ];

  return (
    <div className={styles.servicesContainer}>
      <SubPageHeader title="Our Services" />

      <div className={styles.content}>
        <div className={styles.grid}>
          {servicesList.map((service, index) => (
            <Card key={index} hoverable className={styles.serviceCard}>
              <div className={styles.icon}>{service.icon}</div>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
