import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="error-page">
      <p className="eyebrow">404</p>
      <h1>Nothing here.</h1>
      <p>The page you requested could not be found.</p>
      <Link className="button" href="/">
        Return home
      </Link>
    </section>
  );
}
