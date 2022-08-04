/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */

import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichTextField } from "@prismicio/types"
import { format } from 'date-fns';
import { PrismicRichText } from "@prismicio/react";
import PrismicDom from 'prismic-dom'
import { useEffect, useState } from "react";
import ptBR from "date-fns/locale/pt-BR";
import { useRouter } from "next/router";
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: RichTextField;
    }[];
  };
}

interface PostProps {
  post: Post;
}



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Post({post}: PostProps ) {
  const router = useRouter()
  const [time, setTime] = useState(0)
  const [publicPost, setPublicPost] = useState<Post>({
    first_publication_date: new Date().toString(),
    data: {
      title: '',
      banner: {
        url: ''
      },
      author: '',
      content: [{
        heading: '',
        body: [],
      }]
  
    }
  }) 
  if(router.isFallback){
    return(
      <>
        <h1>Carregando...</h1>
      </>
    )
  // eslint-disable-next-line no-else-return
  }
 // eslint-disable-next-line react-hooks/rules-of-hooks
 useEffect(() => {
  const newPost = {
    ...post,
    first_publication_date: format(new Date(post.first_publication_date), 'd LLL u', {locale: ptBR}),
  }
  setPublicPost(newPost);
  

  const palavras = newPost.data.content.map(response => {
    return [
      ...response.heading.split(/[*.\n*\s]+/gm),
      ...PrismicDom.RichText.asText(response.body).split(/[*.\n\s]+/gm),
      
    ].length
  })

  const totalPalavras = palavras.reduce((acc, prox) => {
    // eslint-disable-next-line no-param-reassign
    return acc += prox
  })

  const timeTotal = Math.ceil(totalPalavras / 200)
  setTime(timeTotal)
 }, [post])

 
    return(
      <>
      <Head>
        <title>Post | {publicPost.data.title}</title>
      </Head>
      <main>
          <img
            className={styles.banner} 
            src={publicPost.data.banner.url}
            alt="" 
          />       
        <section className={`${commonStyles.container} ${styles.container}`}>
          <h1 className={styles.title}>{publicPost.data.title}</h1>
          <footer className={commonStyles.infoContainer}>
            <div className={commonStyles.info}>
            
              <FiCalendar />
              <span>{publicPost.first_publication_date}</span>
            </div>
            <div className={commonStyles.info}>
              <FiUser />
              <span>{publicPost.data.author}</span>
            </div>
            <div className={commonStyles.info}>
              <FiClock />
              <span>{time} min</span>
            </div>
          </footer>
        </section>
          {post.data.content.map(group => {
            return(
              <section key={group.heading} className={`${styles.containerText} ${commonStyles.container}`}>
                
                <h2 className={commonStyles.subtitle}>{group.heading}</h2>
                <PrismicRichText field={group.body} />
              </section>
            
            )
            
          })}
        
      </main>
      </>
    )
  
  
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  });
  const posts = await prismic.getByType('posts');
  const pageStatic = posts.results.map(post => {
    return {
      params:{
        slug: post.uid
      }
    }
  })
  return {
    paths: [
      ...pageStatic 
    ],
    fallback: true,
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getStaticProps: GetStaticProps = async ({params }) => {
  const {slug} = params
  const prismic = getPrismicClient({
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  });

  const response = await prismic.getByUID('posts', slug as string);

  const post = {
    ...response
  }
  return {
    props: {
      post
    },
    revalidate: 1
  }
};
