/* eslint-disable @typescript-eslint/no-explicit-any */
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

const StudyNoteCard = ({ note }: { note: StudyNote }) => {
  return (
    <div className="bg-gray-100 shadow-md rounded-md p-4 mb-4">
      <h3 className="text-xl font-semibold text-blue-700 mb-2">{note.topic}</h3>
      <p className="text-gray-700 leading-relaxed mb-4">Comprehensive study notes</p>
      <div className="space-y-2">
        <p className="text-gray-700 leading-relaxed">{note.content}</p>

        {note.keyDefinitions && note.keyDefinitions.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-600">Key Definitions</h4>
            <ul className="list-disc list-inside text-gray-700">
              {note.keyDefinitions.map((def, i) => (
                <li key={i}>{def}</li>
              ))}
            </ul>
          </div>
        )}

        {note.importantFormulas && note.importantFormulas.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-600">Important Formulas</h4>
            {note.importantFormulas.map((formula, i) => {
              return (
                <div className="bg-white rounded-md p-3 mb-3" key={i}>
                  <p className="font-medium">Formula: {formula.formula}</p>
                  <p className="text-gray-700">{formula.explanation}</p>
                  {formula.exampleCalculation && (
                    <div className="mt-2 bg-gray-50 p-2 rounded-md">
                      <p className="font-medium">Example Calculation:</p>
                      <p className="whitespace-pre-wrap">
                        Solution: {formula.exampleCalculation.solution}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {note.practicalApplications && note.practicalApplications.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-600">Practical Applications</h4>
            <ul className="list-disc list-inside text-gray-700">
              {note.practicalApplications.map((app, i) => (
                <li key={i}>{app}</li>
              ))}
            </ul>
          </div>
        )}

        {note.potentialExamQuestions && note.potentialExamQuestions.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-600">Potential Exam Questions</h4>
            <ul className="list-disc list-inside text-gray-700">
              {note.potentialExamQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

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
    } catch (err: any) {
      console.error("Error generating study notes:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );

      // Fallback to demo notes on error.  Ensure demo notes match expected structure.
      const demoNotes = generateDemoNotes();
      setStudyNotes(Array.isArray(demoNotes) ? demoNotes : [demoNotes]);

    } finally {
      setIsLoading(false);
    }
  };

  const downloadStudyNotes = () => {
    if (!studyNotes || studyNotes.length === 0) return;

    try {
      // Handle the case where studyNotes is a single object
      const notesContent = Array.isArray(studyNotes)
        ? studyNotes
          .map((note) => convertNoteToText(note))  // Map array of notes
          .join("\n\n---\n\n") // Join notes with separator
        : convertNoteToText(studyNotes); // Handle single note object

      const blob = new Blob([notesContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `study_notes_on_${studyNotes[0].topic}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (e: any) {
      setError(`Error downloading file: ${e.message}`);
    }
  };

  // Helper function to convert a single StudyNote object to text format
  const convertNoteToText = (note: StudyNote): string => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div
          className="px-4 py-3"
          style={{
            backgroundImage:
              "linear-gradient(to right, black, #4a5568)",
          }}
        >
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
              className="w-full min-h-[200px] p-4 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
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
              className={
                "w-full bg-black text-white py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition flex items-center justify-center"
              }
              style={{
                backgroundColor: isLoading ? "#718096" : "black",
                color: "white",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                ...(isLoading
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : {
                    ":hover": { backgroundColor: "#4a5568" },
                    transition: "background-color 0.3s ease",
                  }),
              }}
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
            <div
              className="mt-4 px-4 py-3 rounded relative"
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
              }}
            >
              {error}
            </div>
          )}

          {studyNotes && studyNotes.length > 0 && (
            <div className="mt-8 text-black">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Generated Study Notes
                </h2>
                <button
                  onClick={downloadStudyNotes}
                  className="bg-green-500 text-white hover:bg-green-600 flex items-center px-4 py-2 rounded-md"
                  style={{
                    backgroundColor: "#16a34a",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    // ":hover": { backgroundColor: "#15803d" },
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Download className="mr-2" /> Download Notes
                </button>
              </div>
              {Array.isArray(studyNotes) ? (
                studyNotes.map((note, index) => (
                  <StudyNoteCard key={index} note={note} />
                ))
              ) : (
                <StudyNoteCard note={studyNotes} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIStudyBuddy;
