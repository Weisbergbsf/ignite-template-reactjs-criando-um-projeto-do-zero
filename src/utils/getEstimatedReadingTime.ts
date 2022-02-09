interface ContentProps {
  heading: string;
  body: {
    text: string;
  }[];
}

export function getEstimatedReadingTime(content: ContentProps[]): string {
  const regex = /[^\w]/;

  const countWordsContent = content.reduce((acc, current) => {
    const totalWordsHeading = current.heading?.split(regex).length ?? 0;

    const totalWordsBody = current.body.reduce((accBody, currentBody) => {
      return accBody + currentBody.text?.split(regex).length ?? 0;
    }, 0);

    return acc + totalWordsHeading + totalWordsBody;
  }, 0);

  return `${Math.round(countWordsContent / 200)} min`;
}
