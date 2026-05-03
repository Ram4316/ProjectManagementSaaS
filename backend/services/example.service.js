/**
 * Example Service
 * Contains business logic separated from controllers
 */

/**
 * Process data with business logic
 */
export const processData = async (data) => {
  try {
    // Perform complex business logic here
    const processed = {
      ...data,
      processedAt: new Date(),
      status: 'processed'
    };

    return {
      success: true,
      data: processed
    };
  } catch (error) {
    throw new Error(`Data processing failed: ${error.message}`);
  }
};

/**
 * Validate business rules
 */
export const validateBusinessRules = (data) => {
  const errors = [];

  // Example validation rules
  if (!data.title || data.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    errors: []
  };
};

/**
 * Calculate statistics
 */
export const calculateStats = async (items) => {
  try {
    const stats = {
      total: items.length,
      active: items.filter(item => item.status === 'active').length,
      inactive: items.filter(item => item.status === 'inactive').length,
      pending: items.filter(item => item.status === 'pending').length
    };

    return stats;
  } catch (error) {
    throw new Error(`Stats calculation failed: ${error.message}`);
  }
};

/**
 * Send notification (example)
 */
export const sendNotification = async (userId, message) => {
  try {
    // Implement notification logic (email, SMS, push, etc.)
    console.log(`Notification sent to user ${userId}: ${message}`);
    
    return {
      success: true,
      message: 'Notification sent successfully'
    };
  } catch (error) {
    throw new Error(`Notification failed: ${error.message}`);
  }
};

/**
 * Generate report
 */
export const generateReport = async (filters) => {
  try {
    // Implement report generation logic
    const report = {
      generatedAt: new Date(),
      filters,
      data: [],
      summary: {}
    };

    return report;
  } catch (error) {
    throw new Error(`Report generation failed: ${error.message}`);
  }
};

// Made with Bob
