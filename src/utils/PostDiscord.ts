/* eslint-disable no-console */
import fetch from 'cross-fetch';

// ** Webhook Body Helper ** //
const params = (content: string) => JSON.stringify({
  username: 'YOBOT SEARCHER',
  avatar_url: '',
  content,
});

// ** Helper function to send discord notification ** //
const postDiscord = async (url: string, body: string) => {
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: params(body),
    });
    console.log('Sent Discord Notification:', body);
  } catch (e) {
    console.error('Failed to send discord notification!', e);
  }
};

export default postDiscord;
