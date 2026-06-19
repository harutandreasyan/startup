import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">CreatorAI</h1>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Create with AI
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Generate stunning images, videos, and 3D models using cutting-edge AI.
          One platform, all creative tools, every device.
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-lg font-medium transition-colors"
        >
          Start Creating — 20 Free Credits
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Image Generation',
              desc: 'Text-to-image with Flux, SDXL, DALL-E and more. From 2 credits.',
            },
            {
              title: 'Video Generation',
              desc: 'Turn text or images into cinematic video clips. From 20 credits.',
            },
            {
              title: '3D Models',
              desc: 'Generate 3D assets from text or images. Export ready. From 10 credits.',
            },
          ].map((f) => (
            <div key={f.title} className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-800 px-8 py-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} CreatorAI. All rights reserved.
      </footer>
    </div>
  );
}
