import styles from './buttonModoPreview.module.scss';

export function ButtonModoPreview(): JSX.Element {
  return (
    <button type="button" className={styles.modoPreview}>
      Sair do modo Preview
    </button>
  );
}
