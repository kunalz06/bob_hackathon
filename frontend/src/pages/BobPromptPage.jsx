import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SectionCard from '../components/SectionCard';
import CopyButton from '../components/CopyButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBlueprintById } from '../api/client';

function BobPromptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      navigate(`/blueprints/${blueprintId}/bob-prompt`, { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getBlueprintById(blueprintId);
      // Extract blueprint from response (could be nested)
      const blueprintData = response.blueprint || response;
      setBlueprint(blueprintData);
    } catch (err) {
      console.error('Failed to load blueprint:', err);
      setError(err.message || 'Failed to load blueprint');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading Bob prompt..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Prompt</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/" className="btn-primary inline-block">
              Generate New Blueprint
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!blueprint || !blueprint.bobPrompt) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="text-gray-400 text-5xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Prompt Available</h2>
            <p className="text-gray-600 mb-6">
              This blueprint doesn't have a Bob prompt yet.
            </p>
            <Link to="/" className="btn-primary inline-block">
              Generate New Blueprint
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🤖 IBM Bob Build Prompt
              </h1>
              <p className="text-gray-600">
                For: {blueprint.name}
              </p>
            </div>
            <Link
              to={`/blueprints/${blueprint.id}`}
              className="btn-secondary"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                How to Use This Prompt
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Copy the entire prompt below using the copy button</li>
                <li>Open IBM Bob in your development environment</li>
                <li>Paste the prompt into IBM Bob's chat interface</li>
                <li>Let Bob build your complete application step by step</li>
                <li>Review and iterate on the generated code as needed</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Prompt Card */}
        <SectionCard 
          title="Build Prompt" 
          className="mb-6"
        >
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Copy this prompt and paste it into IBM Bob to build your application
            </p>
            <CopyButton 
              text={blueprint.bobPrompt} 
              label="📋 Copy Entire Prompt"
            />
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
              {blueprint.bobPrompt}
            </pre>
          </div>
        </SectionCard>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>✅</span>
              <span>What's Included</span>
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Complete project structure</li>
              <li>• Database schema and models</li>
              <li>• API endpoints and routes</li>
              <li>• Frontend components and pages</li>
              <li>• Authentication and authorization</li>
              <li>• Error handling and validation</li>
            </ul>
          </div>

          <div className="card bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>Pro Tips</span>
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Review the generated code carefully</li>
              <li>• Test each feature as it's built</li>
              <li>• Ask Bob to explain any unclear parts</li>
              <li>• Request modifications or improvements</li>
              <li>• Save Bob's responses for documentation</li>
              <li>• Iterate based on your specific needs</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to={`/blueprints/${blueprint.id}`}
            className="btn-secondary"
          >
            View Full Blueprint
          </Link>
          <Link
            to="/"
            className="btn-primary"
          >
            Generate Another Blueprint
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default BobPromptPage;

// Made with Bob
