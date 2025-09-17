/* eslint-disable @typescript-eslint/no-explicit-any */
// import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

// Helper function to prepare the prompt based on course outline
const preparePrompt = (courseOutline: string) => {
  // Truncate text if too long
  const maxLength = 15000;
  const truncatedOutline = courseOutline.length > maxLength 
    ? courseOutline.substring(0, maxLength) + '...[outline truncated]' 
    : courseOutline;

  return `
    You are an experienced Nigerian engineering lecturer with over 15 years of teaching experience in Nigerian universities. Your task is to generate comprehensive study notes based on the following course outline.

    IMPORTANT GUIDELINES FOR STUDY NOTES:
    1. Structure notes to reflect typical Nigerian university engineering curriculum
    2. Include:
       - Detailed theoretical explanations
       - Practical applications relevant to Nigerian engineering context
       - Calculation examples with step-by-step solutions
       - Key formulas and derivations (formulas should be returned as human readable characters that do not require additional formatting not latex)
       - Potential exam-style insights
       - References to local engineering challenges and solutions

    For each topic/section, provide:
    {
      "topic": "Specific topic/section name",
      "content": "Comprehensive study notes including:",
      "keyDefinitions": ["List of crucial definitions"],
      "importantFormulas": [
        {
          "formula": "Mathematical representation",
          "explanation": "Detailed breakdown of formula",
          "exampleCalculation": {
            "problem": "Specific calculation scenario",
            "solution": "Step-by-step solution with working"
          }
        }
      ],
      "practicalApplications": ["Real-world engineering applications in Nigerian context"],
      "potentialExamQuestions": ["Sample questions that might appear in exams"]
    }

    Ensure the notes are:
    - Academically rigorous
    - Practically oriented
    - Aligned with COREN (Council for the Regulation of Engineering in Nigeria) standards
    - Written in clear, accessible language for engineering students
    - formulas should be returned as human readable characters that do not require additional formatting not latex

    Course Outline:
    ${truncatedOutline}
  `;
};

/**
 * Process LaTeX formulas to more readable text representations
 * @param obj - Object or string containing LaTeX formulas
 * @returns - Object or string with formatted formulas
 */
const processLatexFormulas = (obj: any): any => {
  // If this is a string that might contain LaTeX
  if (typeof obj === 'string') {
    // Replace LaTeX expressions with more readable versions
    let processed = obj;
    
    // Handle double backslashes from JSON escaping
    processed = processed.replace(/\\\\/g, '\\');
    
    // Process fractions \frac{numerator}{denominator}
    processed = processed.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)');
    
    // Process subscripts (_1 becomes ₁, etc.)
    processed = processed.replace(/_1/g, '₁')
                         .replace(/_2/g, '₂')
                         .replace(/_3/g, '₃')
                         .replace(/_4/g, '₄')
                         .replace(/_5/g, '₅')
                         .replace(/_6/g, '₆')
                         .replace(/_7/g, '₇')
                         .replace(/_8/g, '₈')
                         .replace(/_9/g, '₉')
                         .replace(/_0/g, '₀');
    
    // Process complex subscripts
    processed = processed.replace(/_\{([^}]*)\}/g, '₍$1₎');
    
    // Process superscripts (^2 remains as is, ^{expression} becomes ^(expression))
    processed = processed.replace(/\^\{([^}]*)\}/g, '^($1)');
    
    // Replace common Greek symbols
    processed = processed.replace(/\\partial/g, '∂')
                        .replace(/\\rho/g, 'ρ')
                        .replace(/\\nu/g, 'ν')
                        .replace(/\\Delta/g, 'Δ')
                        .replace(/\\alpha/g, 'α')
                        .replace(/\\beta/g, 'β')
                        .replace(/\\gamma/g, 'γ')
                        .replace(/\\omega/g, 'ω')
                        .replace(/\\Omega/g, 'Ω')
                        .replace(/\\theta/g, 'θ')
                        .replace(/\\lambda/g, 'λ')
                        .replace(/\\mu/g, 'μ')
                        .replace(/\\sigma/g, 'σ')
                        .replace(/\\tau/g, 'τ')
                        .replace(/\\phi/g, 'φ')
                        .replace(/\\pi/g, 'π');
    
    // Replace math operators and symbols
    processed = processed.replace(/\\cdot/g, '·')
                        .replace(/\\times/g, '×')
                        .replace(/\\leq/g, '≤')
                        .replace(/\\geq/g, '≥')
                        .replace(/\\approx/g, '≈')
                        .replace(/\\neq/g, '≠')
                        .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
                        .replace(/\\sum/g, '∑')
                        .replace(/\\prod/g, '∏')
                        .replace(/\\int/g, '∫')
                        .replace(/\\infty/g, '∞');
    
    return processed;
  } 
  // If this is an array, process each element
  else if (Array.isArray(obj)) {
    return obj.map(item => processLatexFormulas(item));
  } 
  // If this is an object, process each property
  else if (obj !== null && typeof obj === 'object') {
    const result: { [key: string]: any } = {};
    for (const key in obj) {
      result[key] = processLatexFormulas(obj[key]);
    }
    return result;
  }
  // Return anything else as is
  return obj;
};

