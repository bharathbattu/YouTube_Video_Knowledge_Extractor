/**
 * 404 Not Found Page
 */

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-20"></div>
          <div className="relative text-9xl font-black text-primary/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl"> </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Page Not Found
          </h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="shadow-lg hover:shadow-primary/25 transition-all">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
