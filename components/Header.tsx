import React from 'react';
import styles from '../styles/Home.module.css';

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>
        Session Management Demo
        <br />
        <span className={styles.gradientText0}>
          <a
            href="https://thirdweb.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            thirdweb
          </a> Smart Accounts (ERC 4337)
        </span>
      </h1>
    </div>
  );
};

export default Header;
