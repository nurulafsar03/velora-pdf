/* ============================================================
   VeloraPDF Blog — post data
   ============================================================
   Add a new post by copying the TEMPLATE block below into the
   VELORA_BLOG_POSTS array and filling it in. No HTML needed —
   just plain text. Write in any language; RTL (ur/ar) is handled
   automatically by blog-post.html based on the `lang` field.

   TEMPLATE (copy this):
   {
     slug: 'a-short-url-safe-slug',       // used in the URL: blog-post.html?slug=...
     lang: 'bn',                          // 'bn' | 'en' | 'de' | 'hi' | 'ur' | 'ar'
     date: '2026-08-14',                  // YYYY-MM-DD, used for sorting (newest first)
     tag: 'Guide',                        // optional short label shown on the card
     title: 'The post title (shown as H1)',
     subject: 'One or two sentences summarizing the post. Shown on the blog listing card and used as the page meta description.',
     sections: [
       { type: 'h2', text: 'A section heading' },
       { type: 'p', text: 'A paragraph of body text.' },
       { type: 'h3', text: 'A sub-heading, nested under the h2 above' },
       { type: 'p', text: 'Another paragraph.' },
       { type: 'ul', items: ['A bullet point', 'Another bullet point'] },
       { type: 'callout', text: 'A highlighted/boxed note for emphasis.' },
     ],
     conclusion: 'An optional closing paragraph, rendered slightly styled at the end of the post.',
   },
   ============================================================ */

