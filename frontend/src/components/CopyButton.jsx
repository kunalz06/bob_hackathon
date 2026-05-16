import React, { useState } from 'react';

/**
 * CopyButton Component
 * Button for copying text to clipboard with visual feedback
 * 
 * @param {string} text - The text to copy to clipboard
 * @param {string} label - Button label (default: "Copy")
 */
const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      // Reset "Copied!" message after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Could add error state/toast notification here if needed
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="btn-secondary inline-flex items-center space-x-2"
      disabled={copied}
    >
      <span>{copied ? '✓' : '📋'}</span>
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
};

export default CopyButton;

// Made with Bob
