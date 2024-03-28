'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home-page page py-5">
      <div className="container min-h-screen-nav flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 container text-primary-content">
          <div className="col-span-3 lg:pb-[5vh] flex justify-center flex-col items-center">
            <span className="text-3xl lg:text-5xl font-bold ">
              Tokenizer 🎛️
            </span>
            <span className="pt-1 text-gray-300 text-center">
              Start generating your tokens. just a few clicks
            </span>
          </div>
          <Link
            href="/erc20"
            className="card shadow-xl bg-gradient-to-br from-primary to-secondary col-span-3 hover:opacity-90 transition-all"
          >
            <div className="card-body mx-auto">
              <h2>ERC20</h2>
              <p>Token</p>
            </div>
          </Link>

          {/* <Link
            href="/erc721"
            className="card shadow-xl bg-gradient-to-br from-primary to-secondary"
          >
            <div className="card-body">
              <h2>ERC721 &rarr;</h2>
              <p>Non-Fungible Token</p>
            </div>
          </Link>

          <Link
            href="/erc1155"
            className="card shadow-xl bg-gradient-to-br from-primary to-secondary"
          >
            <div className="card-body">
              <h2>ERC1155 &rarr;</h2>
              <p>Multi Token Standard</p>
            </div>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
