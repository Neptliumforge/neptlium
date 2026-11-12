import { permanentRedirect } from 'next/navigation';

// `/about` is a legacy alias classified as a permanent redirect in the public route policy.
export default function AboutPage() {
  permanentRedirect('/company');
}