window.VELORA_BLOG_POSTS = [
  {
    slug: 'kano-highlight-underline-sob-pdf-e-kaj-kore-na',
    lang: 'bn',
    date: '2026-08-14',
    tag: 'গাইড',
    title: 'প্রতিটা PDF-এ Highlight/Underline কেন কাজ করে না?',
    subject: 'VeloraPDF-এর Highlight, Underline, আর Strikethrough টুল কিছু PDF-এ কাজ করে, কিছুতে করে না — এটা বাগ না, এটা PDF ফাইলের নিজের গঠনের একটা মৌলিক পার্থক্যের ফল।',
    sections: [
      {
        type: 'p',
        text: 'VeloraPDF-এর Edit PDF টুলে Highlight, Underline, আর Strikethrough — এই তিনটা টুল দিয়ে আপনি PDF-এর যেকোনো টেক্সট মাউস দিয়ে সিলেক্ট করে সরাসরি মার্ক করতে পারেন। বেশিরভাগ ক্ষেত্রেই এটা নিখুঁতভাবে কাজ করে। কিন্তু মাঝেমধ্যে দেখা যায় — একটা PDF খুলে টেক্সটের উপর মাউস ড্র্যাগ করলেও কিছুই সিলেক্ট হচ্ছে না। এটা বাগ না — এটা PDF ফাইলের নিজের গঠনের একটা মৌলিক পার্থক্যের ফল।',
      },
      { type: 'h2', text: 'দুই ধরনের PDF' },
      {
        type: 'p',
        text: 'সব PDF দেখতে একইরকম মনে হলেও, ভেতরে দুই সম্পূর্ণ ভিন্ন উপায়ে তৈরি হতে পারে।',
      },
      {
        type: 'h3',
        text: 'প্রথম ধরন — আসল টেক্সটসহ PDF',
      },
      {
        type: 'p',
        text: 'Word, Google Docs, বা যেকোনো ওয়ার্ড প্রসেসর থেকে যখন আপনি "Save as PDF" বা "Export to PDF" করেন, তখন প্রতিটা অক্ষর PDF ফাইলের ভেতরে আসল টেক্সট ডেটা হিসেবে সংরক্ষিত থাকে — ঠিক যেমন একটা ওয়েবপেজে লেখা টেক্সট থাকে। এই ধরনের PDF-এ আপনি মাউস দিয়ে টেক্সট সিলেক্ট করতে পারেন, কপি-পেস্ট করতে পারেন, আর সার্চ করতে পারেন।',
      },
      {
        type: 'h3',
        text: 'দ্বিতীয় ধরন — স্ক্যান করা বা ছবি-ভিত্তিক PDF',
      },
      {
        type: 'p',
        text: 'যখন একটা কাগজের ডকুমেন্ট স্ক্যানার বা ফোনের ক্যামেরা দিয়ে PDF বানানো হয়, তখন প্রতিটা পেজ আসলে একটা ছবি — একদম আপনার ফোনে তোলা কোনো JPG-এর মতো। এই ছবির মধ্যে মানুষের চোখে টেক্সট দেখা যায় ঠিকই, কিন্তু PDF ফাইলের ভেতরে কোনো "অক্ষর" বলে কিছু সংরক্ষিত নেই — শুধু pixel-এর সমষ্টি। এই ধরনের PDF-এ আপনি টেক্সট সিলেক্ট করতে পারবেন না, কপি করতে পারবেন না, এমনকি Ctrl+F দিয়ে সার্চও করতে পারবেন না — Adobe Acrobat, Chrome, বা যেকোনো PDF viewer-এই না, শুধু VeloraPDF-এ না।',
      },
      { type: 'h2', text: 'এটা কীভাবে বুঝবেন' },
      {
        type: 'p',
        text: 'সহজ একটা পরীক্ষা: PDF-টা খুলে যেকোনো লাইনের উপর মাউস দিয়ে ড্র্যাগ করে দেখুন।',
      },
      {
        type: 'ul',
        items: [
          'টেক্সট নীল হয়ে সিলেক্ট হলে — এটা আসল টেক্সটসহ PDF। Highlight/Underline/Strikethrough সরাসরি কাজ করবে।',
          'কিছুই সিলেক্ট না হলে (পুরো পেজটাই যেন একটা ছবি) — এটা স্ক্যান করা/ছবি-ভিত্তিক PDF।',
        ],
      },
      { type: 'h2', text: 'ছবি-ভিত্তিক PDF-এ তাহলে কী করবেন' },
      {
        type: 'p',
        text: 'VeloraPDF-এর Edit PDF টুলে Area Highlight নামে আরেকটা টুল আছে, যেটা টেক্সট সিলেক্ট করার উপর নির্ভর করে না। এটা দিয়ে আপনি ম্যানুয়ালি একটা রঙিন, স্বচ্ছ (semi-transparent) বক্স এঁকে যেকোনো জায়গায় বসাতে পারেন — মার্কার দিয়ে হাইলাইট করার মতোই দেখতে, শুধু জায়গাটা নিজে হাতে ঠিক করে দিতে হয়। এটা টেক্সট-ভিত্তিক না হওয়ায় স্ক্যান করা PDF সহ যেকোনো PDF-এই কাজ করে।',
      },
      {
        type: 'callout',
        text: 'সংক্ষেপে: PDF-টা "আসল টেক্সট" নাকি "স্ক্যান করা ছবি" — সেটা নির্ধারণ করে Highlight/Underline/Strikethrough কাজ করবে কিনা। আসল টেক্সট হলে সরাসরি সিলেক্ট করে মার্ক করুন। ছবি হলে Area Highlight ব্যবহার করুন।',
      },
      { type: 'h2', text: 'কেন এটা নিজে থেকে ঠিক হয়ে যায় না' },
      {
        type: 'p',
        text: 'এই আচরণটা আসলে ব্রাউজারের সীমাবদ্ধতা না — এটা সমস্যার ধরনের পার্থক্য। "একটা ছবিতে কোন অক্ষর কোথায় আছে" বের করা একটা আলাদা কাজ, যাকে বলে OCR (Optical Character Recognition)। PDF রেন্ডার করা লাইব্রেরি আর OCR ইঞ্জিন — দুটো সম্পূর্ণ ভিন্ন প্রযুক্তি, একটা আরেকটার বদলি না। ছবি-ভিত্তিক PDF-এ টেক্সট সিলেক্ট করা সম্ভব করতে হলে আলাদা করে একটা OCR ইঞ্জিন যোগ করতে হবে, যেটা ভবিষ্যতে যোগ হতে পারে।',
      },
    ],
    conclusion: 'তাহলে পরের বার কোনো PDF-এ Highlight কাজ না করলে, বুঝে নিন — এটা স্ক্যান করা একটা ফাইল। Area Highlight টুলটা ব্যবহার করুন, কাজ হয়ে যাবে।',
  },
];
