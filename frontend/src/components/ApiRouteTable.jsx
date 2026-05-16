import React from 'react';

/**
 * ApiRouteTable Component
 * Table for displaying API routes with color-coded HTTP methods
 * 
 * @param {Array} routes - Array of {method, path, description}
 */
const ApiRouteTable = ({ routes }) => {
  if (!routes || routes.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No API routes available
      </div>
    );
  }

  // Color mapping for HTTP methods
  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-800 border-green-300',
      POST: 'bg-blue-100 text-blue-800 border-blue-300',
      PUT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      PATCH: 'bg-orange-100 text-orange-800 border-orange-300',
      DELETE: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[method?.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Path
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {routes.map((route, index) => (
            <tr 
              key={index} 
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getMethodColor(route.method)}`}>
                  {route.method?.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 font-mono text-sm text-gray-800">
                {route.path}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {route.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApiRouteTable;

// Made with Bob
