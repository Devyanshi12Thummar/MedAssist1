import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">MedAssist</h3>
            <p className="text-gray-300 text-sm">
              Providing quality healthcare services and management solutions for better patient care.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-300 hover:text-white text-sm">About Us</a></li>
              <li><a href="/services" className="text-gray-300 hover:text-white text-sm">Services</a></li>
              <li><a href="/doctors" className="text-gray-300 hover:text-white text-sm">Our Doctors</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white text-sm">Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="/appointments" className="text-gray-300 hover:text-white text-sm">Appointments</a></li>
              <li><a href="/emergency" className="text-gray-300 hover:text-white text-sm">Emergency Care</a></li>
              <li><a href="/online-consultation" className="text-gray-300 hover:text-white text-sm">Online Consultation</a></li>
              <li><a href="/pharmacy" className="text-gray-300 hover:text-white text-sm">Pharmacy Services</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="block">123 Healthcare Street</span>
                <span className="block">Medical District, City 12345</span>
              </p>
              <p className="text-gray-300">
                <span className="block">Email: info@medassist.com</span>
                <span className="block">Phone: (123) 456-7890</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} MedAssist. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="/privacy" className="text-sm text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="/terms" className="text-sm text-gray-400 hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
