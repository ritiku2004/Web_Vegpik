import React, { useState } from 'react';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import styles from './Contact.module.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app, call a service. Here we just set success
    setSuccess(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className={styles.contactContainer}>
      <div className={styles.header}>
        <h1>Contact Us</h1>
        <p>Have questions? We would love to hear from you!</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.infoColumn}>
          <Card title="Quick Contact Info" className={styles.infoCard}>
            <p><strong>📍 Address:</strong> 123 Green Avenue, Harvest City, HC 94002</p>
            <p><strong>📞 Phone:</strong> +1 (555) 789-0123</p>
            <p><strong>✉️ Email:</strong> support@vegpik.com</p>
            <p><strong>⏰ Hours:</strong> Mon - Sat: 8:00 AM - 6:00 PM</p>
          </Card>
        </div>

        <div className={styles.formColumn}>
          <Card title="Send Us a Message">
            {success ? (
              <div className={styles.successMessage}>
                <h3>Thank you!</h3>
                <p>Your message has been sent successfully. We'll get back to you soon.</p>
                <Button onClick={() => setSuccess(false)} variant="outline">Send Another Message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                  label="Name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="Your Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <div className={styles.textareaWrapper}>
                  <label className={styles.textareaLabel}>Message *</label>
                  <textarea
                    rows="5"
                    className={styles.textarea}
                    placeholder="Tell us what you need..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                <Button type="submit" variant="primary" fullWidth>Submit Message</Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
