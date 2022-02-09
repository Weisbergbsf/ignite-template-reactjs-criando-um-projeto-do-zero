/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';

import { FiUser, FiClock } from 'react-icons/fi';
import { AiOutlineCalendar } from 'react-icons/ai';

import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import { formatDate } from '../../utils/formatDate';
import { getEstimatedReadingTime } from '../../utils/getEstimatedReadingTime';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Comments } from '../../components/Comments';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  prevPost: Post;
  nextPost: Post;
  preview: boolean;
}

export default function Post({
  post,
  prevPost,
  nextPost,
  preview,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>

      <img src={post.data.banner.url} alt={post.data.title} />
      <main>
        <article className={styles.post}>
          <h1 className={commonStyles.heading}>{post.data.title}</h1>
          <div className={styles.info}>
            <div>
              <AiOutlineCalendar />
              <time>{formatDate({ date: post.first_publication_date })}</time>
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
          {post.first_publication_date !== post.last_publication_date && (
            <time>
              {formatDate({
                date: post.last_publication_date,
                mask: "'* editado em' dd MMM yyyy, 'às' hh:mm",
              })}
            </time>
          )}
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
      <footer className={styles.footer}>
        <div className={styles.pagination}>
          {prevPost && (
            <div>
              <h3>{prevPost.data.title}</h3>
              <Link href={`/post/${prevPost.uid}`}>
                <a>Post anterior</a>
              </Link>
            </div>
          )}
          {nextPost && (
            <div>
              <h3>{nextPost.data.title}</h3>
              <Link href={`/post/${nextPost.uid}`}>
                <a>Próximo post</a>
              </Link>
            </div>
          )}
        </div>

        <Comments />

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </footer>
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', String(params.slug), {
    ref: previewData?.ref ?? null,
  });

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: post.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: post.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  return {
    props: {
      post,
      prevPost: prevPost?.results[0] ?? null,
      nextPost: nextPost?.results[0] ?? null,
      preview,
    },
  };
};
