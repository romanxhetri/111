
import React from 'react';

export default function Footer(): React.ReactElement {
  return (
    <footer className="bg-green-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold text-orange-400 mb-4">Potato & Friends</h3>
            <p className="text-green-200">Deliciously Loaded, Faithfully Fresh.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Menu</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">About Us</a></li>
              <li><a href="#contact-section" className="hover:text-orange-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-lg">Contact Us</h4>
            <p className="text-green-200">123 Potato Lane, Foodie City</p>
            <p className="text-green-200">contact@potatoandfriends.com</p>
            <p className="text-green-200">(123) 456-7890</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-lg">Follow Us</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              {/* Placeholder for social icons */}
              <a href="#" className="hover:text-orange-400 transition-colors">FB</a>
              <a href="#" className="hover:text-orange-400 transition-colors">IG</a>
              <a href="#" className="hover:text-orange-400 transition-colors">TW</a>
            </div>
          </div>
        </div>
        <div className="border-t border-green-700 mt-8 pt-6 text-center text-sm text-green-300">
          <p>&copy; {new Date().getFullYear()} Potato & Friends. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}