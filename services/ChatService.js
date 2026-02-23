import protocols from '../assets/protocols.json';

class ChatService {
  /**
   * Simulates sending a message to the AI and getting a grounded response.
   * In the MVP, this just searches the local protocols.json for keywords.
   */
  async sendMessage(message, healthData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();

    // Analyze message for improvement/score intent
    if (lowerMessage.includes('improve') || lowerMessage.includes('score') || lowerMessage.includes('better')) {
      if (healthData && healthData.diagnostics && healthData.diagnostics.length > 0) {
        let diagText = "Based on your recent data, here are the main areas to focus on to improve your score:\n\n";
        healthData.diagnostics.forEach((d) => {
          diagText += `• ${d}\n`;
        });
        diagText += "\nWhich of these protocols would you like to explore further?";

        return {
          role: 'assistant',
          content: diagText,
        };
      } else if (healthData && healthData.score > 90) {
        return {
          role: 'assistant',
          content: "Your Readiness Score is already excellent. Keep maintaining your current routine!",
        };
      }
    }

    // If no direct keyword match, fallback to logic based on scores/inferred intent
    if (matchedProtocols.length === 0) {
      if (lowerMessage.includes('deep sleep')) {
        matchedProtocols = protocols.filter(p => p.tags.includes('deep sleep'));
      } else if (lowerMessage.includes('rem')) {
        matchedProtocols = protocols.filter(p => p.tags.includes('rem'));
      } else if (lowerMessage.includes('hrv') || lowerMessage.includes('heart rate variability')) {
        matchedProtocols = protocols.filter(p => p.tags.includes('hrv'));
      } else if (healthData && healthData.score < 70) {
        matchedProtocols = [
          protocols.find(p => p.id === 'nsdr-huberman'),
          protocols.find(p => p.id === 'physiological-sigh')
        ].filter(Boolean);
      } else {
        // Generic fallback
        matchedProtocols = [
          protocols.find(p => p.id === 'morning-sunlight'),
          protocols.find(p => p.id === 'consistent-schedule')
        ].filter(Boolean);
      }
    }

    // Ensure we only provide a maximum of 3 options
    matchedProtocols = matchedProtocols.slice(0, 3);

    // Build the direct, fluff-free response
    let responseText = "";

    // Add a simple "why" based on the user's intent if it can be inferred
    if (lowerMessage.includes('deep sleep')) {
      responseText += "To improve Deep Sleep, you must facilitate the natural drop in core body temperature and promote early-day cortisol pulses.\n\n";
    } else if (lowerMessage.includes('rem')) {
      responseText += "To improve REM Sleep, you must strictly anchor your circadian rhythm and remove REM-suppressants from your evening routine.\n\n";
    } else if (lowerMessage.includes('hrv') || lowerMessage.includes('heart rate variability')) {
      responseText += "To increase HRV, you must manually stimulate the vagus nerve and shift your autonomic nervous system from sympathetic to parasympathetic dominance.\n\n";
    }

    matchedProtocols.forEach((p) => {
      responseText += `**${p.title}**\n`;
      responseText += `${p.description}\n`;
      responseText += `*Source: ${p.source_type}*\n\n`;
    });

    return {
      role: 'assistant',
      content: responseText.trim(),
    };
  }
}

export default new ChatService();
