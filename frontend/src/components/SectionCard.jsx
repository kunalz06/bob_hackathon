import React from 'react';

/**
 * SectionCard Component
 * Generic card wrapper for content sections with optional title
 * 
 * @param {string} title - Section title (optional)
 * @param {ReactNode} children - Card content
 * @param {string} className - Additional CSS classes (optional)
 */
const SectionCard = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {title}
          </h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default SectionCard;

// Made with Bob
