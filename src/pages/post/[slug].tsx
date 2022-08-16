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
import Link from "next/link";
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { ButtonModoPreview } from "../../components/ButtonModoPreview";

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

interface PostPagination{
  next: {
    uid: string;
    title: string
  };
  last: {
    uid: string;
    title: string
  };
}

interface PostProps {
  post: Post;
  postNextAndLast: PostPagination;
}



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Post({post, postNextAndLast}: PostProps ) {
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
        <div className={commonStyles.container}>
          
        <section className={styles.container}>
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
          <footer className={styles.rodape}>
            <header className={styles.footerPages}>
              <div className={styles.pages}>
                <h3>{postNextAndLast.last.title}</h3>
                <Link href={`/post/${postNextAndLast.last.uid}`}>
                  Post anterior
                </Link>
              </div>
              <div className={styles.pages}>
                <h3>{postNextAndLast.next.title}</h3>
                <Link href={`/post/${postNextAndLast.next.uid}`}>
                  Próximo post
                </Link>
              </div>
            </header>
            
            <div className={styles.containerForm}>
              <div className={styles.containerButtonsOptions}>
                <button type="button" className={`${styles.buttonOption} ${styles.active}`}>Write</button>
                <button type="button" className={styles.buttonOption}>Write</button>
              </div>
             
              <form className={styles.form}>
                <textarea className={styles.textarea} placeholder="Sign in  to comment" />
              </form>
              <div className={styles.sign}>
                <span>Styling with Markdown is supported</span>
                <button type="button">Sign in with github</button>
              </div>
            </div>
            <ButtonModoPreview/>
          </footer>
         
        </div>       
        
        
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

  const postsPagination = await prismic.getByType('posts', {
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc'
    },
  })
 
  // eslint-disable-next-line consistent-return, array-callback-return
  let pages;
  const numberArrayPosts = postsPagination.results.findIndex(post => slug === post.uid)
  const postNextAndLast = {
    next: numberArrayPosts === postsPagination.results.length - 1 
      ? { uid: postsPagination.results[0].uid, title: postsPagination.results[0].data.title }
      : { uid: postsPagination.results[numberArrayPosts + 1].uid, title: postsPagination.results[numberArrayPosts + 1].data.title },
    last: numberArrayPosts === 0 
      ? {uid: postsPagination.results[postsPagination.results.length - 1].uid, title: postsPagination.results[postsPagination.results.length - 1].data.title} 
      : {uid: postsPagination.results[numberArrayPosts - 1].uid, title: postsPagination.results[numberArrayPosts - 1].data.title}
  }


console.log(postsPagination.results)
 console.log(postNextAndLast);

  const post = {
    ...response
  }
  return {
    props: {
      post,
      postNextAndLast
    },
    revalidate: 1
  }
};
