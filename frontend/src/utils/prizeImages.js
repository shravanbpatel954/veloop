import iphone from '../assets/images/prize-iphone.webp';
import watch from '../assets/images/prize-watch.webp';
import airpods from '../assets/images/prize-airpods.webp';
import amazon2000 from '../assets/images/prize-amazon-2000.webp';
import amazon500 from '../assets/images/prize-amazon-500.webp';
import amazon20 from '../assets/images/prize-amazon-20.webp';
import heroGift from '../assets/images/hero-gift.webp';
import heroTicket from '../assets/images/hero-ticket.webp';
import giftDark from '../assets/images/gift-dark.webp';

/** The API sends an `imageKey`; this map turns it into a bundled asset. */
const PRIZE_IMAGES = {
  iphone,
  watch,
  airpods,
  'amazon-2000': amazon2000,
  'amazon-500': amazon500,
  'amazon-20': amazon20,
};

export const getPrizeImage = (imageKey) => PRIZE_IMAGES[imageKey] ?? giftDark;

export const artwork = { heroGift, heroTicket, giftDark };
