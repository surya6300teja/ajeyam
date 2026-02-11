const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-[#FBF7F4]">
            <title>Terms of Service | Ajeyam.in</title>
            <meta name="description" content="Read the terms of service for Ajeyam.in — the platform dedicated to Indian history and culture." />

            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-serif font-bold text-amber-900 mb-8 tracking-tight">Terms of Service</h1>
                <p className="text-sm text-gray-500 mb-8">Last updated: February 2026</p>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Ajeyam.in ("the Platform"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use the Platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">2. User Accounts</h2>
                        <p>
                            When creating an account, you agree to provide accurate, current, and complete information.
                            You are responsible for maintaining the confidentiality of your account credentials and for all
                            activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">3. Content Guidelines</h2>
                        <p>
                            Users may submit blog posts and book reviews. All content must be original, factual, and respectful.
                            We reserve the right to review, edit, or remove content that violates our guidelines, including but
                            not limited to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-3">
                            <li>Plagiarized or copyrighted material</li>
                            <li>Hateful, discriminatory, or offensive content</li>
                            <li>Misleading or deliberately false historical claims</li>
                            <li>Spam or promotional content not related to Indian history</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">4. Intellectual Property</h2>
                        <p>
                            You retain ownership of the content you publish on Ajeyam.in. By publishing, you grant us a
                            non-exclusive, worldwide license to display, distribute, and promote your content on our Platform
                            and social media channels.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">5. Disclaimer</h2>
                        <p>
                            The Platform is provided "as is" without warranties of any kind. We do not guarantee the accuracy
                            of user-submitted content. Historical interpretations presented in articles are those of individual
                            authors and do not necessarily represent our views.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">6. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Continued use of the Platform after
                            changes constitutes acceptance of the updated terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">7. Contact</h2>
                        <p>
                            For questions about these terms, please reach out to us at{' '}
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

export default TermsOfService;
