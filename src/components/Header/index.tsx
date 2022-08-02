/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.container}>
      <Link href="/">
        <img className={styles.logo} src="/image/logo.svg" alt="logo" />
      </Link>
      
    </header>
  );
}
