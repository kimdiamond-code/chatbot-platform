// Upload Test Component - For debugging upload issues
import React, { useState } from 'react';
import { documentProcessor } from '../../services/knowledgeService';

const UploadTest = () => {
  const [uploadStatus, setUploadStatus] = useState('');
  const [testResult, setTestResult] = useState(null);

  const handleTestUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('Testing file upload...');
    setTestResult(null);

    try {
      console.log('Test: Starting file upload for', file.name);
      
      const result = await documentProcessor.processFile(file, (progress) => {
        console.log('Test: Upload progress:', progress);
        setUploadStatus(`Progress: ${progress.status} - ${progress.progress || 0}%`);
      });

      console.log('Test: Upload result:', result);
      
      if (result.success) {
        setTestResult(result);
        setUploadStatus(`✅ Success: Processed ${result.wordCount} words into ${result.chunkCount} chunks`);
      } else {
        setUploadStatus(`❌ Error: ${result.error}`);
      }

    } catch (error) {
      console.error('Test: Upload failed:', error);
      setUploadStatus(`❌ Exception: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🧪 Upload System Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test File Upload:</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleTestUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {uploadStatus && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-mono">{uploadStatus}</p>
          </div>
        )}

        {testResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <pre className="text-xs bg-white p-2 rounded overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadTest;