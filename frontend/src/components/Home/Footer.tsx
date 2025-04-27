import { FaTwitter } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full md:w-[90%] mx-auto py-12 rounded-tl-4xl rounded-tr-4xl bg-gradient-to-r from-green-500 to-green-900 text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="relative w-8 h-8 mr-2">
                <Image
                  src="/images/swastify-logo.png"
                  alt="Swastify Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">Swastify</span>
            </div>
            <p className="text-white/80">
              Where Healthcare Meets Innovation. <br /> Building solutions to
              real healthcare problems.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.linkedin.com/company/getswastify/"
                target="_blank"
                rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white hover:bg-white/10">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Button>
              </Link>
              <Link
                href="https://x.com/getswastify/"
                target="_blank"
                rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white hover:bg-white/10">
                  <FaTwitter className="h-5 w-5" />
                  <span className="sr-only">X (formerly Twitter)</span>
                </Button>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white/80 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/mission"
                  className="text-white/80 hover:text-white transition-colors">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/80 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-white/80 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-white/80 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* <div>
            <h3 className="text-white font-medium mb-4">Stay Updated</h3>
            <p className="text-white/80 mb-4">Subscribe to our newsletter for the latest healthcare solutions.</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/20 border-white/30 focus:border-white focus:ring-white/20 text-white placeholder:text-white/70"
              />
              <Button
                className={`${
                  isDark
                    ? "bg-light-green hover:bg-light-green/90 text-zinc-900"
                    : "bg-white hover:bg-white/90 text-deep-green"
                } font-medium transition-all duration-200`}
              >
                Subscribe
              </Button>
            </div>
          </div> */}
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-center items-center">
          <p className="text-white/70 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Swastify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
