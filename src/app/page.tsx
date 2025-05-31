import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to PNG Gallery</h1>
      <div className="space-y-4">
        <p className="text-xl text-gray-600">
          Upload and manage your PNG images
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/admin"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Admin
          </Link>
          <Link
            href="/gallery"
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            View Gallery
          </Link>
        </div>
      </div>
    </div>
  );
} 