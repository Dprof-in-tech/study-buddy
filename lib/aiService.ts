/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

// Helper function to prepare the prompt based on parameters
const preparePrompt = (text: any, numQuestions: any, difficulty: any) => {
  // Truncate text if too long
  const maxLength = 15000;
  const truncatedText = text.length > maxLength 
    ? text.substring(0, maxLength) + '...[text truncated]' 
    : text;

  const difficultyDescriptions: any = {
    easy: 'basic understanding and recall of concepts (suitable for continuous assessment tests)',
    medium: 'application of concepts and analysis (suitable for mid-semester examinations)',
    hard: 'deep analysis, synthesis of concepts, and challenging applications (suitable for final examinations)'
  };

  return `
    You are an experienced Nigerian engineering lecturer with over 15 years of teaching experience in Nigerian universities. Your task is to create ${numQuestions} study questions based on the following text.
    These questions should be at a ${difficulty} difficulty level (${difficultyDescriptions[difficulty]}).
    
    Each question should:
    1. Be relevant to the material
    2. Have a clear, correct answer
    3. Follow typical Nigerian university examination patterns
    4. Include detailed marking scheme and solution as would be provided in a marking guide
    5. ALWAYS include answer options regardless of question type
    
    For Nigerian engineering students, focus on:
    - Fundamental theory and definitions (Nigerian students are often tested on these)
    - Step-by-step problem-solving approaches (show all working)
    - Local applications relevant to Nigerian engineering challenges
    - Mathematical derivations and proofs where appropriate
    - Questions that might appear in professional examinations like COREN
    
    Format each question as a JSON object with the following structure:
    {
      "question": "The question text with mark allocation e.g. (5 marks)",
      "questionType": "multiple-choice OR calculation OR theory",
      "options": [
        "A. First option/answer",
        "B. Second option/answer",
        "C. Third option/answer",
        "D. Fourth option/answer"
      ],
      "correctAnswer": "The correct option (full text)",
      "correctAnswerFull": "The full correct answer with working/explanation",
      "markingScheme": "Breakdown of how marks would be allocated in a Nigerian university"
    }
    
    IMPORTANT: For ALL question types (including calculations and theory):
    - Always provide 4 possible answer options
    - For calculation questions, provide 4 different possible numerical answers
    - For theory questions, provide 4 different possible explanations or definitions
    - This allows students to test themselves in a multiple-choice format
    
    Return ONLY the JSON array of questions with no additional text.
    
    Here is the text:
    ${truncatedText}
  `;
};

// Helper function to parse JSON from AI responses
const parseJsonResponse = (content: any) => {
  try {
    // Look for JSON array in the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback to parsing the entire response
      return JSON.parse(content);
    }
  } catch (parseError: any) {
    console.error('Failed to parse response as JSON:', parseError);
    throw new Error(`Failed to parse questions: ${parseError.message}`);
  }
};

// Generate questions using OpenAI
export const generateWithOpenAI = async (text: any, numQuestions : any, difficulty : any) => {
  try {
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true 
    });

    const prompt = preparePrompt(text, numQuestions, difficulty);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an experienced Nigerian engineering lecturer with over 15 years of teaching experience in Nigerian universities' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    if (!response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    const content = response.choices[0].message.content;
    const questions = parseJsonResponse(content);

    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array of questions');
    }

    return questions;
  } catch (error: any) {
    console.error('OpenAI error:', error);
    throw new Error(`OpenAI question generation failed: ${error.message}`);
  }
};

// Generate questions using Claude
export const generateWithClaude = async (text: any, numQuestions: any, difficulty: any) => {
    try {
      // Get the API key
      const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      
      // Check if API key exists
      if (!apiKey) {
        throw new Error('Anthropic API key not found');
      }
  
      // Create the Anthropic client with the correct configuration
      const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
  
      const prompt = preparePrompt(text, numQuestions, difficulty);
  
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2500,
        temperature: 0.7,
        system: 'You are an expert Nigerian Lecturer for engineering students who specializes in creating study questions.',
        messages: [
          { role: 'user', content: prompt }
        ]
      });
  
      if (!response.content || response.content.length === 0) {
        throw new Error('Invalid response from Anthropic');
      }
  
      const content = (response.content[0] as any).text;
      const questions = parseJsonResponse(content);
  
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array of questions');
      }
  
      return questions;
    } catch (error : any) {
      console.error('Claude error:', error);
      throw new Error(`Claude question generation failed: ${error.message}`);
    }
  };

