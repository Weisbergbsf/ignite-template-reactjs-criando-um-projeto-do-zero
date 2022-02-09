import { NextApiRequest, NextApiResponse } from 'next';
import url from 'url';

export default function exit(req: NextApiRequest, res: NextApiResponse): void {
  // Exit the current user from "Preview Mode". This function accepts no args.
  res.clearPreviewData();
  const queryObject = url.parse(req.url, true).query;
  const redirectUrl =
    queryObject && queryObject.currentUrl ? queryObject.currentUrl : '/';

  res.writeHead(307, { Location: redirectUrl });
  res.end();
}
