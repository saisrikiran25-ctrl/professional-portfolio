import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-zinc-100 font-body py-16 px-6 sm:px-10 lg:px-20 max-w-4xl mx-auto selection:bg-[var(--accent)] selection:text-black">
      
      {/* Header */}
      <div className="mb-12 pb-6 border-b border-[var(--border)]">
        <div className="font-mono text-xs text-[var(--accent)] tracking-[0.2em] uppercase mb-2">
          PROMPTMASTER · LEGAL &amp; DATA GOVERNANCE
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-4">
          Privacy Policy — PromptMaster
        </h1>
        <div className="flex flex-wrap gap-6 font-mono text-xs text-[var(--muted)]">
          <div><strong className="text-zinc-400">Effective date:</strong> 29-08-2026</div>
          <div><strong className="text-zinc-400">Last updated:</strong> 29-08-2026</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8 text-zinc-300 text-sm sm:text-base leading-relaxed">
        
        <p>
          PromptMaster (&ldquo;<strong>PromptMaster</strong>,&rdquo; &ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo; or &ldquo;<strong>our</strong>&rdquo;) is a personal AI-assisted Pinterest content-creation tool. This Privacy Policy explains how we collect, use, store, share, and protect personal data when you use PromptMaster, connect a Pinterest account, generate content, or request the creation of a Pinterest Pin.
        </p>

        <p>
          PromptMaster is designed to help the authorized Pinterest account owner create original visual content, draft Pin metadata, and publish Pins to boards selected by that account owner. PromptMaster does not scrape Pinterest, collect data from other Pinterest users for resale, send unsolicited messages, or publish content without an authorized user request.
        </p>

        <p>
          By using PromptMaster or connecting a Pinterest account, you acknowledge that you have read this Privacy Policy.
        </p>

        {/* Section 1 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            1. Who we are
          </h2>
          <ul className="space-y-1.5 font-mono text-xs sm:text-sm text-zinc-300 mb-4 bg-black/40 p-4 border border-[var(--border)]">
            <li><strong>Service name:</strong> PromptMaster</li>
            <li><strong>Operator / Data Fiduciary / Controller:</strong> Sai Srikiran J</li>
            <li><strong>Website:</strong> <a href="https://saisrikiran25-ctrl.github.io/Portfolio-Website/" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">https://saisrikiran25-ctrl.github.io/Portfolio-Website/</a></li>
            <li><strong>Contact email:</strong> <a href="mailto:jandhyala.saisrikiran25@iimb.ac.in" className="text-[var(--accent)] hover:underline">jandhyala.saisrikiran25@iimb.ac.in</a></li>
            <li><strong>Business address:</strong> Mumbai, Maharashtra</li>
          </ul>
          <p>
            For questions, privacy requests, consent withdrawal, or complaints regarding this Privacy Policy or our processing of personal data, contact us at <a href="mailto:jandhyala.saisrikiran25@iimb.ac.in" className="text-[var(--accent)] font-semibold hover:underline">jandhyala.saisrikiran25@iimb.ac.in</a>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            2. What PromptMaster does
          </h2>
          <p className="mb-4">
            PromptMaster is an AI-assisted content-creation and publishing tool for Pinterest.
          </p>
          <p className="mb-3">When an authorized user asks PromptMaster to create a Pin, the service may:</p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>Accept a topic, keyword, campaign objective, content brief, style instruction, or selected board.</li>
            <li>Generate original image concepts and image prompts.</li>
            <li>Generate or obtain an original image through the configured image-generation service.</li>
            <li>Generate proposed Pin titles, descriptions, keywords, links, and board selections.</li>
            <li>Show a preview or draft to the user when that workflow is enabled.</li>
            <li>Publish a Pin only to the Pinterest account and board authorized by the user.</li>
            <li>Record limited operational information needed to confirm the result, troubleshoot errors, prevent duplicates, and protect the service.</li>
          </ol>
          <p className="mt-4">
            PromptMaster is not intended to impersonate another person, replicate another creator’s work, scrape Pinterest, or automatically copy existing Pins or creators’ content.
          </p>
        </section>

        {/* Section 3 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            3. Personal data we collect
          </h2>
          <p className="mb-4">
            The personal data we collect depends on how you use PromptMaster and the permissions you grant. We collect only the information reasonably necessary to operate, secure, and improve the service.
          </p>

          <h3 className="font-heading text-lg text-white mb-2">3.1 Information you provide directly</h3>
          <p className="mb-2">You may provide:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 mb-6">
            <li>Your name, email address, or contact details if you contact us or create an account.</li>
            <li>Content instructions, prompts, topics, keywords, links, campaigns, descriptions, and other material you submit to request a Pin.</li>
            <li>Your selected Pinterest board or board preferences.</li>
            <li>Your brand and style preferences, such as colors, typography, preferred visual formats, content categories, brand instructions, and example references.</li>
            <li>Feedback, support requests, error reports, and communications you send to us.</li>
          </ul>

          <h3 className="font-heading text-lg text-white mb-2">3.2 Pinterest account and API data</h3>
          <p className="mb-2">
            When you connect Pinterest through Pinterest OAuth, PromptMaster may receive and process data permitted by the Pinterest authorization scopes you approve. Depending on the permissions granted and the enabled features, this may include:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 mb-3">
            <li>Pinterest account identifier and account profile information made available by Pinterest.</li>
            <li>OAuth access tokens and, where issued, refresh tokens.</li>
            <li>Available boards and board identifiers.</li>
            <li>Pin identifiers, Pin metadata, publishing status, and URLs for Pins created through PromptMaster.</li>
            <li>Limited information needed to select a board, create a Pin, confirm that a Pin was created, or troubleshoot a publishing failure.</li>
          </ul>
          <p className="mb-6">
            PromptMaster does not request or use Pinterest permissions beyond what is reasonably necessary for the features you choose to use. If the service only needs to read boards and create Pins, it should not request unrelated permissions.
          </p>

          <h3 className="font-heading text-lg text-white mb-2">3.3 Generated content and operational records</h3>
          <p className="mb-2">To provide the service, PromptMaster may process and retain:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 mb-6">
            <li>Generated images, image-generation prompts, and image files or hosted image URLs.</li>
            <li>Generated Pin titles, descriptions, keywords, destination URLs, board IDs, and publishing timestamps.</li>
            <li>Pin creation results, Pin IDs, Pin URLs, error messages, and logs.</li>
            <li>A limited history of previous requests or published content to avoid accidental duplicate Pins and maintain your workflow preferences.</li>
          </ul>

          <h3 className="font-heading text-lg text-white mb-2">3.4 Technical and security information</h3>
          <p className="mb-2">When you access PromptMaster through a website, app, or integration, we may collect limited technical data such as:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 mb-3">
            <li>IP address.</li>
            <li>Browser type, device type, operating system, and application version.</li>
            <li>Date and time of requests.</li>
            <li>Authentication, security, and audit logs.</li>
            <li>Error logs and performance data.</li>
          </ul>
          <p>
            We use this information for security, reliability, debugging, fraud prevention, and service administration.
          </p>
        </section>

        {/* Section 4 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            4. How we use personal data
          </h2>
          <p className="mb-3">We use personal data only for the following purposes:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 mb-4">
            <li>To authenticate you and connect your authorized Pinterest account.</li>
            <li>To generate requested images, Pin drafts, titles, descriptions, keywords, links, and other Pin metadata.</li>
            <li>To publish a Pin to the Pinterest board you select or authorize.</li>
            <li>To display or return the result of a requested action, including the created Pin URL or publishing status.</li>
            <li>To store and apply your brand, style, board, and workflow preferences when you choose to save them.</li>
            <li>To prevent duplicate publishing, detect errors, maintain records of completed actions, and troubleshoot failures.</li>
            <li>To protect PromptMaster, users, systems, and integrations from unauthorized access, misuse, fraud, or security incidents.</li>
            <li>To comply with legal obligations, enforce our terms, and respond to valid legal requests.</li>
            <li>To communicate with you about support, service notices, security alerts, or privacy requests.</li>
          </ul>
          <p>
            We do not use your Pinterest data, content instructions, generated images, or Pin content to create advertising audiences, sell personal data, or train a public model unless we clearly tell you and obtain any consent required by applicable law.
          </p>
        </section>

        {/* Section 5 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            5. Legal bases and consent
          </h2>
          <p className="mb-3">Where applicable law requires a legal basis for processing, PromptMaster relies on one or more of the following:</p>
          <ul className="list-disc list-inside space-y-2 pl-2 mb-4">
            <li><strong>Your consent:</strong> You authorize Pinterest access through the Pinterest OAuth consent process and request that PromptMaster generate or publish content.</li>
            <li><strong>Performance of a requested service:</strong> Processing is necessary to generate content, connect your account, create a Pin, or provide a feature you request.</li>
            <li><strong>Legitimate interests:</strong> We may process limited technical, security, and diagnostic information to protect the service, prevent abuse, maintain reliability, and resolve errors, where permitted by law.</li>
            <li><strong>Legal obligations:</strong> We may retain or disclose information where required by applicable law.</li>
          </ul>
          <p>
            You may withdraw Pinterest authorization at any time through Pinterest’s account or connected-app settings and may contact us to request removal of stored data, subject to legal and operational retention requirements.
          </p>
        </section>

        {/* Section 6 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            6. Pinterest OAuth and permissions
          </h2>
          <p className="mb-3">
            PromptMaster uses Pinterest OAuth to obtain authorization from the Pinterest account holder. You control whether to connect your account and which permissions you approve.
          </p>
          <p className="mb-2">PromptMaster uses Pinterest access only to perform the authorized features, which may include:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 mb-4">
            <li>Viewing available boards so you can select a destination board.</li>
            <li>Creating Pins with original images and user-authorized metadata.</li>
            <li>Reading the status or identifiers of Pins created through PromptMaster when necessary to confirm publication or troubleshoot an error.</li>
          </ul>
          <p className="mb-3">
            PromptMaster does not receive your Pinterest password. Pinterest manages the authorization process, and PromptMaster receives tokens rather than your password.
          </p>
          <p>
            You can revoke access by removing PromptMaster from your Pinterest-connected applications or authorized apps settings, or by contacting us at <strong>[privacy@your-domain.example]</strong>. Revocation stops future access, but does not automatically delete Pins already published to Pinterest. You remain able to manage or delete published Pins through your Pinterest account.
          </p>
        </section>

        {/* Section 7 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            7. Publishing controls and user authorization
          </h2>
          <p className="mb-3">
            PromptMaster is intended to create and publish Pins only when the authorized account owner requests or confirms the action.
          </p>
          <p className="mb-2">The standard workflow is:</p>
          <ol className="list-decimal list-inside space-y-1.5 pl-2 mb-4">
            <li>You provide a topic, instruction, or content brief.</li>
            <li>PromptMaster generates proposed content.</li>
            <li>You review the generated image and Pin information when a review step is enabled.</li>
            <li>PromptMaster publishes only to the Pinterest account and board you authorize.</li>
            <li>PromptMaster returns the Pin status and, where available, the created Pin URL.</li>
          </ol>
          <p className="mb-3">
            You are responsible for reviewing content before publication, ensuring that you have the rights to use any text, images, links, trademarks, or other materials you provide, and ensuring that your use of PromptMaster and Pinterest complies with applicable law and Pinterest’s policies.
          </p>
          <p>
            PromptMaster does not intentionally publish content without a user request or authorization. If automatic or scheduled publishing is later enabled, it will be clearly described in the service configuration and remain subject to the user’s authorization.
          </p>
        </section>

        {/* Section 8 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            8. Image-generation providers and third parties
          </h2>
          <p className="mb-3">
            PromptMaster may use third-party infrastructure and service providers to operate the service. Depending on the configuration, these providers may include:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 mb-4 font-mono text-xs sm:text-sm">
            <li><strong>Pinterest:</strong> For OAuth authorization, board access, and Pin creation.</li>
            <li><strong>[Image generation provider name]:</strong> To generate original images from user-provided prompts and style instructions.</li>
            <li><strong>[Cloud hosting provider name]:</strong> To host the application, store operational files, and run the service.</li>
            <li><strong>[Cloud storage provider name]:</strong> To temporarily or persistently store generated images, logs, or related content.</li>
            <li><strong>[Analytics provider name, if used]:</strong> To measure site or application performance and improve reliability.</li>
            <li><strong>[Error-monitoring provider name, if used]:</strong> To identify and resolve technical failures.</li>
          </ul>
          <p className="mb-3">
            We disclose or make data available to these providers only as needed for them to perform services on our behalf, subject to appropriate contractual, security, or technical controls where applicable.
          </p>
          <p>
            We do not sell personal data. We do not rent, trade, or disclose your Pinterest account data or generated content to third parties for their independent marketing purposes.
          </p>
        </section>

        {/* Section 9 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            9. Data storage and retention
          </h2>
          <p className="mb-4">
            We retain personal data only for as long as reasonably necessary for the purposes described in this Privacy Policy, including to provide the service, maintain security, resolve disputes, enforce agreements, and comply with legal obligations.
          </p>
          
          <div className="overflow-x-auto mb-4 border border-[var(--border)]">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-black border-b border-[var(--border)] font-mono text-[var(--accent)]">
                  <th className="p-3 border-r border-[var(--border)]">Data category</th>
                  <th className="p-3">Typical retention purpose and period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)] bg-black/40">
                <tr>
                  <td className="p-3 font-semibold text-white border-r border-[var(--border)]">Pinterest OAuth tokens</td>
                  <td className="p-3">Stored only while your account remains connected and only as needed to provide authorized Pinterest features; deleted or disabled when you revoke access or request deletion, subject to limited backup/security retention</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white border-r border-[var(--border)]">Generated images and Pin drafts</td>
                  <td className="p-3">Retained only as long as needed to generate, display, publish, or troubleshoot the requested content, unless you choose to save them</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white border-r border-[var(--border)]">Pin IDs, board IDs, publishing logs, and error logs</td>
                  <td className="p-3">Retained for a limited period necessary to confirm publication, prevent duplicates, troubleshoot issues, maintain security, and meet legal obligations</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white border-r border-[var(--border)]">Style preferences and saved workflow settings</td>
                  <td className="p-3">Retained until you change, delete, or request deletion of those preferences</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white border-r border-[var(--border)]">Support communications</td>
                  <td className="p-3">Retained as necessary to respond to your request, maintain records, and comply with legal obligations</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white border-r border-[var(--border)]">Security and access logs</td>
                  <td className="p-3">Retained for a limited period necessary for security, incident response, auditing, and abuse prevention</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs font-mono text-zinc-400">
            Current configured retention periods, if different from the above, will be stated in the application settings or service documentation.
          </p>
        </section>

        {/* Section 10 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            10. Security
          </h2>
          <p className="mb-3">
            We use reasonable administrative, technical, and organizational safeguards designed to protect personal data against unauthorized access, loss, misuse, alteration, or disclosure.
          </p>
          <p className="mb-2">These safeguards may include:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 mb-4">
            <li>OAuth-based authorization rather than collection of Pinterest passwords.</li>
            <li>Encryption in transit using HTTPS/TLS.</li>
            <li>Restricted access to credentials, tokens, and production systems.</li>
            <li>Secure secret storage where supported by the deployment environment.</li>
            <li>Logging and monitoring for security and operational issues.</li>
            <li>Token rotation, revocation handling, and least-privilege permissions where technically available.</li>
          </ul>
          <p>
            No method of transmission or storage is completely secure. You should protect access to your devices, Pinterest account, and any credentials used to access PromptMaster.
          </p>
        </section>

        {/* Section 11 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            11. Your privacy choices and rights
          </h2>
          <p className="mb-3">Depending on applicable law and your location, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 mb-4">
            <li>Request access to personal data we hold about you.</li>
            <li>Request correction of inaccurate or incomplete personal data.</li>
            <li>Request deletion of personal data, subject to legal and operational exceptions.</li>
            <li>Withdraw consent for future processing where processing is based on consent.</li>
            <li>Revoke Pinterest authorization through Pinterest’s connected-app settings.</li>
            <li>Request restriction of certain processing.</li>
            <li>Object to certain processing where applicable.</li>
            <li>Request a portable copy of certain personal data where applicable.</li>
            <li>Ask questions about our processing practices.</li>
            <li>Lodge a complaint with an applicable data-protection authority.</li>
          </ul>
          <p className="mb-3">
            To exercise these rights, email <strong>[privacy@your-domain.example]</strong> with the subject line <strong>&ldquo;Privacy Request.&rdquo;</strong> Please provide enough information for us to verify the request and locate the relevant data. We may ask for reasonable verification information before completing a request.
          </p>
          <p>
            For users in India, you may also use this contact channel to withdraw consent, seek correction or erasure, request grievance redressal, or obtain information about personal data processing, subject to applicable law.
          </p>
        </section>

        {/* Section 12 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            12. Deleting data and disconnecting Pinterest
          </h2>
          <p className="mb-2">You can stop future Pinterest access at any time by:</p>
          <ol className="list-decimal list-inside space-y-1.5 pl-2 mb-4">
            <li>Removing PromptMaster from your Pinterest account’s authorized or connected applications settings.</li>
            <li>Contacting us at <strong>[privacy@your-domain.example]</strong> and requesting deletion of stored account information, tokens, preferences, generated content, and operational records, where applicable.</li>
            <li>Deleting Pins directly through your Pinterest account if you no longer want published Pins to remain visible on Pinterest.</li>
          </ol>
          <p>
            Disconnecting PromptMaster prevents future API access. It does not automatically delete content already published to Pinterest, because that content is managed through your Pinterest account and Pinterest’s platform.
          </p>
        </section>

        {/* Section 13 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            13. Cookies and analytics
          </h2>
          <p className="mb-3">
            PromptMaster may use essential cookies, local storage, or similar technologies required for authentication, security, session management, preferences, and core service functionality.
          </p>
          <p className="mb-3">
            If we use non-essential cookies, advertising technologies, or analytics that are not strictly necessary for the service, we will provide any notice or obtain any consent required by applicable law.
          </p>
          <p>
            PromptMaster does not use Pinterest account data to build third-party advertising profiles or sell targeted advertising audiences.
          </p>
        </section>

        {/* Section 14 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            14. International data transfers
          </h2>
          <p className="mb-3">
            PromptMaster may use service providers, hosting infrastructure, image-generation services, or cloud storage located in countries other than the country where you live. As a result, your personal data may be processed in jurisdictions with data-protection laws that differ from those in your country.
          </p>
          <p>
            Where required, we will use appropriate safeguards for such transfers, such as contractual commitments, security measures, and other mechanisms recognized by applicable law.
          </p>
        </section>

        {/* Section 15 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            15. Children’s privacy
          </h2>
          <p className="mb-3">
            PromptMaster is not directed to children and is not intended for individuals below the minimum age required to use Pinterest or to consent to data processing under applicable law.
          </p>
          <p>
            We do not knowingly collect personal data from children. If you believe that a child has provided personal data to PromptMaster without appropriate authorization, contact us at <strong>[privacy@your-domain.example]</strong> so we can take appropriate action.
          </p>
        </section>

        {/* Section 16 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            16. Third-party platforms and links
          </h2>
          <p className="mb-3">
            PromptMaster interacts with Pinterest and may include links to Pinterest, image-generation providers, cloud storage services, or other third-party websites.
          </p>
          <p>
            This Privacy Policy applies to PromptMaster only. Third-party platforms have their own policies, terms, and privacy practices. We encourage you to review Pinterest’s Privacy Policy, Developer Terms, and other applicable policies before connecting your Pinterest account.
          </p>
        </section>

        {/* Section 17 */}
        <section className="pt-6 border-t border-[var(--border-light)]">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            17. Changes to this Privacy Policy
          </h2>
          <p className="mb-3">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or service features.
          </p>
          <p>
            When we make material changes, we will update the “Last updated” date and, where required, provide additional notice or obtain consent. Your continued use of PromptMaster after an updated Privacy Policy takes effect means that you acknowledge the updated policy, to the extent permitted by law.
          </p>
        </section>

        {/* Section 18 */}
        <section className="pt-6 border-t border-[var(--border-light)] pb-12">
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide mb-4 text-[var(--accent)]">
            18. Contact and grievance requests
          </h2>
          <p className="mb-3">
            For privacy questions, requests to exercise your rights, withdrawal of consent, data-deletion requests, or grievances, contact:
          </p>
          <ul className="space-y-1.5 font-mono text-xs sm:text-sm text-zinc-300 mb-4 bg-black/40 p-4 border border-[var(--border)]">
            <li><strong>Sai Srikiran J</strong></li>
            <li><strong>Email:</strong> <a href="mailto:jandhyala.saisrikiran25@iimb.ac.in" className="text-[var(--accent)] hover:underline">jandhyala.saisrikiran25@iimb.ac.in</a></li>
            <li><strong>Address:</strong> Mumbai, Maharashtra</li>
            <li><strong>Grievance contact / Data Protection contact:</strong> Sai Srikiran J</li>
            <li><strong>Response target:</strong> We aim to respond within 30 days, or within the period required by applicable law.</li>
          </ul>
          <p>
            If you are dissatisfied with our response, you may have the right to complain to the relevant data-protection authority in your jurisdiction.
          </p>
        </section>

      </div>

    </div>
  );
};

export default Privacy;
