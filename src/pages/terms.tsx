import React from "react";

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

      <section className="space-y-6 text-base leading-relaxed text-gray-800">
        <div>
          <h2 className="font-semibold text-xl mb-2">1. Use of the Site</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>You must be at least 18 years of age to use this site.</li>
            <li>You agree not to use the site for any unlawful purpose.</li>
            <li>
              You agree not to copy, modify, or distribute any content from the
              site without written permission.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">
            2. Intellectual Property
          </h2>
          <p>
            All content on this site, including text, graphics, logos, and
            images, is the property of the site owner and is protected by
            intellectual property laws. You may not use our trademarks or
            copyrighted content without our prior written consent.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">
            3. User-Generated Content
          </h2>
          <p>
            You retain ownership of any content you submit or upload, but you
            grant us a non-exclusive, worldwide, royalty-free license to use,
            display, and reproduce such content in connection with the service.
            You are responsible for the content you post and must not violate
            any laws or third-party rights.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">
            4. Limitation of Liability
          </h2>
          <p>
            Our site is provided on an "as is" and "as available" basis. We make
            no warranties, express or implied, and disclaim all liability
            arising from your use of the site. We will not be liable for any
            indirect, incidental, or consequential damages resulting from your
            use of the site.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">5. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless the site owner, affiliates,
            and employees from any claims arising from your use of the site or
            your violation of these Terms.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">6. Third-Party Links</h2>
          <p>
            Our site may contain links to third-party websites. We are not
            responsible for the content or practices of those sites.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">7. Termination</h2>
          <p>
            We reserve the right to terminate your access to the site at our
            sole discretion, without notice, for conduct that we believe
            violates these Terms.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">8. Changes to Terms</h2>
          <p>
            We reserve the right to update or modify these Terms at any time.
            Continued use of the site after changes constitutes acceptance of
            the new Terms.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">9. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of [Insert Jurisdiction].
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">10. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at
            [Insert Contact Email].
          </p>
        </div>
      </section>
    </main>
  );
}
