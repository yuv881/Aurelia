import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 mt-auto">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">A</span>
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-gray-900">
                                Aurelia
                            </span>
                        </Link>
                        <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
                            Experience the intersection of luxury and everyday convenience. We deliver premium goods designed to elevate your daily life.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 border border-gray-200 rounded-full text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 border border-gray-200 rounded-full text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 border border-gray-200 rounded-full text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-colors">
                                <Github className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-5">Shop</h3>
                        <ul className="space-y-4">
                            <li><Link to="/shop" className="text-gray-500 hover:text-blue-600 transition-colors">All Products</Link></li>
                            <li><Link to="/category/electronics" className="text-gray-500 hover:text-blue-600 transition-colors">Electronics</Link></li>
                            <li><Link to="/category/fashion" className="text-gray-500 hover:text-blue-600 transition-colors">Fashion</Link></li>
                            <li><Link to="/offers" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                                Special Offers
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                            </Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-5">Company</h3>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="text-gray-500 hover:text-blue-600 transition-colors">About Us</Link></li>
                            <li><Link to="/careers" className="text-gray-500 hover:text-blue-600 transition-colors">Careers</Link></li>
                            <li><Link to="/blog" className="text-gray-500 hover:text-blue-600 transition-colors">Blog</Link></li>
                            <li><Link to="/contact" className="text-gray-500 hover:text-blue-600 transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div className="lg:col-span-1">
                        <h3 className="font-semibold text-gray-900 mb-5">Stay Updated</h3>
                        <p className="text-gray-500 mb-4 text-sm">
                            Subscribe to our newsletter for the latest products and exclusive updates.
                        </p>
                        <form className="relative" onSubmit={(e) => e.preventDefault()}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                required
                            />
                            <button
                                type="submit"
                                className="absolute inset-y-0 right-0 px-3 flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Aurelia E-Commerce. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link to="/privacy" className="text-gray-400 hover:text-gray-900 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-gray-400 hover:text-gray-900 transition-colors">Terms of Service</Link>
                        <Link to="/shipping" className="text-gray-400 hover:text-gray-900 transition-colors">Shipping Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;