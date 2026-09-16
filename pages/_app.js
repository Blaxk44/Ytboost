import '../styles/globals.css';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV = [
  ['/', '📺 Dashboard'],
  ['/retention', '📉 Retention'],
  ['/abtest', '🧪 A/B Test'],
  ['/repost', '♻️ Repost'],
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <>
      <nav className="nav">
        {NAV.map(([href, label]) => (
          <Link key={href} href={href}
            className={router.pathname === href ? 'active' : ''}>
            {label}
          </Link>
        ))}
      </nav>
      <Component {...pageProps} />
    </>
  );
}
