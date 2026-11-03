import React, { useState } from 'react';
import {
  Globe,
  Server,
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  FolderArchive,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileCode2,
  Terminal,
  Zap
} from 'lucide-react';

interface HostingerDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const HostingerDeployModal: React.FC<HostingerDeployModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hpanel' | 'fix-error' | 'checklist' | 'vps'>('fix-error');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    onShowToast('📋 Command copied to clipboard!');
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg font-bold">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">
                  Deploy to Hostinger (होस्टिंगर डिप्लॉयमेंट गाइड)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-bold">
                  🚀 Astro Framework Ready
                </span>
              </div>
              <p className="text-xs text-purple-200/70 mt-0.5">
                Hostinger Git Auto-Deploy (Astro) &bull; hPanel File Manager &bull; Node.js
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/70 px-6 pt-3 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('fix-error')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'fix-error'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>⚠️ Fix "Hostinger Deployment Notice" &amp; Zip Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('hpanel')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'hpanel'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Method 1: Ready ZIP &amp; File Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'checklist'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Files &amp; .htaccess Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('vps')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'vps'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Method 2: Node.js / VPS</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto text-xs text-slate-300">
          {/* FIX ERROR TAB */}
          {activeTab === 'fix-error' && (
            <div className="space-y-4">
              {/* Ready-to-download banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-white text-sm">✅ Ready-to-Deploy ZIP तैयार है!</p>
                    <p className="text-emerald-200 text-xs mt-0.5 leading-relaxed">
                      आपको खुद से फाइलें ज़िप करने की आवश्यकता नहीं है। हमने बिल्कुल सही संरचना के साथ <code className="text-white font-mono bg-emerald-900/60 px-1 py-0.5 rounded">dist-deploy.zip</code> बना दिया है।
                    </p>
                  </div>
                </div>
                <a
                  href="/dist-deploy.zip"
                  download="dist-deploy.zip"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition shrink-0 cursor-pointer"
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>📥 Download dist-deploy.zip</span>
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span className="text-base">🚨</span>
                  <span>"Hostinger Deployment Notice" क्यों आ रहा है?</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Hostinger में यह नोटिस तब आता है जब:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 text-[11px]">
                  <li>
                    <strong>कारण 1:</strong> आपकी कम्पाइल की गई <code className="text-amber-300 font-mono">index.html</code> फाइल सीधे <code className="text-white font-mono">public_html</code> में न होकर किसी सब-फोल्डर (जैसे <code className="text-slate-400 font-mono">public_html/dist/</code>) में चली गई है।
                  </li>
                  <li>
                    <strong>कारण 2:</strong> Hostinger का डिफ़ॉल्ट <code className="text-amber-300 font-mono">default.php</code> फाइल अभी भी <code className="text-white font-mono">public_html</code> में मौजूद है।
                  </li>
                  <li>
                    <strong>कारण 3:</strong> ज़िप बनाते समय पूरे <code className="text-slate-400 font-mono">dist</code> फोल्डर को बाहर से ज़िप कर दिया गया, जिससे अंदर <code className="text-slate-400 font-mono">dist/</code> नाम का फोल्डर बन गया।
                  </li>
                </ul>

                <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/20 text-slate-200 space-y-2">
                  <p className="font-bold text-white text-xs">🛠️ Deploy फाइल को सही तरीके से ZIP कैसे करें? (3 आसान स्टेप्स):</p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-300 text-[11px]">
                    <li>
                      <strong>तरीका A (सबसे आसान):</strong> ऊपर दिए गए हरे बटन <strong className="text-emerald-300">"Download dist-deploy.zip"</strong> पर क्लिक करें। यह पहले से 100% सही तरीके से ज़िप की हुई फाइल है।
                    </li>
                    <li>
                      <strong>तरीका B (अपने कंप्यूटर से):</strong>
                      <div className="mt-1 p-2 bg-slate-950 rounded-lg text-slate-300 space-y-1">
                        <p>1. टर्मिनल में चलाएं: <code className="text-emerald-400 font-mono">npm run build</code></p>
                        <p>2. अपने कंप्यूटर पर बने <code className="text-amber-300 font-mono">dist</code> फोल्डर को <strong>खोलें (Open करें)</strong>।</p>
                        <p>3. <strong className="text-white">अंदर की सभी फाइलों को सेलेक्ट करें</strong> (<code className="text-slate-300 font-mono">index.html, _astro, .htaccess, api, index.php</code>)।</p>
                        <p>4. राइट-क्लिक करके <strong className="text-emerald-300">"Compress" या "Add to ZIP"</strong> करें। (⚠️ <em>ध्यान रखें: फोल्डर के अंदर की फाइलों को ज़िप करना है, बाहर से dist फोल्डर को नहीं</em>)।</p>
                      </div>
                    </li>
                    <li>
                      <strong>Hostinger में अपलोड व एक्सट्रैक्ट करें:</strong>
                      <div className="mt-1 p-2 bg-slate-950 rounded-lg text-slate-300 space-y-1">
                        <p>1. Hostinger hPanel &rarr; <strong>File Manager</strong> &rarr; <code className="text-amber-300 font-mono">public_html</code> खोलें।</p>
                        <p>2. अगर वहाँ पहले से <code className="text-rose-400 font-mono">default.php</code> है, तो उसे <strong>डिलीट (Delete)</strong> कर दें।</p>
                        <p>3. <strong>Upload</strong> बटन दबाकर अपनी ZIP फाइल अपलोड करें।</p>
                        <p>4. ZIP फाइल पर राइट-क्लिक करके <strong className="text-emerald-400">Extract</strong> चुनें और पाथ में <code className="text-white font-mono">/public_html</code> रखें।</p>
                        <p>5. एक्सट्रैक्ट होने के बाद अपनी वेबसाइट रिफ्रेश करें, आपका Cavalli Club एडमिन पोर्टल तुरंत लाइव खुल जाएगा!</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div
                  onClick={() => setActiveTab('hpanel')}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/60 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-purple-400" />
                      <span>विस्तृत File Manager स्टेप्स देखें</span>
                    </span>
                    <span className="text-[10px] text-purple-300 font-bold group-hover:translate-x-1 transition">
                      देखें &rarr;
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Hostinger hPanel File Manager में ZIP अपलोड और एक्सट्रैक्ट करने का विस्तृत स्क्रीन-बाय-स्क्रीन गाइड।
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('vps')}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      <span>Node.js / VPS डिप्लॉयमेंट तरीका</span>
                    </span>
                    <span className="text-[10px] text-indigo-300 font-bold group-hover:translate-x-1 transition">
                      देखें &rarr;
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Hostinger Node.js ऐप के लिए Startup file: <code className="text-purple-300">server.js</code>, Node 18+, script: <code className="text-emerald-400">npm start</code>।
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hpanel' && (
            <div className="space-y-4">
              {/* Highlight Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">✅ dist Folder Ready &amp; Pre-Built!</p>
                    <p className="text-slate-300 mt-0.5 leading-relaxed text-xs">
                      Humne aapke liye <code className="text-amber-300 font-mono">dist</code> folder aur ready-to-upload <code className="text-emerald-300 font-mono">dist-deploy.zip</code> bana diya hai.
                    </p>
                  </div>
                </div>
                <a
                  href="/dist-deploy.zip"
                  download="dist-deploy.zip"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition shrink-0"
                >
                  <span>📥 Download dist-deploy.zip</span>
                </a>
              </div>

              {/* Step 1 */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center font-black text-xs">
                      1
                    </span>
                    <span>Generate Production Build (बिल्ड बनाएं)</span>
                  </span>
                  <button
                    onClick={() => handleCopy('npm run build', 'cmd1')}
                    className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200 px-2 py-1 rounded-lg bg-purple-950/80 border border-purple-800"
                  >
                    {copiedCommand === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCommand === 'cmd1' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <p className="text-slate-400">
                  Run this command in your project terminal to generate the compiled <code className="text-amber-300">dist/</code> folder:
                </p>
                <pre className="p-2.5 bg-slate-900 rounded-xl font-mono text-emerald-400 border border-slate-800 select-all">
                  npm run build
                </pre>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center font-black text-xs">
                    2
                  </span>
                  <span>Zip the contents of the `dist` folder</span>
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Open the generated <code className="text-amber-300 font-mono">dist</code> folder on your computer. Select <strong>all files inside it</strong> (<code className="text-slate-300">index.html, assets, .htaccess, api</code>) and right-click to create a <strong>.zip file</strong> (e.g. <code className="text-purple-300 font-mono">dist.zip</code>).
                </p>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px]">
                  ⚠️ <strong>Tip:</strong> Zip the <em>contents inside</em> the dist folder, not the outer folder, so that <code className="font-mono">index.html</code> is directly at the root of the zip.
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center font-black text-xs">
                      3
                    </span>
                    <span>Upload &amp; Extract in Hostinger File Manager</span>
                  </span>
                  <a
                    href="https://hpanel.hostinger.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200 underline"
                  >
                    <span>Open Hostinger hPanel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                  <li>Log in to <strong className="text-white">Hostinger hPanel</strong> &rarr; Click <strong className="text-white">Websites</strong> &rarr; <strong className="text-white">Manage</strong>.</li>
                  <li>Click <strong className="text-white">File Manager</strong> on the left side menu.</li>
                  <li>Open the <strong className="text-amber-300 font-mono">public_html</strong> directory.</li>
                  <li>Click the <strong className="text-white">Upload</strong> icon, select your zip file, and upload it.</li>
                  <li>Right-click the uploaded zip file &rarr; select <strong className="text-emerald-400">Extract</strong> to <code className="font-mono">/public_html</code>.</li>
                  <li>Delete the zip file after extracting.</li>
                </ol>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                    4
                  </span>
                  <span>Enable Free Lifetime SSL &amp; Force HTTPS</span>
                </span>
                <p className="text-slate-400 leading-relaxed">
                  In Hostinger hPanel &rarr; go to <strong className="text-white">Security &rarr; SSL</strong> &rarr; install the free Let&apos;s Encrypt SSL certificate and turn on <strong className="text-emerald-400">Force HTTPS</strong>.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-slate-950 rounded-2xl border border-emerald-500/30 space-y-2">
                <span className="font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Step 5: You&apos;re Live! (वेबसाइट लाइव हो गई)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Visit your domain in any browser. Log in as Admin with your phone (<code className="text-amber-300 font-mono">9781395857</code>) and enter your Fast2SMS API key in the top bar. Your WhatsApp OTP &amp; SMS services are now 100% active on Hostinger!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-purple-400" />
                  <span>Required Files Structure in Hostinger `public_html/`</span>
                </h3>
                <p className="text-slate-400">
                  Ensure the following files are present directly inside your Hostinger <code className="text-amber-300 font-mono">public_html</code> folder:
                </p>

                <div className="p-3.5 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300 space-y-1.5 border border-slate-800">
                  <div className="flex items-center gap-2 text-white">
                    <span>📁 public_html/</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-emerald-400">
                    <span>├── .htaccess</span>
                    <span className="text-[10px] text-slate-400">Handles React routing, SPA refresh, Gzip</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-purple-300">
                    <span>├── index.html</span>
                    <span className="text-[10px] text-slate-400">Main application HTML entry point</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-slate-300">
                    <span>├── robots.txt</span>
                    <span className="text-[10px] text-slate-400">Search engine guidelines</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-amber-300">
                    <span>├── assets/</span>
                    <span className="text-[10px] text-slate-400">Compiled JS bundle, CSS stylesheets</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-teal-300">
                    <span>└── api/send-otp.php</span>
                    <span className="text-[10px] text-slate-400">Fast2SMS PHP proxy (prevents CORS)</span>
                  </div>
                </div>
              </div>

              {/* Troubleshooting FAQ */}
              <div className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Important Hostinger Tips</span>
                </h4>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-semibold text-white">Why is .htaccess necessary?</p>
                  <p className="text-slate-400 text-[11px]">
                    Without <code className="text-purple-300">.htaccess</code>, if you refresh any page other than home, Hostinger returns a 404 error. The included <code className="text-purple-300">.htaccess</code> file routes all paths cleanly to React.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-semibold text-white">Does Hostinger support PHP for Fast2SMS?</p>
                  <p className="text-slate-400 text-[11px]">
                    Yes! All Hostinger plans have PHP 8.x enabled by default. The included <code className="text-emerald-300 font-mono">api/send-otp.php</code> script forwards your Fast2SMS requests server-side, eliminating browser CORS blocks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vps' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Hostinger Linux VPS Deployment Commands</span>
                </h3>
                <p className="text-slate-400">
                  If you are using a Hostinger Ubuntu/Debian VPS with Nginx or Apache:
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">1. Build and copy to Nginx root:</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          'npm run build && sudo cp -r dist/* /var/www/html/ && sudo systemctl reload nginx',
                          'vps_cmd'
                        )
                      }
                      className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200 px-2 py-0.5 rounded bg-purple-950 border border-purple-800"
                    >
                      {copiedCommand === 'vps_cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCommand === 'vps_cmd' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-xl font-mono text-emerald-400 text-[11px] overflow-x-auto border border-slate-800 select-all">
{`npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Detailed markdown guide saved in <code className="text-purple-300">HOSTINGER_DEPLOYMENT_GUIDE.md</code></span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs transition"
            >
              Close
            </button>
            <a
              href="https://hpanel.hostinger.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition"
            >
              <span>Go to Hostinger hPanel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
