/* eslint-disable @next/next/no-img-element */
import Links from 'app/components/links';

function Header() {
  return (
    <header className="container absolute top-4 flex w-full justify-between border-b border-gray-100/10 pb-2">
      <div className="flex items-end justify-center">
        <div className='flex items-center justify-center'>
          <img
            className="mr-2 w-12"
            src="/images/cavalierslogo.png"
            alt="Blues Cavaliers logo"
          />
          <h1 className="font-sans font-medium text-gray-300 text-sm lg:text-3xl">
            Blues Cavaliers
          </h1>
        </div>
        <h2 className="ml-4 mb-1 text-sm text-white hidden lg:visible">
          Una banda de blues acústico de Madrid
        </h2>
      </div>
      <div className="mr-4">
        <Links />
      </div>
    </header>
  );
}
export default Header;
