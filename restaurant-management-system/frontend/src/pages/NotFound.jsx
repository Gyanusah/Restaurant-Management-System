// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NotFound = () => {
  const [dogImage, setDogImage] = useState('');
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    // Fetch a random dog image
    const fetchRandomDog = async () => {
      try {
        setImageLoading(true);
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await response.json();
        setDogImage(data.message);
      } catch (error) {
        console.error('Error fetching dog image:', error);
        // Fallback to a default image
        setDogImage('https://images.unsplash.com/photo-1583337436031-5c75c4d31d6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
      } finally {
        setImageLoading(false);
      }
    };

    fetchRandomDog();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Dog Image */}
        <div className="mb-8">
          {imageLoading ? (
            <div className="w-64 h-64 mx-auto rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-gray-400">Loading cute dog...</span>
            </div>
          ) : (
            <img
              src={dogImage}
              alt="Cute dog"
              className="w-64 h-64 mx-auto rounded-full shadow-2xl object-cover border-4 border-white"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1583337436031-5c75c4d31d6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
              }}
            />
          )}
        </div>

        {/* 404 Message */}
        <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Even this adorable dog couldn't find the page you're looking for. 
          It might have been moved, deleted, or never existed.
        </p>

        {/* Dog Quote */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-md mx-auto shadow-lg">
          <p className="text-gray-700 italic mb-2">
            "Woof! Sometimes the best pages are the ones we stumble upon by accident. 
            Let me help you find your way back home!"
          </p>
          <p className="text-sm text-gray-500">- Your Friendly Guide Dog 🐕</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🏠 Go Back Home
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🐕 New Dog Photo
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="inline-block bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-lg border border-gray-300 transition duration-300 shadow hover:shadow-md"
          >
            ⬅️ Go Back
          </button>
        </div>

        {/* Fun Dog Facts */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">While you're here, did you know?</h3>
          <p className="text-sm text-gray-600">
            Every time you refresh this page, you'll see a new adorable dog! 
            Dogs have been humanity's best friends for over 15,000 years. 🐕‍🦺
          </p>
        </div>

        {/* Image Attribution */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Dog images powered by <a href="https://dog.ceo/dog-api/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Dog CEO API</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;