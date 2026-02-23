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

    // Find matching protocols based on keywords
    let matchedProtocols = protocols.filter(p => {
      return p.title.toLowerCase().includes(lowerMessage) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerMessage)) ||
        p.description.toLowerCase().includes(lowerMessage);
    });

    if (matchedProtocols.length === 0) {
      if (lowerMessage.includes('deep sleep')) {
        matchedProtocols = [protocols.find(p => p.id === 'temperature-drop') || protocols[0]];
      } else if (lowerMessage.includes('rem')) {
        matchedProtocols = [protocols.find(p => p.id === 'magnesium-threonate') || protocols[0]];
      } else if (healthData && healthData.score < 70) {
        matchedProtocols = [protocols.find(p => p.id === 'nsdr-huberman') || protocols[0]];
      } else {
        matchedProtocols = [protocols.find(p => p.id === '4-7-8-breathing') || protocols[0]];
      }
    }

    // Format the response
    let responseText = "Based on your inquiry, here is a protocol to consider:\n\n";
    matchedProtocols.forEach((p, index) => {
      if (index > 1) return; // Limit to top 2 to avoid overwhelming
      responseText += `**${p.title}** (${p.category})\n`;
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