/**
 * Parse JSON response from AI model and process LaTeX formulas
 * @param content - Raw content string from API response
 * @returns - Array of parsed and processed JSON objects
 */
const parseJsonResponse = (content: string) => {
  try {
    // Remove everything before the first '{'
    const jsonStartIndex = content.indexOf('{');
    if (jsonStartIndex === -1) {
      throw new Error("No JSON object found in content");
    }
    
    // Remove everything after the last '}'
    const jsonEndIndex = content.lastIndexOf('}') + 1;
    if (jsonEndIndex <= jsonStartIndex) {
      throw new Error("Invalid JSON structure in content");
    }

    // Extract the JSON content
    const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);

    // Try to parse multiple JSON objects
    const jsonObjects = [];
    let startIndex = 0;

    while (true) {
      // Find the next JSON object
      const nextOpenBrace = jsonContent.indexOf('{', startIndex);
      if (nextOpenBrace === -1) break;

      // Find the matching closing brace
      let bracketCount = 1;
      let endIndex = nextOpenBrace + 1;

      while (bracketCount > 0 && endIndex < jsonContent.length) {
        if (jsonContent[endIndex] === '{') bracketCount++;
        if (jsonContent[endIndex] === '}') bracketCount--;
        endIndex++;
      }

      // Extract the JSON object
      const objectStr = jsonContent.substring(nextOpenBrace, endIndex);
      
      try {
        // Parse the object first
        const parsedObject = JSON.parse(objectStr);
        
        // Process LaTeX formulas
        const processedObject = processLatexFormulas(parsedObject);
        
        jsonObjects.push(processedObject);
      } catch (parseError) {
        console.error('Failed to parse individual object:', parseError);
      }

      // Move start index
      startIndex = endIndex;
    }

    // Check if we found any valid objects
    if (jsonObjects.length === 0) {
      throw new Error("No valid JSON objects found");
    }

    // Return processed objects
    return jsonObjects;

  } catch (error: any) {
    console.error('Comprehensive parsing error:', error);
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
};

/**
 * Generate engineering study notes using Grok API
 * @param courseOutline - Course outline text
 * @returns - Array of study note objects with formatted formulas
 */

// export const generateStudyNotes = async (courseOutline: string) => {
//   try {
//     if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
//       console.warn('Using demo notes due to missing API key');
//       return generateDemoNotes();
//     }

//     const geminiai = new GoogleGenAI({
//       apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
//     })

//     const prompt = preparePrompt(courseOutline);

//     const response = await geminiai.models.generateContent({
//       model: "gemini-2.5-pro-exp-03-25",
//         contents: [
//           {
//             parts: [
//               {
//                 text: `You are an expert Nigerian engineering lecturer creating comprehensive study notes for university students. ${prompt}`
//               }
//             ]
//           }
//         ],
//       }
//     );

//     // Extract content from response
//     const content = response?.text || '';

//     // Log raw content for debugging
//     console.log(
//       'Raw response content preview:',
//       content.length > 200 ? content.substring(0, 200) + '...' : content
//     );

//     // Parsing with fallback
//     try {
//       // Use the enhanced parsing function that processes LaTeX formulas
//       const parsedNotes = parseJsonResponse(content);

