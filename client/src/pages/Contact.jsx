import { Link } from 'react-router-dom';

const Contact = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">M+</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800">MediCare+</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
                        <Link to="/about" className="text-gray-600 hover:text-blue-600">About</Link>
                        <Link to="/contact" className="text-blue-600 font-semibold">Contact</Link>
                    </div>

                    <div className="flex space-x-4">
                        <Link to="/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            Login
                        </Link>
                        <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Register
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main */}
            <main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-10 space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
                        <p className="mt-4 text-gray-600">
                            Have questions? We’re here to help.
                        </p>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            type="text"
                            placeholder="Your Name"
                            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="email"
                            placeholder="Your Email"
                            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            placeholder="Your Message"
                            rows="5"
                            className="md:col-span-2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                        <button
                            type="submit"
                            className="md:col-span-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            Send Message
                        </button>
                    </form>

                    <div className="text-center text-gray-600">
                        <p>Email: <span className="font-semibold">contact@medicare-plus.bf</span></p>
                        <p>Phone: <span className="font-semibold">+226 00 00 00 00</span></p>
                        <p>Location:Ouagadougou ,Burkina Faso</p>
                    </div>
                </div>
            </main>

             {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">M+</span>
                                </div>
                                <span className="text-xl font-bold text-white">MediCare+</span>
                            </div>
                            <p className="text-gray-400">
                                Your health, our priority. A modern platform to manage your medical care.
                            </p>
                        </div>

                        {/* Navigation */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Navigation</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/" className="hover:text-white transition">
                                        Home
                                    </Link>
                                </li>
                               
                                <li>
                                    <Link to="/about" className="hover:text-white transition">
                                        About
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Portals */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Portals</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/login" className="hover:text-white transition">
                                        Patient Portal
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="hover:text-white transition">
                                        Doctor Portal
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Contact</h3>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <a href="tel:+33123456789" className="hover:text-white transition">
                                        +226 00 00 00 00
                                    </a>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <a href="mailto:contact@medicare-plus.fr" className="hover:text-white transition">
                                        contact@medicare-plus.bf
                                    </a>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>ouagadougou, Burkina Faso</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>© 2026 MediCare+. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Contact;
