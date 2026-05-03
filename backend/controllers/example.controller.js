/**
 * Example Controller
 * Demonstrates controller pattern for handling requests
 */

/**
 * @desc    Get all items
 * @route   GET /api/items
 * @access  Public
 */
export const getItems = async (req, res, next) => {
  try {
    // Your logic here
    res.status(200).json({
      success: true,
      data: [],
      message: 'Items retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item
 * @route   GET /api/items/:id
 * @access  Public
 */
export const getItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Your logic here
    res.status(200).json({
      success: true,
      data: { id },
      message: 'Item retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new item
 * @route   POST /api/items
 * @access  Private
 */
export const createItem = async (req, res, next) => {
  try {
    const data = req.body;
    
    // Your logic here
    res.status(201).json({
      success: true,
      data,
      message: 'Item created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Private
 */
export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Your logic here
    res.status(200).json({
      success: true,
      data: { id, ...data },
      message: 'Item updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete item
 * @route   DELETE /api/items/:id
 * @access  Private
 */
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Your logic here
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Made with Bob
