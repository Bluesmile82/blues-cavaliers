import Links from '#/src/app/components/links';

function Header() {
  return (
    // fixed so the name and links stay reachable while scrolling the bio;
    // the blurred band keeps them readable over the scrolling text
    <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-background/80 to-background/0 backdrop-blur-[2px]">
      <div className="container mx-auto flex items-center justify-between gap-2 border-b border-gray-100/10 px-4 py-3">
        {/* the video opens on the band logo, so the name lives up here */}
        <h1 className="font-['Ayer_Poster'] whitespace-nowrap text-2xl font-bold sm:text-3xl leading-none tracking-[0.02em] text-white lg:text-6xl">
          BLUES CAVALIERS
        </h1>
        <Links />
      </div>
    </header>
  );
}
export default Header;
