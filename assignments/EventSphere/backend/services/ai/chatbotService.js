import Event from '../../models/Event.js';
import Registration from '../../models/Registration.js';

export const processChatbotQuery = async (query, userId = null) => {
  try {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('event') || lowerQuery.includes('happening')) {
      const events = await Event.find({ date: { $gte: new Date() } })
        .sort({ date: 1 })
        .limit(5);
      
      if (events.length > 0) {
        const eventList = events.map(e => 
          `- ${e.title} on ${new Date(e.date).toLocaleDateString()} at ${e.location}`
        ).join('\n');
        
        return {
          response: `Here are our upcoming events:\n${eventList}\n\nWould you like more details about any of these?`,
          suggestions: events.map(e => e.title),
          type: 'events'
        };
      }
    }
    
    if (lowerQuery.includes('my registration') || lowerQuery.includes('my ticket')) {
      if (userId) {
        const registrations = await Registration.find({ userId })
          .populate('eventId')
          .sort({ createdAt: -1 });
        
        if (registrations.length > 0) {
          const regList = registrations.map(r => 
            `- ${r.eventId?.title || 'Event'} (Booking: ${r.bookingId})`
          ).join('\n');
          
          return {
            response: `Your registrations:\n${regList}`,
            suggestions: ['View ticket', 'Cancel registration'],
            type: 'registrations'
          };
        }
      }
      return {
        response: 'Please log in to view your registrations.',
        suggestions: ['Login', 'Sign up'],
        type: 'auth'
      };
    }
    
    if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('cheap')) {
      const events = await Event.find({ date: { $gte: new Date() } })
        .sort({ price: 1 })
        .limit(5);
      
      const eventList = events.map(e => 
        `- ${e.title}: ${e.price === 0 ? 'Free' : `₹${e.price}`}`
      ).join('\n');
      
      return {
        response: `Here are some affordable events:\n${eventList}`,
        suggestions: events.map(e => e.title),
        type: 'events'
      };
    }
    
    if (lowerQuery.includes('location') || lowerQuery.includes('near') || lowerQuery.includes('where')) {
      const events = await Event.find({ date: { $gte: new Date() } })
        .sort({ location: 1 })
        .limit(5);
      
      const locations = [...new Set(events.map(e => e.location))];
      
      return {
        response: `Events are happening at: ${locations.join(', ')}`,
        suggestions: locations,
        type: 'locations'
      };
    }
    
    if (lowerQuery.includes('help')) {
      return {
        response: `I can help you with:\n- Finding upcoming events\n- Checking your registrations\n- Event prices and locations\n- Booking tickets\n\nWhat would you like to know?`,
        suggestions: ['Upcoming events', 'My registrations', 'Prices', 'Help'],
        type: 'help'
      };
    }
    
    if (lowerQuery.includes('book') || lowerQuery.includes('register') || lowerQuery.includes('buy')) {
      return {
        response: 'To book tickets, please browse our events and click "Register" on the event you want to attend. You\'ll need to create an account or log in first.',
        suggestions: ['Browse events', 'Login', 'Sign up'],
        type: 'booking'
      };
    }
    
    return {
      response: `I didn't understand that. I can help you find events, check your registrations, or answer questions about booking. Try asking:\n- "What events are happening?"\n- "My registrations"\n- "Prices"\n- "Help"`,
      suggestions: ['Events', 'Prices', 'My registrations', 'Help'],
      type: 'general'
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    return {
      response: 'Sorry, I encountered an error. Please try again or contact support.',
      suggestions: ['Help', 'Contact support'],
      type: 'error'
    };
  }
};

export const getQuickReplies = (context = 'general') => {
  const quickReplies = {
    general: [
      'Show upcoming events',
      'Find events by price',
      'My registrations',
      'Help'
    ],
    events: [
      'View details',
      'Register now',
      'Similar events',
      'Back to menu'
    ],
    registration: [
      'View ticket',
      'Cancel',
      'More events',
      'Help'
    ]
  };
  
  return quickReplies[context] || quickReplies.general;
};
