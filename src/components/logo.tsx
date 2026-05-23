import Image from 'next/image';
import logoDark from '@/src/assets/logo-dark.png';
import logoLight from '@/src/assets/logo-light.png';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="py-3">
      <div className="block dark:hidden">
        <Image
          src={logoDark}
          alt="Logo"
          width={140}
          className="h-auto w-35"
          priority
        />
      </div>
      <div className="hidden dark:block">
        <Image
          src={logoLight}
          alt="Logo"
          width={140}
          className="h-auto w-35"
          priority
        />
      </div>
    </Link>
  );
}
