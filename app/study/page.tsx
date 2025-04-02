"use client";
import React, { useState, useRef } from "react";
import { Send, Clipboard, FileText, Loader2, Download } from "lucide-react";
import { generateStudyNotes, generateDemoNotes } from "../../lib/aiNotes";

// Updated interface to match the new generator
interface StudyNote {
  topic: string;
  content: string;
  keyDefinitions?: string[];
  importantFormulas?: {
    formula: string;
    explanation: string;
    exampleCalculation?: {
      problem: string;
      solution: string;
    };
  }[];
  practicalApplications?: string[];
  potentialExamQuestions?: string[];
}

const AIStudyBuddy: React.FC = () => {
  const [courseOutline, setCourseOutline] = useState<string>("");
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePasteOutline = () => {
    navigator.clipboard
      .readText()
      .then((clipText) => {
        setCourseOutline(clipText);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      })
      .catch((err) => {
        console.error("Failed to read clipboard:", err);
        setError("Failed to paste from clipboard");
      });
  };

  const generateNotes = async () => {
    // Clear previous state
    setStudyNotes([]);
    setError(null);
    setIsLoading(true);

    try {
      // For testing without API, use demo notes
      if (!process.env.NEXT_PUBLIC_GROK_API_KEY) {
        const demoNotes = generateDemoNotes();
        setStudyNotes(demoNotes);
        return;
      }

      // Actual API call
      const notes = await generateStudyNotes(courseOutline);
      setStudyNotes(notes);
    } catch (err) {
      console.error("Error generating study notes:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );

      // Fallback to demo notes on error
      const demoNotes = generateDemoNotes();
      setStudyNotes(demoNotes);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadStudyNotes = () => {
    const notesContent = studyNotes
      .map((note) => {
        let content = `Topic: ${note.topic}\n\n${note.content}\n\n`;

        if (note.keyDefinitions && note.keyDefinitions.length) {
          content +=
            "Key Definitions:\n" +
            note.keyDefinitions.map((def) => `- ${def}`).join("\n") +
            "\n\n";
        }

        if (note.importantFormulas && note.importantFormulas.length) {
          content +=
            "Important Formulas:\n" +
            note.importantFormulas
              .map(
                (formula) =>
                  `Formula: ${formula.formula}\n` +
                  `Explanation: ${formula.explanation}\n` +
                  (formula.exampleCalculation
                    ? `Example Calculation:\n  Problem: ${formula.exampleCalculation.problem}\n  Solution: ${formula.exampleCalculation.solution}\n`
                    : "")
              )
              .join("\n\n") +
            "\n\n";
        }

        if (note.practicalApplications && note.practicalApplications.length) {
          content +=
            "Practical Applications:\n" +
            note.practicalApplications.map((app) => `- ${app}`).join("\n") +
            "\n\n";
        }

        if (note.potentialExamQuestions && note.potentialExamQuestions.length) {
          content +=
            "Potential Exam Questions:\n" +
            note.potentialExamQuestions.map((q) => `- ${q}`).join("\n");
        }

        return content;
      })
      .join("\n\n---\n\n");

    const blob = new Blob([notesContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "comprehensive_study_notes.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-black to-gray-800 px-4 py-3">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FileText className="mr-3" /> Engineering Study Buddy
          </h1>
          <p className="text-white mt-2">
            Generate comprehensive study notes from your course outline
          </p>
        </div>

        <div className="p-6">
          <div className="mb-6 relative">
            <label
              htmlFor="course-outline"
              className="block text-black font-semibold mb-2"
            >
              Paste Your Course Outline
            </label>
            <textarea
              ref={textareaRef}
              id="course-outline"
              value={courseOutline}
              onChange={(e) => setCourseOutline(e.target.value)}
              placeholder="Paste your complete course outline here. Include all topics, subtopics, and any specific areas you want covered."
              className="w-full min-h-[200px] p-4 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={handlePasteOutline}
              className="absolute top-0 right-0 mt-8 mr-2 text-gray-500 hover:text-blue-600"
            >
              <Clipboard className="w-5 h-5" />
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={generateNotes}
              disabled={!courseOutline || isLoading}
              className="flex items-center justify-center w-full bg-black text-white py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" /> Generating Notes...
                </>
              ) : (
                <>
                  <Send className="mr-2" /> Generate Study Notes
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          {/* {studyNotes.length > 0 && (
            <div className="mt-8 text-black">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Generated Study Notes
                </h2>
                <button
                  onClick={downloadStudyNotes}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  <Download className="mr-2" /> Download Notes
                </button>
              </div>

              <div className="space-y-6">
                <pre className="bg-gray-100 p-6 rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
                  {typeof studyNotes === "string"
                    ? studyNotes
                    : JSON.stringify(studyNotes, null, 2)}
                </pre>
              </div>
            </div>
          )} */}

           {studyNotes.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Generated Study Notes
                </h2>
                <button
                  onClick={downloadStudyNotes}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  <Download className="mr-2" /> Download Notes
                </button>
              </div>

              <div className="space-y-6 text-black">
                {studyNotes.map((note, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 p-6 rounded-lg shadow-md"
                  >
                    <h3 className="text-xl font-semibold text-blue-700 mb-3">
                      {note.topic}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {note.content}
                    </p>
                    
                    {note.keyDefinitions && note.keyDefinitions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-blue-600 mb-2">Key Definitions</h4>
                        <ul className="list-disc list-inside text-gray-700">
                          {note.keyDefinitions.map((def, i) => (
                            <li key={i}>{def}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {note.importantFormulas && note.importantFormulas.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-blue-600 mb-2">Important Formulas</h4>
                        {note.importantFormulas.map((formula, i) => (
                          <div key={i} className="mb-3 bg-white p-3 rounded-md">
                            <p className="font-medium">Formula: {formula.formula}</p>
                            <p className="text-gray-700">{formula.explanation}</p>
                            {formula.exampleCalculation && (
                              <div className="mt-2 bg-gray-50 p-2 rounded-md">
                                <p className="font-medium">Example Calculation:</p>
                                <p>Problem: {formula.exampleCalculation.problem}</p>
                                <p className="whitespace-pre-wrap">Solution: {formula.exampleCalculation.solution}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {note.practicalApplications && note.practicalApplications.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-blue-600 mb-2">Practical Applications</h4>
                        <ul className="list-disc list-inside text-gray-700">
                          {note.practicalApplications.map((app, i) => (
                            <li key={i}>{app}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {note.potentialExamQuestions && note.potentialExamQuestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">Potential Exam Questions</h4>
                        <ul className="list-disc list-inside text-gray-700">
                          {note.potentialExamQuestions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIStudyBuddy;
