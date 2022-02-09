/* eslint-disable consistent-return */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from 'react';

import styles from './comments.module.scss';

export function Comments(): JSX.Element {
  useEffect(() => {
    const scriptParentNode = document.getElementById('comments');
    if (!scriptParentNode) return;
    // docs - https://utteranc.es/
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.setAttribute(
      'repo',
      'Weisbergbsf/ignite-template-reactjs-criando-um-projeto-do-zero'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'comment :speech_balloon:');
    script.setAttribute('theme', 'photon-dark');
    script.setAttribute('crossorigin', 'anonymous');

    scriptParentNode.appendChild(script);

    return () => {
      // cleanup - remove the older script with previous theme
      scriptParentNode.removeChild(scriptParentNode.firstChild);
    };
  }, []);

  return <div className={styles.container} id="comments" />;
}
