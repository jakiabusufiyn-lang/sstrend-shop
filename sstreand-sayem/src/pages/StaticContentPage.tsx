import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, ShieldCheck, Truck, RefreshCw, Send } from 'lucide-react';

interface StaticContentPageProps {
  pageType: 'about' | 'contact' | 'faq' | 'shipping' | 'return' | 'privacy' | 'terms';
  onNavigate: (path: string) => void;
}

export const StaticContentPage: React.FC<StaticContentPageProps> = ({ pageType, onNavigate }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSubmitted(false);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* ABOUT US */}
      {pageType === 'about' && (
        <div className="space-y-8">
          <div className="text-center space-y-2 border-b border-[#E8DFD8] pb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold">The Heritage</span>
            <h1 className="font-editorial text-4xl font-bold text-stone-900">About SSTREAND SHOP</h1>
            <p className="text-sm text-stone-500 max-w-xl mx-auto">
              Curated authentic beauty, radiant skincare, luxury handbags, and comfortable women’s fashion for modern Bangladesh.
            </p>
          </div>

          <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-5 leading-relaxed font-sans">
            <p>
              Founded in 2026, <strong>SSTREAND SHOP</strong> was created to redefine luxury shopping in Bangladesh. We bridge the gap between premium global ateliers in China and modern Bangladeshi women seeking 100% authentic, dermatologically verified radiant skincare and effortlessly sophisticated fashion silhouettes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
              <div className="p-4 bg-white rounded-lg border border-[#EFE8E2] text-center space-y-1">
                <ShieldCheck className="w-6 h-6 text-[#C5A059] mx-auto" />
                <h4 className="font-editorial font-bold text-stone-900">Direct Atelier Source</h4>
                <p className="text-xs text-stone-500">Every piece is verified for authentic origin and safety.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-[#EFE8E2] text-center space-y-1">
                <Truck className="w-6 h-6 text-[#C5A059] mx-auto" />
                <h4 className="font-editorial font-bold text-stone-900">Nationwide Express</h4>
                <p className="text-xs text-stone-500">Fast 24-48 hour delivery in Dhaka and all 64 districts.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-[#EFE8E2] text-center space-y-1">
                <RefreshCw className="w-6 h-6 text-[#C5A059] mx-auto" />
                <h4 className="font-editorial font-bold text-stone-900">Doorstep Exchange</h4>
                <p className="text-xs text-stone-500">7-day size and shade exchange guarantee.</p>
              </div>
            </div>

            <p>
              Our flagship experience studio is located in Banani, Dhaka, supported by a specialized logistics fulfillment hub ensuring direct quality inspection before packaging.
            </p>
          </div>
        </div>
      )}

      {/* CONTACT US */}
      {pageType === 'contact' && (
        <div className="space-y-8">
          <div className="text-center space-y-2 border-b border-[#E8DFD8] pb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold">Get In Touch</span>
            <h1 className="font-editorial text-4xl font-bold text-stone-900">Contact SSTREAND Concierge</h1>
            <p className="text-sm text-stone-500">We are delighted to assist with shade matching, sizing, and order delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Details */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[#EFE8E2] space-y-4 text-xs">
                <h3 className="font-editorial text-lg font-bold text-stone-900">Banani Showroom</h3>
                <div className="space-y-3 text-stone-600">
                  <p className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                    <span>Level 4, House 12, Road 11, Banani, Dhaka-1213, Bangladesh</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span>+880 1711-223344 (Hotline & WhatsApp)</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span>concierge@sstreand.com</span>
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF0EE] p-5 rounded-xl border border-[#E8DFD8] text-xs space-y-1">
                <span className="font-bold text-stone-900">Concierge Hours:</span>
                <p className="text-stone-600">Saturday to Thursday: 10:00 AM – 10:00 PM</p>
                <p className="text-stone-600">Friday: 2:30 PM – 10:00 PM</p>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#EFE8E2] shadow-2xs">
              <h3 className="font-editorial text-lg font-bold text-stone-900 mb-4">Send a Message</h3>
              {contactSubmitted && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded">
                  Thank you! Your inquiry has been sent to our Banani concierge team.
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Email or Phone</label>
                  <input
                    type="text"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Inquiry / Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1C1917] text-white uppercase tracking-wider font-semibold rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {pageType === 'faq' && (
        <div className="space-y-8">
          <div className="text-center space-y-2 border-b border-[#E8DFD8] pb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold">Assistance</span>
            <h1 className="font-editorial text-4xl font-bold text-stone-900">Frequently Asked Questions</h1>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Are your beauty and skincare products 100% authentic?',
                a: 'Yes, absolutely. SSTREAND SHOP imports directly from certified laboratories and ateliers. Every batch undergoes verified packaging, seal verification, and expiration date checks.',
              },
              {
                q: 'What are the delivery charges and delivery times in Bangladesh?',
                a: 'Delivery inside Dhaka is ৳70 (typically arriving within 24 to 48 hours). Delivery to all other 63 districts is ৳130 (arriving within 2 to 4 days). All orders over ৳3,000 enjoy 100% FREE delivery nationwide.',
              },
              {
                q: 'Can I pay via Cash on Delivery (COD)?',
                a: 'Yes! We support Cash on Delivery across all 64 districts in Bangladesh. You may inspect the outer package before paying the courier.',
              },
              {
                q: 'How does bKash / Nagad payment work?',
                a: 'You can choose bKash or Nagad during checkout, make the payment to our official merchant account (01711223344), and provide your Transaction ID (TrxID) for immediate verification.',
              },
              {
                q: 'What is your exchange policy if a dress does not fit?',
                a: 'We offer an easy 7-day size or color exchange. Simply contact our concierge at +880 1711-223344 or WhatsApp us, and we will arrange a courier doorstep exchange.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-[#EFE8E2] space-y-1.5 shadow-2xs">
                <h4 className="font-editorial text-base font-bold text-stone-900">{faq.q}</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHIPPING POLICY */}
      {pageType === 'shipping' && (
        <div className="space-y-6">
          <h1 className="font-editorial text-3xl font-bold text-stone-900">Shipping & Delivery Policy</h1>
          <div className="text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed font-sans bg-white p-6 sm:p-8 rounded-xl border border-[#EFE8E2]">
            <p>At SSTREAND SHOP, we partner with premier Bangladesh couriers (including RedX, Pathao Express, and Steadfast) to guarantee secure, rapid delivery.</p>
            <h4 className="font-bold text-stone-900 text-sm">Delivery Rates & Timeline:</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Inside Dhaka Metro:</strong> ৳70 flat fee. Delivery within 24 to 48 hours.</li>
              <li><strong>Outside Dhaka (All 63 Districts):</strong> ৳130 flat fee. Delivery within 2 to 4 working days.</li>
              <li><strong>Free Shipping:</strong> Automatically applied to all orders with a subtotal of ৳3,000 or above.</li>
            </ul>
            <p>Every shipment is assigned a tracking number. You can monitor progress on our Track Order page at any time.</p>
          </div>
        </div>
      )}

      {/* RETURN & REFUND POLICY */}
      {pageType === 'return' && (
        <div className="space-y-6">
          <h1 className="font-editorial text-3xl font-bold text-stone-900">Return & Exchange Policy</h1>
          <div className="text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed font-sans bg-white p-6 sm:p-8 rounded-xl border border-[#EFE8E2]">
            <p>We want you to feel radiant and fully confident with every purchase from SSTREAND SHOP.</p>
            <h4 className="font-bold text-stone-900 text-sm">7-Day Exchange Window:</h4>
            <p>Items may be exchanged within 7 days of receiving your parcel. For skincare and cosmetics, the safety seals must be intact and unopened due to hygiene regulations. For dresses and handbags, items must be unworn with all brand tags attached.</p>
            <h4 className="font-bold text-stone-900 text-sm">How to Initiate an Exchange:</h4>
            <p>Contact our concierge at <strong>+880 1711-223344</strong> or via WhatsApp. Our courier will deliver the replacement and collect the original item at your doorstep.</p>
          </div>
        </div>
      )}

      {/* PRIVACY POLICY */}
      {pageType === 'privacy' && (
        <div className="space-y-6">
          <h1 className="font-editorial text-3xl font-bold text-stone-900">Privacy Policy</h1>
          <div className="text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed font-sans bg-white p-6 sm:p-8 rounded-xl border border-[#EFE8E2]">
            <p>SSTREAND SHOP respects and protects customer privacy. Customer contact numbers, delivery addresses, and order histories are stored securely on our protected server database and are never sold or shared with unauthorized third parties.</p>
            <p>Customer passwords are encrypted with industry-standard cryptographic salts. Payment transactions are processed directly through verified Bangladeshi payment providers.</p>
          </div>
        </div>
      )}

      {/* TERMS & CONDITIONS */}
      {pageType === 'terms' && (
        <div className="space-y-6">
          <h1 className="font-editorial text-3xl font-bold text-stone-900">Terms & Conditions</h1>
          <div className="text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed font-sans bg-white p-6 sm:p-8 rounded-xl border border-[#EFE8E2]">
            <p>By placing an order on SSTREAND SHOP, you agree to our purchasing and delivery terms. All prices are stated in Bangladeshi Taka (BDT ৳) and include applicable local taxes.</p>
            <p>Orders are subject to inventory verification. In the rare event of inventory exhaustion, customer service will notify the buyer immediately.</p>
          </div>
        </div>
      )}
    </div>
  );
};
