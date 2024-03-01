'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="navbar text-gray-400 border-b border-base-100 py-4 ">
      <div className="container mx-auto">
        <div className="flex-1 flex-row flex items-center">
          <Link href="/">
            <img src="/brand.svg" className="h-[25px] lg:h-auto" alt="brand" />
          </Link>
          <div className="w-full text-sm hidden lg:block">
            <Link
              href="/erc20"
              className={`${
                ['/erc20'].includes(pathname) ? 'text-white' : 'text-gray-300'
              } pl-5`}
            >
              ERC20
            </Link>
            {/* <Link
              href="/erc721"
              className={`${
                pathname === '/erc721' ? 'text-white' : 'text-gray-300'
              } pl-5`}
            >
              ERC721
            </Link>
            <Link
              href="/erc1155"
              className={`${
                pathname === '/erc1155' ? 'text-white' : 'text-gray-300'
              } pl-5`}
            >
              ERC1155
            </Link> */}
          </div>
        </div>
        <div>
          <ConnectButton
            chainStatus={{
              smallScreen: 'none',
              largeScreen: 'full',
            }}
          />
        </div>
      </div>
    </div>
  );
}
