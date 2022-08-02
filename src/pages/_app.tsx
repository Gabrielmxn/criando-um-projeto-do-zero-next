/* eslint-disable prettier/prettier */
import { PrismicProvider } from '@prismicio/react'
import { AppProps } from 'next/app';
import Header from '../components/Header';
import '../styles/globals.scss';


function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <PrismicProvider>
      <Header />
      <Component {...pageProps} />
    </PrismicProvider>
  );
}

export default MyApp;
