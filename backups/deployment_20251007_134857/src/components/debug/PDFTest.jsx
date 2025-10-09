// PDF.js Test Component - To verify PDF processing works
import React, { useState, useEffect } from 'react';

const PDFTest = () => {
  const [pdfStatus, setPdfStatus] = useState('checking');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Check if PDF.js is loaded
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      setPdfStatus('available');
    } else {
      setPdfStatus('not-available');
    }
  }, []);

  const testPDFProcessing = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTestResult({ status: 'testing', message: 'Testing PDF processing...' });

    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js not available');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) { // Test first 3 pages
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      if (fullText.trim().length === 0) {
        setTestResult({
          status: 'error',
          message: 'No text found in PDF (might be image-based PDF)'
        });
      } else {
        setTestResult({
          status: 'success',
          message: `Successfully extracted ${fullText.length} characters from ${pdf.numPages} page(s)`,
          preview: fullText.substring(0, 300) + '...'
        });
      }

    } catch (error) {
      setTestResult({
        status: 'error',
        message: `PDF processing failed: ${error.message}`
      });
    }
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔍 PDF Processing Test</h3>
      
      <div className="space-y-3">
        <div className={`p-2 rounded text-sm ${
          pdfStatus === 'available' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <strong>PDF.js Status:</strong> {
            pdfStatus === 'available' ? '✅ Loaded and Ready' : '❌ Not Available'
          }
        </div>

        {pdfStatus === 'available' && (
          <div>
            <label className="block text-sm font-medium mb-2">Test PDF Upload:</label>
            <input
              type="file"
              accept=".pdf"
              onChange={testPDFProcessing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        )}

        {testResult && (
          <div className={`p-3 rounded text-sm ${
            testResult.status === 'success' ? 'bg-green-50 border border-green-200' :
            testResult.status === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <p className="font-medium">{testResult.message}</p>
            {testResult.preview && (
              <div className="mt-2 p-2 bg-white rounded text-xs font-mono">
                <strong>Text Preview:</strong><br/>
                {testResult.preview}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-600">
          <p><strong>Note:</strong> This test verifies PDF.js can extract text from your PDF files.</p>
          <p>Some PDFs (scanned images) may not contain extractable text.</p>
        </div>
      </div>
    </div>
  );
};

export default PDFTest;