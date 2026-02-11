const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-[#FBF7F4]">
            <title>Privacy Policy | Ajeyam.in</title>
            <meta name="description" content="Read the privacy policy for Ajeyam.in — how we collect, use, and protect your data." />

            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-serif font-bold text-amber-900 mb-8 tracking-tight">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-8">Last updated: February 2026</p>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">1. Information We Collect</h2>
                        <p>When you create an account or use Ajeyam.in, we may collect:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-3">
                            <li>Your name, email address, and profile information</li>
                            <li>Content you publish (blog posts, book reviews, comments)</li>
                            <li>Usage data such as pages visited and actions taken</li>
                            <li>Device and browser information for analytics purposes</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-3">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Personalize your experience on the Platform</li>
                            <li>Send you updates about new content and features (with your consent)</li>
                            <li>Ensure the security and integrity of the Platform</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">3. Data Sharing</h2>
                        <p>
                            We do not sell or share your personal information with third parties for marketing purposes.
                            We may share data with service providers who help us operate the Platform (e.g., hosting, analytics)
                            under strict data protection agreements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">4. Cookies</h2>
                        <p>
                            We use essential cookies to maintain your session and preferences. Analytics cookies may be used
                            to understand how visitors interact with our Platform. You can manage cookie preferences in your
                            browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">5. Data Security</h2>
                        <p>
                            We employ industry-standard security measures to protect your data. However, no method of
                            transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-3">
                            <li>Access the personal data we hold about you</li>
                            <li>Request correction or deletion of your data</li>
                            <li>Withdraw consent for data processing</li>
                            <li>Request a copy of your data in a portable format</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">7. Contact</h2>
                        <p>
                            For privacy-related questions, please contact us at{' '}
                            <a href="mailto:contact@ajeyam.in" className="text-amber-800 hover:text-amber-700 font-medium">
                                contact@ajeyam.in
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
