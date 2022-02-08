/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';

import { FiUser, FiClock } from 'react-icons/fi';
import { AiOutlineCalendar } from 'react-icons/ai';

import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import { formatDate } from '../_utils/formatDate';
import { getEstimatedReadingTime } from '../_utils/getEstimatedReadingTime';

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
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>

      <main className={styles.container}>
        <img src={post.data.banner.url} alt={post.data.title} />
        <article className={styles.post}>
          <h1 className={commonStyles.heading}>{post.data.title}</h1>
          <div className={styles.info}>
            <div>
              <AiOutlineCalendar />
              <time>{formatDate(post.first_publication_date)}</time>
            </div>

            <div>
              <FiUser />
              <span>{post.data.author}</span>
            </div>

            <div>
              <FiClock />
              <span>{getEstimatedReadingTime(post.data.content)}</span>
            </div>
          </div>
          <div className={styles.content}>
            {post.data.content.map(content => {
              return (
                <div key={content.heading}>
                  <h2 className={commonStyles.heading}>{content.heading}</h2>
                  <div
                    className={commonStyles.body}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </div>
              );
            })}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {}
  );

  const slug = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths: slug,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', String(params.slug), {});

  return {
    props: {
      post,
    },
  };
};
