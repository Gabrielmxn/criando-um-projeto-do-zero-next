/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';

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
    setPostResults([...postResults,...results]);
    setNextPage(next_page);
  }, [postsPagination])


  function carregar(){
    fetch(nextPage)
    .then((response) => response.json())
    .then((data) => {
      setPostResults([...postResults, ...data.results])
      setNextPage(data.next_page)
    });
  }
  return(
    <>
      {postResults.map(post => {
        return(
          <section className={styles.uid} key={post.uid}>
            <h2 className={styles.title}>{post.data.title}</h2>
            <p className={styles.subtitle}>{post.data.subtitle}</p>
            <div className={styles.info}>
              <span>{post.data.author}</span>
              <span>{post.first_publication_date}</span>
            </div>
          </section> 
        )
      })}

      <button type="button" onClick={()=> {carregar()}}>Pega</button>
   </>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getStaticProps = async () => {
  const prismic =  getPrismicClient({
      accessToken: process.env.PRISMIC_ACCESS_TOKEN
  });
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results
  }
  console.log(postsResponse,process.env.PRISMIC_ACCESS_TOKEN, process.env.PRISMIC_API_ENDPOINT );
  return{
    props:{
      postsPagination
    }
  }
};
