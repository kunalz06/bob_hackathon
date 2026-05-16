import React from 'react';

/**
 * FeatureCard Component
 * Card component for displaying features/capabilities with icon
 * 
 * @param {string} title - Feature title
 * @param {string} description - Feature description
 * @param {string} icon - Icon (emoji or text)
 */
const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="card hover:shadow-xl transition-shadow duration-300 hover:scale-105 transform">
      <div className="text-center">
        {/* Icon */}
        <div className="text-5xl mb-4">
          {icon}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;

// Made with Bob
