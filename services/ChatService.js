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
    
    // Find matching protocols based on keywords
    let matchedProtocols = protocols.filter(p => {
        return p.title.toLowerCase().includes(lowerMessage) || 
               p.tags.some(tag => tag.toLowerCase().includes(lowerMessage)) ||
               p.description.toLowerCase().includes(lowerMessage);
    });

    if (matchedProtocols.length === 0) {
      // If no direct match, check health data and provide a general recommendation
      if (healthData && healthData.score < 70) {
        matchedProtocols = [protocols.find(p => p.id === 'magnesium-threonate') || protocols[0]];
      } else {
         matchedProtocols = [protocols.find(p => p.id === 'light-viewing') || protocols[0]];
      }
    }

    // Format the response based on the matched protocols
    let responseText = "Based on your inquiry and current data, here is a protocol to consider:\n\n";
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
