"use client";

import { motion } from "framer-motion";
import { Sparkles, Share2, MessageCircle, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#2D2424] text-white pt-16 pb-8 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FBC7D4] to-[#D4A373] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="font-display font-semibold text-lg text-white tracking-tight">HAI-AI</span>
            </div>
            <p className="text-sm text-white/60 max-w-xs leading-relaxed">
              AI automation built for beauty salons, aesthetic clinics, and wellness studios. Your virtual admin, working 24/7.
            </p>
            <div className="flex gap-3 mt-6">
              {[Share2, MessageCircle, Send].map((Icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(251,199,212,0.2)" }}
                  className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer transition-colors duration-200"
                >
                  <Icon className="w-4 h-4 text-white/60" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Product</h4>
            <ul className="flex flex-col gap-3">
              {["Features", "How It Works", "Pricing", "Roadmap", "Book Demo"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/50 hover:text-white/90 transition-colors duration-200 cursor-pointer">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Company</h4>
            <ul className="flex flex-col gap-3">
              {["About Us", "Blog", "Privacy Policy", "Terms of Service", "Contact"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/50 hover:text-white/90 transition-colors duration-200 cursor-pointer">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} HAI-AI. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Designed for beauty, powered by AI. Made with love. 🌸
          </p>
        </div>
      </div>
    </footer>
  );
}
