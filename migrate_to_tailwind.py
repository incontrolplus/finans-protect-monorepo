import re
import os

def migrate_to_tailwind():
    for filename in ['index.html', 'docs.html']:
        path = os.path.join('website', filename)
        if not os.path.exists(path):
            continue
            
        with open(path, 'r', encoding='utf-8') as f:
            html = f.read()

        # 1. Inject Tailwind CDN before </head> if not present
        if 'cdn.tailwindcss.com' not in html:
            tailwind_script = '<script src="https://cdn.tailwindcss.com"></script>\n  <script>\n    tailwind.config = {\n      darkMode: "class",\n      theme: {\n        extend: {\n          colors: {\n            brand: {\n              50: "#eff6ff",\n              100: "#dbeafe",\n              500: "#3b82f6",\n              600: "#2563eb",\n              900: "#1e3a8a",\n            }\n          }\n        }\n      }\n    }\n  </script>\n</head>'
            html = html.replace('</head>', tailwind_script)

        # 2. Add base body classes
        html = re.sub(r'<body([^>]*)>', r'<body\1 class="bg-[#0b0f19] text-gray-200 antialiased font-sans min-h-screen flex flex-col selection:bg-brand-500 selection:text-white">', html)

        # 3. Navbar
        html = html.replace('class="navbar"', 'class="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0b0f19]/80 backdrop-blur-lg border-b border-gray-800/60"')
        html = html.replace('class="nav-brand"', 'class="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 hover:to-white transition-all"')
        html = html.replace('class="nav-links"', 'class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300"')
        html = html.replace('class="nav-actions"', 'class="flex items-center gap-4"')

        # 4. Buttons
        html = html.replace('class="btn btn-primary"', 'class="px-5 py-2.5 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-300 active:scale-95"')
        html = html.replace('class="btn btn-secondary"', 'class="px-5 py-2.5 rounded-lg font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white border border-gray-700 transition-all duration-300 active:scale-95"')
        html = html.replace('class="btn btn-primary btn-sm"', 'class="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 transition-colors"')
        html = html.replace('class="btn btn-secondary btn-sm"', 'class="px-3 py-1.5 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"')

        # 5. Sections and containers
        html = html.replace('class="hero"', 'class="relative pt-32 pb-20 px-6 text-center max-w-5xl mx-auto"')
        html = html.replace('class="features-grid"', 'class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 py-12"')
        
        # 6. Feature Cards
        html = html.replace('class="feature-card"', 'class="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:-translate-y-2 hover:bg-gray-800/50 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group"')
        
        # 7. Architecture section
        html = html.replace('class="architecture-container"', 'class="max-w-6xl mx-auto p-6 md:p-12 bg-gray-900/30 border border-gray-800 rounded-3xl my-16 shadow-2xl"')

        # 8. Footer
        html = html.replace('class="site-footer"', 'class="mt-auto border-t border-gray-800 bg-[#070a11] pt-16 pb-8"')
        html = html.replace('class="footer-container"', 'class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12"')
        html = html.replace('class="footer-col"', 'class="flex flex-col gap-4"')
        html = html.replace('class="footer-bottom"', 'class="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4"')

        # 9. Modals and forms
        html = html.replace('class="modal-backdrop"', 'class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4 opacity-0 transition-opacity"')
        html = html.replace('class="modal-dialog"', 'class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl scale-95 transition-transform"')
        html = html.replace('class="form-control"', 'class="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"')
        html = html.replace('class="form-group"', 'class="mb-4"')

        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)

    # Empty out standard CSS so Tailwind takes over completely, 
    # except for absolute essential canvas/simulator styling that Tailwind can't easily express
    with open('website/css/style.css', 'w', encoding='utf-8') as f:
        f.write('''/* Tailwind handles layout & styling. This file only contains exceptions. */
#simulator {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid #1e293b;
}
#topology-canvas {
  width: 100%;
  height: 400px;
  display: block;
}
''')

migrate_to_tailwind()
print("Migration to Tailwind complete.")
