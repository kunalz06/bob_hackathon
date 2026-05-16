import React, { useState } from 'react';

/**
 * SchemaTable Component
 * Table for displaying database schema with expandable table details
 * 
 * @param {Array} tables - Array of {name, fields: [{name, type, constraints}]}
 */
const SchemaTable = ({ tables }) => {
  const [expandedTables, setExpandedTables] = useState({});

  if (!tables || tables.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No database schema available
      </div>
    );
  }

  const toggleTable = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  return (
    <div className="space-y-4">
      {tables.map((table, tableIndex) => (
        <div key={tableIndex} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header - Clickable to expand/collapse */}
          <button
            onClick={() => toggleTable(table.name)}
            className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-gray-800">
                {table.name}
              </span>
              {table.fields && (
                <span className="text-sm text-gray-500">
                  ({table.fields.length} fields)
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-600 transform transition-transform ${
                expandedTables[table.name] ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Table Fields - Expandable */}
          {expandedTables[table.name] && table.fields && table.fields.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Field Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Constraints
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {table.fields.map((field, fieldIndex) => (
                    <tr key={fieldIndex} className={fieldIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 font-mono text-sm text-gray-800">
                        {field.name}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {field.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {field.constraints || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SchemaTable;

// Made with Bob
