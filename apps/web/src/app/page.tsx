import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Votexa Intelligence Engine v1.0
        </p>
      </div>

      <div className="flex flex-col items-center">
        <h1 className="text-6xl font-black tracking-tighter mb-4 animate-pulse">
          VOTEXA
        </h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          The world's most robust election assistant, powered by Google Cloud and Antigravity Algorithms.
        </p>
        
        <div className="flex gap-4">
          <Link 
            href="/admin" 
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition"
          >
            Enter Sentinel Admin
          </Link>
          <a 
            href="https://votexa.app" 
            className="px-8 py-3 border border-white font-bold rounded-full hover:bg-white hover:text-black transition"
          >
            Get Mobile App
          </a>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center opacity-50">
        <div>
          <h3 className="font-bold mb-2">99.99% Uptime</h3>
          <p className="text-xs">Cloud Run Scalability</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">0.1ms Latency</h3>
          <p className="text-xs">Redis Memorystore</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">Edge Caching</h3>
          <p className="text-xs">Global CDN Network</p>
        </div>
      </div>
    </main>
  );
}
