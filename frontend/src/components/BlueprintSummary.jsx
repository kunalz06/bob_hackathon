import React from 'react';
import SectionCard from './SectionCard';

/**
 * BlueprintSummary Component
 * Displays blueprint overview with key information
 * 
 * @param {Object} blueprint - Blueprint object with name, description, targetUsers, features, techStack
 */
const BlueprintSummary = ({ blueprint }) => {
  if (!blueprint) {
    return (
      <SectionCard title="Blueprint Summary">
        <p className="text-gray-500">No blueprint data available</p>
      </SectionCard>
    );
  }

  const { name, description, targetUsers, features, techStack } = blueprint;

  return (
    <SectionCard title="Blueprint Summary">
      <div className="space-y-6">
        {/* Project Name */}
        {name && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Name</h3>
            <p className="text-gray-700">{name}</p>
          </div>
        )}

        {/* Description */}
        {description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Target Users */}
        {targetUsers && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Target Users</h3>
            <p className="text-gray-700">{targetUsers}</p>
          </div>
        )}

        {/* Features */}
        {features && features.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tech Stack */}
        {techStack && techStack.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Technology Stack</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {techStack.map((tech, index) => (
                <li key={index}>{tech}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default BlueprintSummary;

// Made with Bob
