import React, { useState } from 'react';
import Layout from '../components/Layout';
import SectionCard from '../components/SectionCard';
import EvidenceTable from '../components/EvidenceTable';

function BobEvidencePage() {
  // Hardcoded sessions for MVP - showing how IBM Bob was used to build BobForge
  const [sessions] = useState([
    {
      stage: 'Planning',
      description: 'Initial project planning and requirements gathering',
      reportFile: 'bob_sessions/01-planning-session.md',
      status: 'completed'
    },
    {
      stage: 'Backend Foundation',
      description: 'Backend architecture and API setup',
      reportFile: 'bob_sessions/02-backend-foundation.md',
      status: 'completed'
    },
    {
      stage: 'Generator Logic',
      description: 'Blueprint generator implementation',
      reportFile: 'bob_sessions/03-generator-logic.md',
      status: 'completed'
    },
    {
      stage: 'Frontend Development',
      description: 'React frontend implementation',
      reportFile: 'bob_sessions/04-frontend-development.md',
      status: 'completed'
    },
    {
      stage: 'Sample App Generation',
      description: 'Built Smart Attendance Demo from BobForge-generated blueprint',
      reportFile: 'bob_sessions/11-sample-app-built-by-bob.pdf',
      status: 'completed'
    },
    {
      stage: 'Testing & Documentation',
      description: 'Unit tests and documentation',
      reportFile: 'bob_sessions/06-testing-docs.md',
      status: 'in-progress'
    }
  ]);

  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const inProgressCount = sessions.filter(s => s.status === 'in-progress').length;
  const pendingCount = sessions.filter(s => s.status === 'pending').length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🤖 IBM Bob Evidence Dashboard
          </h1>
          <p className="text-gray-600">
            Documentation of IBM Bob's role in building BobForge
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="card bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{inProgressCount}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-600">{pendingCount}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <SectionCard title="About This Evidence" className="mb-8">
          <div className="prose max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">📝 Session Reports Location</h4>
              <p className="text-gray-700 text-sm">
                Detailed session reports documenting IBM Bob's contributions are stored in the <code className="bg-yellow-100 px-1 rounded">bob_sessions/</code> directory
                in the project root. These timestamped reports provide concrete evidence of Bob's involvement in each development phase.
                See <code className="bg-yellow-100 px-1 rounded">bob_sessions/README.md</code> for the expected format and structure.
              </p>
            </div>
            
            <p className="text-gray-700 mb-4">
              BobForge was built in collaboration with <strong>IBM Bob</strong>, demonstrating Bob's capabilities
              as a full Software Development Life Cycle (SDLC) partner. This dashboard tracks all the stages
              where Bob contributed to the development process.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <h4 className="font-semibold text-gray-800 mb-2">🎯 Hackathon Goal</h4>
              <p className="text-gray-700 text-sm">
                The IBM Bob Hackathon challenges participants to showcase Bob as a comprehensive development partner. 
                BobForge not only demonstrates this by being built with Bob, but also generates blueprints that 
                enable others to use Bob for their own projects.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
              How IBM Bob Contributed to BobForge:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Planning:</strong> Helped define project requirements, architecture, and implementation strategy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Backend Development:</strong> Generated Express.js API structure, routes, and generator modules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Generator Logic:</strong> Implemented PRD, architecture, schema, API, and test plan generators</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Frontend:</strong> Created React components, pages, and routing with Tailwind CSS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Sample Application:</strong> Built a complete Smart Attendance Management System using a BobForge-generated blueprint, demonstrating end-to-end SDLC capabilities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Testing:</strong> Assisted with test planning and quality assurance strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Documentation:</strong> Generated comprehensive documentation and usage guides</span>
              </li>
            </ul>
          </div>
        </SectionCard>

        {/* Sessions Table */}
        <SectionCard title="Development Sessions" className="mb-8">
          <EvidenceTable sessions={sessions} />
        </SectionCard>

        {/* Key Achievements */}
        <SectionCard title="🏆 Key Achievements" className="mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                <span>Full-Stack Development</span>
              </h4>
              <p className="text-gray-700 text-sm">
                Bob contributed to both backend (Node.js/Express) and frontend (React/Vite) development, 
                demonstrating versatility across the entire stack.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>Rapid Prototyping</span>
              </h4>
              <p className="text-gray-700 text-sm">
                With Bob's assistance, BobForge went from concept to working prototype in record time, 
                showcasing AI-accelerated development.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                <span>Iterative Refinement</span>
              </h4>
              <p className="text-gray-700 text-sm">
                Bob enabled rapid iteration cycles, allowing for continuous improvement and refinement 
                of features based on feedback.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span>Best Practices</span>
              </h4>
              <p className="text-gray-700 text-sm">
                Bob ensured code quality by following industry best practices, proper error handling, 
                and maintainable architecture patterns.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Sample App Showcase */}
        <SectionCard title="🎓 Sample Application: Smart Attendance Demo" className="mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">🎯</div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  Full Application Built from BobForge Blueprint
                </h4>
                <p className="text-gray-700 mb-4">
                  To demonstrate the complete workflow, IBM Bob built a production-ready Smart Attendance Management
                  System using a blueprint generated by BobForge. This proves the entire concept: BobForge creates
                  the blueprint, and Bob builds the application.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border border-indigo-200">
                <h5 className="font-semibold text-gray-800 mb-2">📦 What Was Built</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Complete MERN stack application</li>
                  <li>• Role-based authentication (Admin/Teacher/Student)</li>
                  <li>• Attendance marking and reporting system</li>
                  <li>• RESTful API with 20+ endpoints</li>
                  <li>• Responsive React frontend with 5+ pages</li>
                  <li>• Comprehensive test suite</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-gray-800 mb-2">⚡ Development Speed</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Blueprint generated in minutes</li>
                  <li>• Full application built in hours</li>
                  <li>• 33 tracked artifacts created</li>
                  <li>• Production-ready code quality</li>
                  <li>• Complete documentation included</li>
                  <li>• All from a single idea input</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-indigo-100 border-l-4 border-indigo-600 p-4">
              <p className="text-sm text-gray-800">
                <strong>📊 Evidence:</strong> All 33 artifacts from the Smart Attendance Demo are tracked in the
                Artifact Tracker, with references to the Bob session file (bob_sessions/11-sample-app-built-by-bob.pdf).
                This provides concrete proof of Bob's end-to-end SDLC capabilities.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Meta Achievement */}
        <div className="card bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🎯</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">
                The Meta Achievement
              </h3>
              <p className="text-blue-100 mb-4">
                BobForge is not just built with IBM Bob—it's a tool that enables others to leverage Bob's
                capabilities. By generating comprehensive blueprints and Bob-ready prompts, BobForge creates
                a multiplier effect, allowing countless developers to benefit from Bob's assistance.
              </p>
              <div className="bg-white/10 rounded-lg p-4 mb-3">
                <p className="text-sm text-blue-100">
                  <strong className="text-white">Impact:</strong> Every blueprint generated by BobForge becomes
                  a new opportunity for IBM Bob to demonstrate its value as a full SDLC partner, creating a
                  virtuous cycle of AI-assisted development.
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-blue-100">
                  <strong className="text-white">Proof of Concept:</strong> The Smart Attendance Demo validates
                  this entire workflow—BobForge generated the blueprint, IBM Bob built the application, and the
                  result is a production-ready system that would typically take weeks to develop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default BobEvidencePage;

// Made with Bob
