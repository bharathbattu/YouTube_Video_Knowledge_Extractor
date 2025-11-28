/**
 * Home Page - Server Component
 * YouTube Video Knowledge Extractor main landing page
 */

import { VideoForm } from '@/components';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 text-gray-900">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            YouTube Video Knowledge Extractor
          </h1>
          <p className="text-lg text-gray-600">
            Paste a YouTube link and convert it into clear learning notes
          </p>
        </header>

        {/* Form - Client Component */}
        <VideoForm />

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-200">
          <Feature
            icon="📝"
            title="Key Points"
            description="Get 5-10 bullet points summarizing the main ideas"
          />
          <Feature
            icon="📖"
            title="Detailed Summary"
            description="Comprehensive overview of the video content"
          />
          <Feature
            icon="🎯"
            title="AI Powered"
            description="Uses advanced AI to extract knowledge"
          />
        </section>
      </div>
    </main>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

