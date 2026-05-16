import React from 'react';

/**
 * EvidenceTable Component
 * Table for displaying IBM Bob evidence/sessions with status indicators
 * 
 * @param {Array} sessions - Array of {stage, description, reportFile, status}
 */
const EvidenceTable = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No Bob session evidence available
      </div>
    );
  }

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      pending: 'bg-gray-100 text-gray-800 border-gray-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
    };
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-');
    return colors[normalizedStatus] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Status icon mapping
  const getStatusIcon = (status) => {
    const icons = {
      completed: '✓',
      'in-progress': '⟳',
      pending: '○',
      failed: '✗',
    };
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-');
    return icons[normalizedStatus] || '○';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              SDLC Stage
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Report File
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sessions.map((session, index) => (
            <tr 
              key={index} 
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-800">
                {session.stage}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {session.description}
              </td>
              <td className="px-6 py-4 text-sm">
                {session.reportFile ? (
                  <a
                    href={session.reportFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-mono"
                  >
                    {session.reportFile.split('/').pop()}
                  </a>
                ) : (
                  <span className="text-gray-400">No report</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                  <span>{getStatusIcon(session.status)}</span>
                  <span>{session.status}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvidenceTable;

// Made with Bob
