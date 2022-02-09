import { useState } from 'react';
import { GetStaticProps } from 'next';

import Head from 'next/head';
import Link from 'next/link';
import { AiOutlineCalendar } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../utils/formatDate';
import { postDTO } from '../utils/postDTO';

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
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const loadMorePosts = async (): Promise<void> => {
    await fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const postsLoaded = data.results.map(post => postDTO(post));
        setPosts(prevState => [...prevState, ...postsLoaded]);
        setNextPage(data.next_page);
      })
      .catch(() => setPosts([]));
  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <main className={styles.container}>
        {posts.map(post => {
          return (
            <article className={styles.post} key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <h1 className={commonStyles.heading}>{post.data.title}</h1>
                </a>
              </Link>
              <p className={commonStyles.body}>{post.data.subtitle}</p>
              <footer className={styles.info}>
                <div>
                  <AiOutlineCalendar />
                  <time>
                    {formatDate({ date: post.first_publication_date })}
                  </time>
                </div>
                <div className={styles.author}>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </footer>
            </article>
          );
        })}
        {nextPage && (
          <button onClick={loadMorePosts} type="button">
            Carregar mais posts
          </button>
        )}
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = true,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );
  const results = postsResponse.results.map(post => postDTO(post));

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
      preview,
    },
  };
};
