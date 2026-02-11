import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="min-h-screen bg-[#FBF7F4]">
            <title>About Us | Ajeyam.in</title>
            <meta name="description" content="Learn about Ajeyam — a digital platform dedicated to exploring and celebrating the rich history, heritage, and culture of India." />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 text-white py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('/patterns/kolam.svg')]"></div>
                </div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl font-serif font-bold mb-6 tracking-tight">Our Story</h1>
                    <p className="text-xl text-amber-100 leading-relaxed max-w-2xl mx-auto">
                        Unraveling the History of India, One Story at a Time
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Mission Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-serif font-bold text-amber-900 mb-6">What is Ajeyam?</h2>
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                        <p>
                            <strong className="text-amber-900">Ajeyam</strong> (meaning "invincible" in Sanskrit) is a digital platform
                            dedicated to exploring and celebrating the rich history, heritage, and culture of the Indian subcontinent.
                            We believe that understanding our past is key to shaping a better future.
                        </p>
                        <p>
                            From the ancient civilizations of the Indus Valley to the independence movement that shaped modern India,
                            our writers bring you carefully researched, engaging stories that make history accessible and exciting for everyone.
                        </p>
                    </div>
                </section>

                {/* Values Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-serif font-bold text-amber-900 mb-8">Our Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-amber-900 mb-2">Authentic Research</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Every article is backed by thorough research from credible historical sources and academic references.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-amber-900 mb-2">Community Driven</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                We welcome writers and history enthusiasts from all backgrounds to contribute and share their knowledge.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-amber-900 mb-2">Accessible History</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                We make Indian history engaging and accessible through compelling storytelling and modern presentation.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Connect Section */}
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 text-center">
                    <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">Connect With Us</h2>
                    <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                        Follow us on social media to stay updated with our latest articles, book reviews, and more.
                    </p>
                    <div className="flex justify-center items-center space-x-6">
                        <a href="https://www.instagram.com/ajeyam_speaks" target="_blank" rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-amber-900 hover:text-amber-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            <span className="font-medium">Instagram</span>
                        </a>
                        <a href="https://www.facebook.com/AjeyamSpeaks" target="_blank" rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-amber-900 hover:text-amber-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                            </svg>
                            <span className="font-medium">Facebook</span>
                        </a>
                        <a href="https://x.com/ajeyam_speaks" target="_blank" rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-amber-900 hover:text-amber-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span className="font-medium">Twitter / X</span>
                        </a>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center mt-16">
                    <p className="text-gray-600 mb-6">Want to share your knowledge of Indian history?</p>
                    <Link
                        to="/create-blog"
                        className="inline-flex items-center justify-center px-8 py-3 bg-amber-900 text-white font-medium rounded-full hover:bg-amber-800 transition-colors shadow-lg"
                    >
                        Start Writing
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default About;
