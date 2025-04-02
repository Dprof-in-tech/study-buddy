/* eslint-disable @typescript-eslint/no-explicit-any */
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
       - Key formulas and derivations
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

    Course Outline:
    ${truncatedOutline}
  `;
};

// Generate study notes using Grok
const parseJsonResponse = (content: string) => {
  try {
    // Remove everything before the first '{'
    const jsonStartIndex = content.indexOf('{');
    
    // Remove everything after the last '}'
    const jsonEndIndex = content.lastIndexOf('}') + 1;

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
        const parsedObject = JSON.parse(objectStr);
        jsonObjects.push(parsedObject);
      } catch (parseError) {
        console.error('Failed to parse individual object:', parseError);
      }

      // Move start index
      startIndex = endIndex;
    }

    // Return parsed objects
    return jsonObjects;

  } catch (error: any) {
    console.error('Comprehensive parsing error:', error);
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
};

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
        model: 'grok-2-latest',
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

    // Parsing with fallback
    try {
      const parsedNotes = parseJsonResponse(content);
      
      // Validate parsed notes
      if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
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

// Fallback demo notes for testing
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
        }
      ],
      practicalApplications: [
        "Designing cooling systems for Nigerian industrial processes",
        "Energy efficiency in thermal power plants"
      ],
      potentialExamQuestions: [
        "Explain the first law of thermodynamics with a practical example",
        "Derive the heat transfer equation and solve a numerical problem"
      ]
    }
  ];
};