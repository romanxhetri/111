
import React from 'react';

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
);


export default function ContactSection(): React.ReactElement {
    // A placeholder address that will resolve on Google Maps for demonstration
    const mapQuery = "747 Howard St, San Francisco, CA 94103";
    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <section id="contact-section" className="bg-white py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">Visit Us</h2>
                    <p className="text-lg text-gray-600">We can't wait to serve you!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="rounded-lg shadow-2xl overflow-hidden h-96">
                        <iframe
                            src={mapSrc}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Restaurant Location"
                        ></iframe>
                    </div>

                    <div className="space-y-6">
                         <div className="flex items-center">
                            <LocationIcon />
                            <div>
                                <h3 className="text-xl font-bold text-green-800">Address</h3>
                                <p className="text-gray-600">123 Potato Lane, Foodie City, FC 45678</p>
                                <p className="text-sm text-gray-500">(Location shown on map is a placeholder)</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <MailIcon />
                            <div>
                                <h3 className="text-xl font-bold text-green-800">Email</h3>
                                <a href="mailto:contact@potatoandfriends.com" className="text-gray-600 hover:text-orange-600 transition-colors">contact@potatoandfriends.com</a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <PhoneIcon />
                            <div>
                                <h3 className="text-xl font-bold text-green-800">Phone</h3>
                                <a href="tel:123-456-7890" className="text-gray-600 hover:text-orange-600 transition-colors">(123) 456-7890</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
