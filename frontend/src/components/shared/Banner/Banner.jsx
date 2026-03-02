import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Banner = ({ slides = [] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const activeSlides = slides.length > 0 ? slides : [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
            title: "Summer Collection 2026",
            subtitle: "Discover the latest trends in fashion and accessories. Get up to 50% off.",
            buttonText: "Shop Collection"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
            title: "Premium Electronics",
            subtitle: "Upgrade your lifestyle with our curated tech gadgets.",
            buttonText: "View Deals"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
            title: "Exclusive Designer Wear",
            subtitle: "Step out in style with our new arrivals.",
            buttonText: "Explore Now"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [activeSlides.length]);

    const nextSlide = () => {
        setCurrentSlide(currentSlide === activeSlides.length - 1 ? 0 : currentSlide + 1);
    };

    const prevSlide = () => {
        setCurrentSlide(currentSlide === 0 ? activeSlides.length - 1 : currentSlide - 1);
    };

    if (activeSlides.length === 0) return null;

    return (
        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl group shadow-sm mb-12">
            <div
                className="flex transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {activeSlides.map((slide) => (
                    <div key={slide.id} className="min-w-full h-full relative">
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" />

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg transform translate-y-4 animate-fade-in-up">
                                {slide.title}
                            </h2>
                            <p className="text-sm sm:text-lg lg:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-md">
                                {slide.subtitle}
                            </p>
                            <button className="px-8 py-3 sm:py-4 bg-white text-gray-900 hover:bg-gray-100 font-semibold rounded-full transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95">
                                {slide.buttonText}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white text-white hover:text-gray-900 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white text-white hover:text-gray-900 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
                {activeSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 rounded-full ${currentSlide === index
                            ? "w-8 h-2 bg-white"
                            : "w-2 h-2 bg-white/50 hover:bg-white/80"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Banner;