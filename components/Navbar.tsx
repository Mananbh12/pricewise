import React from 'react'
import Link from 'next/link'

const navIcons = [
  { src: '/assets/icons/search.svg', alt: 'search' },
  { src: '/assets/icons/black-heart.svg', alt: 'heart' },
  { src: '/assets/icons/user.svg', alt: 'user' }
]

export function Navbar() {
  return (
    <header className='w-full'>
      <nav className='nav'>
        <Link href="/" className="flex items-center gap-1">
          <img
            src="/assets/icons/logo.svg"
            width={27}
            height={27}
            alt="logo"
          />
          <p>
            Price<span className='text-primary'>Wise</span>
          </p>
        </Link>
        <div className='flex items-center gap-5'>
          {navIcons.map((icon) => (
            <img
              key={icon.alt}
              src={icon.src}
              alt={icon.alt}
              width={28}
              height={28}
              className='object-contain'
            />
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