//       // Validate parsed notes
//       if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
//         console.log(
//           `Successfully parsed ${parsedNotes.length} study notes with formatted formulas`
//         );
//         return parsedNotes;
//       }
//     } catch (parseError) {
//       console.error('Parsing failed:', parseError);
//     }

//     // Fallback to demo notes
//     console.warn('Falling back to demo notes due to parsing failure');
//     return generateDemoNotes();
//   } catch (error: any) {
//     console.error('Gemini AI Study Notes Generation Error:', error);
//     return generateDemoNotes();
//   }
// };


export const generateStudyNotes = async (courseOutline: string) => {
  try {
    if (!process.env.NEXT_PUBLIC_GROK_API_KEY) {
      console.warn('Using demo notes due to missing API key');
      return generateDemoNotes();
    }

    const prompt = preparePrompt(courseOutline);

    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions', 
      {
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert Nigerian engineering lecturer creating comprehensive study notes for university students.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        model: 'grok-3-mini-latest',
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract content from response
    const content = response.data.choices[0].message?.content || '';

    // Log raw content for debugging
    console.log('Raw response content preview:', 
      content.length > 200 ? content.substring(0, 200) + '...' : content);

    // Parsing with fallback
    try {
      // Use the enhanced parsing function that processes LaTeX formulas
      const parsedNotes = parseJsonResponse(content);
      
      // Validate parsed notes
      if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
        console.log(`Successfully parsed ${parsedNotes.length} study notes with formatted formulas`);
        return parsedNotes;
      }
    } catch (parseError) {
      console.error('Parsing failed:', parseError);
    }

    // Fallback to demo notes
    console.warn('Falling back to demo notes due to parsing failure');
    return generateDemoNotes();

  } catch (error: any) {
    console.error('Grok AI Study Notes Generation Error:', error);
    return generateDemoNotes();
  }
};

/**
 * Generate demo notes with pre-formatted LaTeX for testing
 * @returns - Array with sample study note objects
 */
export const generateDemoNotes = () => {
  return [
    {
      topic: "Introduction to Thermodynamics",
      content: "Thermodynamics is a branch of physics that deals with heat, work, temperature, and their relation to energy.",
      keyDefinitions: [
        "Thermodynamics: Study of heat and energy transformations",
        "System: A defined region for thermodynamic analysis"
      ],
      importantFormulas: [
        {
          formula: "Q = mc∆T",
          explanation: "Heat transfer calculation where Q is heat energy, m is mass, c is specific heat capacity, ∆T is temperature change",
          exampleCalculation: {
            problem: "Calculate the heat required to raise the temperature of 2 kg of water from 20°C to 80°C (specific heat of water = 4186 J/kg°C)",
            solution: `
              Q = m × c × ∆T
              Q = 2 kg × 4186 J/kg°C × (80°C - 20°C)
              Q = 2 × 4186 × 60
              Q = 501,120 J or 501.12 kJ
            `
          }
        },
        {
          formula: "(∂Q)/(∂t) = -k·A·(∂T)/(∂x)",
          explanation: "Fourier's Law of Heat Conduction, where k is thermal conductivity, A is cross-sectional area",
          exampleCalculation: {
            problem: "Find the heat flow through a concrete wall with k = 0.8 W/m·K, area 20 m², thickness 0.25 m, with inside temp 22°C and outside temp 5°C",
            solution: `
              Q/t = -k·A·(T₂-T₁)/x
              Q/t = -0.8 W/m·K × 20 m² × (5°C - 22°C)/0.25 m
              Q/t = -0.8 × 20 × (-17)/0.25
              Q/t = 0.8 × 20 × 17/0.25
              Q/t = 1088 W
            `
          }
        }
      ],
      practicalApplications: [
        "Designing cooling systems for Nigerian industrial processes",
        "Energy efficiency in thermal power plants",
        "Heat exchange in building materials for tropical climate adaptation"
      ],
      potentialExamQuestions: [
        "Explain the first law of thermodynamics with a practical example",
        "Derive the heat transfer equation and solve a numerical problem",
        "How does Fourier's Law apply to building insulation in hot climates?"
      ]
    }
  ];
};