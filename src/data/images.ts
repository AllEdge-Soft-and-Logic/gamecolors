import { ColoringImage } from '../types';

export const DEFAULT_IMAGES: string[] = [
  "1.jpg",
  "2.jpg",
  "3.jpg",
  "4.jpg",
  "5.jpg",
  "6.jpg",
  "7.jpg",
  "8.jpg",
  "9.jpg",
  "10.jpg",
  "11.jpg",
  "12.jpg",
  "13.jpg",
  "14.jpg",
  "15.jpg",
  "16.jpg",
  "17.jpg",
  "18.jpg",
  "19.jpg",
  "20.jpg",
  "21.jpg",
  "22.jpg",
  "23.jpg",
  "24.jpg",
  "25.jpg",
  "26.jpg",
  "27.jpg",
  "28.jpg",
  "29.jpg",
  "30.jpg",
  "31.jpg",
  "32.jpg",
  "33.jpg",
  "34.jpg",
  "35.jpg",
  "36.jpg",
  "37.svg",
  "39.jpg",
  "AdobeStock_1957267803.png",
  "vecteezy_black-and-white-cartoon-illustration-of-happy-male-chef_.jpg",
  "vecteezy_children-cooking-in-the-kitchen-black-and-white_.jpg",
  "vecteezy_cute-baby-fawn_23632950.svg",
  "vecteezy_happy-monkey-outline-illustration-for-coloring-book-cute_59249228.jpg",
  "vecteezy_truck-icon-of-a-truck-on-white-background_.jpg"
];

export function formatImageName(file: string): string {
  const base = file.replace(/\.[^.]+$/, '');
  if (/^\d+$/.test(base)) {
    return `Page ${base}`;
  }
  return base
    .replace(/^vecteezy_/, '')
    .replace(/[_-]/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function fetchImages(): Promise<ColoringImage[]> {
  try {
    const res = await fetch('/img/images.json', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((file: string) => ({
          file,
          url: `/img/${encodeURI(file)}`,
          name: formatImageName(file),
        }));
      }
    }
  } catch (err) {
    console.warn('Could not fetch /img/images.json, using defaults:', err);
  }

  return DEFAULT_IMAGES.map((file) => ({
    file,
    url: `/img/${encodeURI(file)}`,
    name: formatImageName(file),
  }));
}
