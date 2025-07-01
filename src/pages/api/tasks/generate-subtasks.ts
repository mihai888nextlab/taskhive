import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Generate subtasks API called with method:", req.method);
  
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { title, description } = req.body;
  console.log("Received data:", { title, description });

  if (!title) {
    return res.status(400).json({ message: "Task title is required" });
  }

  try {
    // Create a prompt that will trigger the subtask generation logic in your Gemini API
    const prompt = `You are an expert project manager. Based on the following task, break it down into 3-5 specific, actionable subtasks.

Task Title: "${title}"
Task Description: "${description || 'No description provided'}"

Generate subtasks that:
- Are specific and actionable
- Break down the main task into logical steps
- Are realistic and achievable
- Follow a logical sequence
- Each subtask should be 3-8 words maximum

Return the response as a JSON array of objects with "title" and "description" fields for each subtask.
Example format:
[
  {"title": "Research requirements", "description": "Gather all necessary information and requirements"},
  {"title": "Create initial draft", "description": "Develop the first version of the deliverable"}
]

Only return the JSON array, no explanations or additional text.`;

    console.log("Calling Gemini API...");
    
    // Call your existing Gemini API endpoint
    const geminiRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/gemini`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Forward the authentication cookie
        "cookie": req.headers.cookie || ""
      },
      body: JSON.stringify({ prompt }),
    });

    console.log("Gemini API response status:", geminiRes.status);
    const geminiData = await geminiRes.json();
    console.log("Gemini API response data:", geminiData);
    
    if (!geminiData.response) {
      throw new Error("No response from AI service");
    }

    // Try to parse the JSON response from your Gemini API
    let subtasks;
    try {
      // Your Gemini API returns the subtasks as a JSON string in the response field
      subtasks = JSON.parse(geminiData.response);
      console.log("Parsed subtasks:", subtasks);
      
      if (!Array.isArray(subtasks)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      console.log("Raw response that failed to parse:", geminiData.response);
      
      // Fallback: create default subtasks based on the task title
      subtasks = generateSmartSubtasks(title, description);
      console.log("Using fallback subtasks:", subtasks);
    }

    // Validate and limit subtasks
    if (!Array.isArray(subtasks)) {
      subtasks = generateSmartSubtasks(title, description);
    }
    
    subtasks = subtasks.slice(0, 5).map(subtask => ({
      title: (subtask.title || "Subtask").substring(0, 100),
      description: (subtask.description || "").substring(0, 500)
    }));

    console.log("Final subtasks to return:", subtasks);
    res.status(200).json({ subtasks });
  } catch (error) {
    console.error("Error generating subtasks:", error);
    
    // Return smart fallback subtasks on error
    const fallbackSubtasks = generateSmartSubtasks(title, description);
    console.log("Using fallback subtasks due to error:", fallbackSubtasks);
    
    res.status(200).json({ subtasks: fallbackSubtasks });
  }
}

function generateSmartSubtasks(title: string, description?: string): Array<{title: string, description: string}> {
  const titleLower = title.toLowerCase();
  const descLower = (description || "").toLowerCase();
  
  // App/Software Development
  if (titleLower.includes("app") || titleLower.includes("software") || titleLower.includes("develop") || titleLower.includes("code")) {
    return [
      { title: "Plan requirements", description: "Define features, scope, and technical requirements" },
      { title: "Design architecture", description: "Create system design and user interface mockups" },
      { title: "Implement core features", description: "Develop the main functionality and components" },
      { title: "Test and debug", description: "Run tests, fix bugs, and ensure quality" },
      { title: "Deploy and document", description: "Release the application and create documentation" }
    ];
  }
  
  // Research/Analysis
  if (titleLower.includes("research") || titleLower.includes("analyze") || titleLower.includes("study")) {
    return [
      { title: "Define scope", description: "Clarify research objectives and methodology" },
      { title: "Gather information", description: "Collect relevant data and source materials" },
      { title: "Analyze findings", description: "Process and interpret the collected data" },
      { title: "Create report", description: "Compile findings into a comprehensive report" }
    ];
  }
  
  // Writing/Content Creation
  if (titleLower.includes("write") || titleLower.includes("content") || titleLower.includes("article") || titleLower.includes("blog")) {
    return [
      { title: "Outline structure", description: "Create a detailed outline and key points" },
      { title: "Research topic", description: "Gather information and supporting materials" },
      { title: "Write first draft", description: "Create the initial version of the content" },
      { title: "Edit and revise", description: "Review, refine, and polish the content" },
      { title: "Final review", description: "Proofread and prepare for publication" }
    ];
  }
  
  // Marketing/Promotion
  if (titleLower.includes("market") || titleLower.includes("promote") || titleLower.includes("campaign")) {
    return [
      { title: "Define target audience", description: "Identify and research the target market" },
      { title: "Create content strategy", description: "Develop messaging and content plan" },
      { title: "Design materials", description: "Create promotional graphics and copy" },
      { title: "Launch campaign", description: "Execute the marketing campaign across channels" },
      { title: "Monitor and optimize", description: "Track results and make improvements" }
    ];
  }
  
  // Meeting/Event Planning
  if (titleLower.includes("meeting") || titleLower.includes("event") || titleLower.includes("plan")) {
    return [
      { title: "Set agenda", description: "Define objectives and create detailed agenda" },
      { title: "Invite participants", description: "Send invitations and coordinate schedules" },
      { title: "Prepare materials", description: "Gather documents and presentation materials" },
      { title: "Conduct session", description: "Run the meeting or event effectively" },
      { title: "Follow up", description: "Share notes and action items with participants" }
    ];
  }
  
  // Design/Creative Work
  if (titleLower.includes("design") || titleLower.includes("creative") || titleLower.includes("ui") || titleLower.includes("ux")) {
    return [
      { title: "Research and inspiration", description: "Gather references and understand requirements" },
      { title: "Create concepts", description: "Develop initial design concepts and sketches" },
      { title: "Design iteration", description: "Refine designs based on feedback" },
      { title: "Finalize assets", description: "Create final design files and assets" }
    ];
  }
  
  // Default generic subtasks
  return [
    { title: "Plan approach", description: "Define strategy and break down the task into steps" },
    { title: "Gather resources", description: "Collect necessary materials and information" },
    { title: "Execute main work", description: "Perform the core activities of the task" },
    { title: "Review and finalize", description: "Check quality and complete final deliverables" }
  ];
}