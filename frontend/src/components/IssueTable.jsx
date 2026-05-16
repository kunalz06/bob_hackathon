import React from 'react';

/**
 * IssueTable Component
 * Table for displaying GitHub issues with color-coded labels
 * 
 * @param {Array} issues - Array of {title, description, labels, assignee}
 */
const IssueTable = ({ issues }) => {
  if (!issues || issues.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No issues available
      </div>
    );
  }

  // Color mapping for issue labels
  const getLabelColor = (label) => {
    const colors = {
      feature: 'bg-blue-100 text-blue-800 border-blue-300',
      bug: 'bg-red-100 text-red-800 border-red-300',
      enhancement: 'bg-green-100 text-green-800 border-green-300',
      documentation: 'bg-purple-100 text-purple-800 border-purple-300',
      testing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      refactor: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    const normalizedLabel = label?.toLowerCase();
    return colors[normalizedLabel] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Labels
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Assignee
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {issues.map((issue, index) => (
            <tr 
              key={index} 
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-800">
                {issue.title}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                {issue.description}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {issue.labels && Array.isArray(issue.labels) ? (
                    issue.labels.map((label, labelIndex) => (
                      <span
                        key={labelIndex}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border ${getLabelColor(label)}`}
                      >
                        {label}
                      </span>
                    ))
                  ) : issue.labels ? (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getLabelColor(issue.labels)}`}>
                      {issue.labels}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">No labels</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {issue.assignee || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssueTable;

// Made with Bob
