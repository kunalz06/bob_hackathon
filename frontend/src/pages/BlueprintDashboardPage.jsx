import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SectionCard from '../components/SectionCard';
import BlueprintSummary from '../components/BlueprintSummary';
import ApiRouteTable from '../components/ApiRouteTable';
import SchemaTable from '../components/SchemaTable';
import IssueTable from '../components/IssueTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBlueprintById, exportBlueprint } from '../api/client';

function BlueprintDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadBlueprint();
  }, [id]);

  const loadBlueprint = async () => {
    // If no ID in URL, try to get from localStorage
    const blueprintId = id || localStorage.getItem('latestBlueprintId');
    
    if (!blueprintId) {
      setError('No blueprint found. Please generate one first.');
      setLoading(false);
      return;
    }

    // If we got ID from localStorage but not in URL, update URL
    if (!id && blueprintId) {
      navigate(`/blueprints/${blueprintId}`, { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getBlueprintById(blueprintId);
      // Extract blueprint from response (could be nested)
      const blueprintData = response.blueprint || response;
      setBlueprint(blueprintData);
      // Update localStorage with current blueprint
      localStorage.setItem('latestBlueprintId', blueprintId);
    } catch (err) {
      console.error('Failed to load blueprint:', err);
      setError(err.message || 'Failed to load blueprint');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportBlueprint(blueprint.id);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading blueprint..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Blueprint</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/" className="btn-primary inline-block">
              Generate New Blueprint
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!blueprint) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Blueprint Found</h2>
            <p className="text-gray-600 mb-6">
              Start by generating a blueprint from your project idea.
            </p>
            <Link to="/" className="btn-primary inline-block">
              Generate Blueprint
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {blueprint.name}
              </h1>
              <p className="text-gray-600">
                Generated on {new Date(blueprint.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="btn-secondary"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? '⏳ Exporting...' : '📥 Export Markdown'}
              </button>
              <Link
                to={`/blueprints/${blueprint.id}/bob-prompt`}
                className="btn-primary"
              >
                🤖 View Bob Prompt
              </Link>
            </div>
          </div>
        </div>

        {/* Blueprint Summary */}
        <BlueprintSummary blueprint={blueprint} />

        {/* Architecture */}
        {blueprint.architecture && (
          <SectionCard title="🏗️ System Architecture" className="mb-6">
            <div className="space-y-6">
              {/* Overview */}
              {blueprint.architecture.overview && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Overview</h3>
                  <p className="text-gray-700">{blueprint.architecture.overview}</p>
                </div>
              )}

              {/* Architecture Pattern */}
              {blueprint.architecture.architecturePattern && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Architecture Pattern</h3>
                  <p className="text-gray-700">{blueprint.architecture.architecturePattern}</p>
                </div>
              )}

              {/* Architecture Diagram */}
              {blueprint.architecture.architectureDiagramText && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Architecture Diagram</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {blueprint.architecture.architectureDiagramText}
                  </pre>
                </div>
              )}

              {/* Components */}
              {blueprint.architecture.components && blueprint.architecture.components.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Components</h3>
                  <div className="space-y-4">
                    {blueprint.architecture.components.map((component, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">{component.name}</h4>
                        <p className="text-gray-600 text-sm mb-3">{component.description}</p>
                        {component.technologies && component.technologies.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-gray-700">Technologies: </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {component.technologies.map((tech, techIndex) => (
                                <span key={techIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {component.responsibilities && component.responsibilities.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-gray-700">Responsibilities:</span>
                            <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                              {component.responsibilities.map((resp, respIndex) => (
                                <li key={respIndex}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Flow */}
              {blueprint.architecture.dataFlow && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Data Flow</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {blueprint.architecture.dataFlow}
                  </pre>
                </div>
              )}

              {/* Tech Stack */}
              {blueprint.architecture.techStack && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Technology Stack</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(blueprint.architecture.techStack).map(([category, details]) => (
                      <div key={category} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2 capitalize">{category}</h4>
                        <dl className="space-y-1">
                          {typeof details === 'object' && Object.entries(details).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <dt className="text-gray-600 capitalize inline">{key.replace(/([A-Z])/g, ' $1').trim()}: </dt>
                              <dd className="text-gray-800 inline">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Database Schema */}
        {blueprint.schema && blueprint.schema.tables && blueprint.schema.tables.length > 0 && (
          <SectionCard title="🗄️ Database Schema" className="mb-6">
            <SchemaTable tables={blueprint.schema.tables} />
          </SectionCard>
        )}

        {/* API Routes */}
        {blueprint.apiPlan && blueprint.apiPlan.routes && blueprint.apiPlan.routes.length > 0 && (
          <SectionCard title="🔌 API Routes" className="mb-6">
            <ApiRouteTable routes={blueprint.apiPlan.routes} />
          </SectionCard>
        )}

        {/* Frontend Pages */}
        {blueprint.frontendPlan && blueprint.frontendPlan.pages && blueprint.frontendPlan.pages.length > 0 && (
          <SectionCard title="🎨 Frontend Pages" className="mb-6">
            <div className="space-y-4">
              {blueprint.frontendPlan.pages.map((page, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">{page.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{page.description}</p>
                  {page.components && page.components.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Components: </span>
                      <span className="text-xs text-gray-700">
                        {page.components.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* GitHub Issues */}
        {blueprint.githubIssues && blueprint.githubIssues.length > 0 && (
          <SectionCard title="📝 GitHub Issues" className="mb-6">
            <IssueTable issues={blueprint.githubIssues} />
          </SectionCard>
        )}

        {/* Test Plan */}
        {blueprint.testPlan && (
          <SectionCard title="🧪 Test Plan" className="mb-6">
            <div className="space-y-4">
              {blueprint.testPlan.testCases && blueprint.testPlan.testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{testCase.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{testCase.description}</p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {testCase.type}
                    </span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Priority: {testCase.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Deployment Plan */}
        {blueprint.deploymentPlan && (
          <SectionCard title="🚀 Deployment Checklist" className="mb-6">
            <div className="space-y-2">
              {blueprint.deploymentPlan.steps && blueprint.deploymentPlan.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <span className="text-blue-600 font-bold">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="text-gray-800">{step.description}</p>
                    {step.notes && (
                      <p className="text-sm text-gray-600 mt-1">{step.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </Layout>
  );
}

export default BlueprintDashboardPage;

// Made with Bob
