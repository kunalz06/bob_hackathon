import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FeatureCard from '../components/FeatureCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateBlueprint } from '../api/client';

const EXAMPLE_IDEA = "A smart attendance system for schools that uses QR codes for check-in, tracks student attendance patterns, sends automated notifications to parents, and generates attendance reports for teachers and administrators.";

function IdeaInputPage() {
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError('Please enter a project idea');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await generateBlueprint(idea);
      
      // Extract blueprint ID from response (could be 'id' or 'projectId')
      const blueprintId = result.projectId || result.blueprint?.id || result.id;
      
      if (!blueprintId) {
        throw new Error('No blueprint ID returned from server');
      }
      
      // Navigate to the blueprint dashboard
      navigate(`/blueprints/${blueprintId}`);
    } catch (err) {
      console.error('Blueprint generation error:', err);
      setError(err.message || 'Failed to generate blueprint');
    } finally {
      setLoading(false);
    }
  };

  const handleTryExample = () => {
    setIdea(EXAMPLE_IDEA);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerate();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            Welcome to BobForge
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            AI-Powered App Factory for IBM Bob
          </p>
          <p className="text-gray-500">
            Transform your ideas into complete application blueprints in seconds
          </p>
        </div>

        {/* Main Input Card */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Describe Your Project Idea
          </h2>
          
          <textarea
            className="input-field w-full h-40 mb-4"
            placeholder="Enter your project idea here... Be as detailed as possible about features, users, and requirements."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              className="btn-primary flex-1"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Generating Blueprint...' : '🚀 Generate Blueprint'}
            </button>
            <button
              className="btn-secondary"
              onClick={handleTryExample}
              disabled={loading}
            >
              💡 Try Example
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Tip: Press Ctrl+Enter to generate
          </p>
        </div>

        {loading && (
          <div className="card">
            <LoadingSpinner message="Generating your application blueprint..." />
          </div>
        )}

        {/* Features Section */}
        {!loading && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              What BobForge Generates
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon="📋"
                title="Product Requirements"
                description="Detailed PRD with problem statement, target users, and feature specifications"
              />
              <FeatureCard
                icon="🏗️"
                title="System Architecture"
                description="Complete architecture design with technology stack and component structure"
              />
              <FeatureCard
                icon="🗄️"
                title="Database Schema"
                description="Normalized database schema with tables, fields, and relationships"
              />
              <FeatureCard
                icon="🔌"
                title="API Specification"
                description="RESTful API routes with methods, endpoints, and descriptions"
              />
              <FeatureCard
                icon="🎨"
                title="Frontend Pages"
                description="UI page structure with components and user flows"
              />
              <FeatureCard
                icon="🤖"
                title="IBM Bob Prompt"
                description="Ready-to-use prompt for IBM Bob to build your entire application"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default IdeaInputPage;

// Made with Bob
