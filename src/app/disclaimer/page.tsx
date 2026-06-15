import { siteConfig } from '@/config/site';

export default function DisclaimerPage() {
  return (
    <div className="px-8 py-12 sm:px-10 lg:px-12">
      <h1 className="text-3xl font-bold text-white">Disclaimer</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

      <div className="mt-8 space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white">General Information</h2>
          <p className="mt-2">The information provided on {siteConfig.name} ({siteConfig.url}) is for general educational and entertainment purposes only. While we strive to provide accurate and helpful typing instruction, we make no representations or warranties of any kind about the completeness, accuracy, or reliability of the content.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Typing Speed Claims</h2>
          <p className="mt-2 text-gray-400">Any WPM benchmarks, speed ranges, or percentile estimates shown on {siteConfig.name} are based on commonly cited industry data and should be considered approximate. Individual typing speed depends on many factors including practice history, keyboard familiarity, text complexity, and physical condition.</p>
          <p className="mt-2 text-gray-400">The percentile rankings and speed comparisons on our site are provided as motivational context, not as scientifically validated measurements.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Health and Ergonomics</h2>
          <p className="mt-2 text-gray-400">Our ergonomic typing tips are general suggestions, not medical advice. If you experience pain, numbness, tingling, or discomfort while typing, please consult a qualified healthcare professional. Do not ignore persistent symptoms of repetitive strain injury (RSI).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">External Links</h2>
          <p className="mt-2 text-gray-400">{siteConfig.name} may contain links to external websites, products, or services. We do not endorse, guarantee, or assume responsibility for the content, products, or services offered by third parties. Affiliate links, if present, help support the site at no cost to you.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Data Accuracy</h2>
          <p className="mt-2 text-gray-400">Your typing statistics (WPM, accuracy, etc.) are calculated locally in your browser. While we use industry-standard formulas, results may vary slightly due to browser performance, input latency, and other technical factors.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">No Guarantees</h2>
          <p className="mt-2 text-gray-400">{siteConfig.name} does not guarantee any specific results from using our tools. Improvements in typing speed and accuracy depend on individual effort, consistency, and practice habits.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Contact</h2>
          <p className="mt-2 text-gray-400">Questions about this disclaimer? Email us at contact@freetyper.com.</p>
        </section>
      </div>
    </div>
  );
}