// Generate questions using Grok
export const generateWithGrok = async (text : any, numQuestions : any, difficulty: any) => {
    const apiKey = process.env.NEXT_PUBLIC_GROK_API_KEY;
  try {
    const prompt = preparePrompt(text, numQuestions, difficulty);

    // This is a placeholder for Grok API - you'll need to update this when Grok's API is available
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions', // replace with actual endpoint
      {
        messages: [
          { role: 'system', content: 'You are an experienced Nigerian engineering lecturer with over 15 years of teaching experience in Nigerian universities' },
          { role: 'user', content: prompt }
        ],
        model: 'grok-2-latest',
        temperature: 0,
       
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from Grok AI');
    }

    const content = response.data.choices[0].message.content;
    const questions = parseJsonResponse(content);

    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array of questions');
    }

    return questions;
  } catch (error: any) {
    console.error('Grok AI error:', error);
    throw new Error(`Grok AI question generation failed: ${error.message}`);
  }
};

// Generate offline demo questions (for testing without API keys)
export const generateDemoQuestions = () => {
  return [
    {
      "question": "What is the primary purpose of a heat exchanger in a thermal energy system?",
      "options": [
        "To increase the temperature of all fluids in the system",
        "To transfer heat between two or more fluids without mixing them",
        "To convert thermal energy directly into electrical energy",
        "To store excess thermal energy for later use"
      ],
      "correctAnswer": "To transfer heat between two or more fluids without mixing them",
      "explanation": "Heat exchangers are designed to efficiently transfer thermal energy (heat) between two or more fluids that are at different temperatures, while keeping these fluids physically separated to prevent mixing."
    },
    {
      "question": "In the context of structural engineering, what does the term 'factor of safety' represent?",
      "options": [
        "The ratio of ultimate stress to working stress",
        "The maximum load a structure can withstand",
        "The minimum time required for evacuation during failure",
        "The probability of structural failure under normal conditions"
      ],
      "correctAnswer": "The ratio of ultimate stress to working stress",
      "explanation": "Factor of safety is defined as the ratio of the ultimate stress (the stress at which structural failure occurs) to the working stress (the stress at normal operating conditions)."
    },
    {
      "question": "Which principle forms the basis of Newton's First Law of Motion?",
      "options": [
        "Conservation of energy",
        "Conservation of momentum",
        "Principle of relativity",
        "Principle of inertia"
      ],
      "correctAnswer": "Principle of inertia",
      "explanation": "Newton's First Law of Motion is based on the principle of inertia, which states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force."
    },
    {
      "question": "In electrical engineering, what does Ohm's Law describe?",
      "options": [
        "The relationship between current, voltage, and resistance",
        "The principles of electromagnetic induction",
        "The behavior of semiconductors in integrated circuits",
        "The conversion of electrical energy to mechanical energy"
      ],
      "correctAnswer": "The relationship between current, voltage, and resistance",
      "explanation": "Ohm's Law states that the current through a conductor between two points is directly proportional to the voltage across the two points, and inversely proportional to the resistance between them. The mathematical equation is I = V/R."
    },
    {
      "question": "What is the primary function of a Fourier transform in signal processing?",
      "options": [
        "To amplify weak signals",
        "To convert signals between time domain and frequency domain",
        "To filter out all noise from a signal",
        "To compress digital signals for efficient storage"
      ],
      "correctAnswer": "To convert signals between time domain and frequency domain",
      "explanation": "The Fourier transform is a mathematical operation that decomposes a signal into its constituent frequencies, converting a signal from time domain to frequency domain."
    }
  ];
};