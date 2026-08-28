/* eslint-disable @next/next/no-img-element */
import Links from '#/src/app/components/links';

function Header() {
  return (
    // z-20: above the foreground vinyl canvas (z-10 in background/index.tsx),
    // otherwise its full-screen <canvas> intercepts every click before it
    // reaches the Facebook/Instagram/media-kit links below.
    <header className="container absolute top-4 z-20 flex w-full justify-between border-b border-gray-100/10 pb-2">
      <div className="flex items-end justify-center">
        {/* <div className="flex items-center justify-center">
          <img
            className="mr-2 w-12"
            src="/images/cavalierslogo.png"
            alt="Blues Cavaliers logo"
          />
        </div> */}
        <h2 className="ml-4 mb-1 hidden text-sm text-white lg:visible">
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
