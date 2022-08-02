/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
import { FiCalendar, FiUser } from "react-icons/fi";

import ptBR from "date-fns/locale/pt-BR"
import { GetStaticProps,  } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link'
import { format } from 'date-fns';
import Head from 'next/head';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';



interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Home({postsPagination} : HomeProps) {
  const [postResults, setPostResults] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');
  const {next_page, results} = postsPagination;

  useEffect(() => {
    const newPost = results.map(response => {
      return {
        ...response,
        first_publication_date: format(new Date(response.first_publication_date), 'd LLL u', {locale: ptBR})
      }
    })
    setPostResults([...postResults,...newPost]);
    setNextPage(next_page);
  }, [])


  function carregar(){
    fetch(nextPage)
    .then((response) => response.json())
    .then((data) => {
      const newValuePost = data.results.map(restulsPublication => {
          return {
            ...restulsPublication,
            first_publication_date: format(new Date(restulsPublication.first_publication_date), 'd LLL u', {locale: ptBR})
          }
        })
      setPostResults([
        ...postResults, 
        ...newValuePost, 
      ])
      setNextPage(data.next_page)
    });
  }
  return(
    <>
    <Head>
      <title>Home</title>
    </Head>
      <main className={commonStyles.container}>
        {postResults.map(post => {
          return(
            <Link key={post.uid} href={`/post/${post.uid}`}>
            <section className={styles.content} key={post.uid}>
              <h2 className={commonStyles.title}>{post.data.title}</h2>
              <p className={commonStyles.subtitle}>{post.data.subtitle}</p>
              <div className={commonStyles.infoContainer}>
                <div className={commonStyles.info}>
                  <FiCalendar/>
                  <span>{post.first_publication_date}</span>
                </div>
                <div className={commonStyles.info}>
                  <FiUser/>
                  <span>{post.data.author}</span>
                </div>
              
              </div>
            </section> 
            </Link>
          )
        })}

        {nextPage ? (<button type="button" className={styles.buttonLoading} onClick={()=> {carregar()}}>Carregar mais posts</button>) : ''}
      </main>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getStaticProps: GetStaticProps = async () => {
  const prismic =  getPrismicClient({
      accessToken: process.env.PRISMIC_ACCESS_TOKEN
  });
  const postsPagination = await prismic.getByType('posts', {
    pageSize: 1
  })

 
  return{
    props:{
      postsPagination
    }
  }
};
